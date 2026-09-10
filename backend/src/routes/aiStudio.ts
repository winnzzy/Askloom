import { Router, Request, Response } from "express";
import axios from "axios";
import { z } from "zod";
import { config } from "../config/env";
import { getActivePlanForUser } from "../services/subscription";
import { checkAndIncrementUsage } from "../services/usage";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const studioSchema = z.object({
  topic: z.string().trim().min(3).max(240),
  format: z.enum(["youtube", "shorts", "article"]).default("youtube"),
  audience: z.string().trim().max(160).optional().default("general audience"),
  tone: z.enum(["educational", "conversational", "authoritative", "storytelling"]).default("educational"),
});

function extractJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

router.post("/ai-studio/generate", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });

  const activePlan = await getActivePlanForUser(req.user.id);
  if (!activePlan) {
    return res.status(403).json({ error: "AI Studio is a Creator plan feature. Upgrade to use it." });
  }

  const parsed = studioSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid AI Studio request" });
  if (!config.geminiApiKey) return res.status(503).json({ error: "AI Studio is not configured yet" });

  const allowed = await checkAndIncrementUsage({
    userId: req.user.id,
    field: "scriptHookCount",
    limit: activePlan.scriptHookLimit,
  });
  if (!allowed) return res.status(429).json({ error: "AI generation usage limit reached." });

  const { topic, format, audience, tone } = parsed.data;
  const prompt = `You are AskLoom AI Studio, a content strategist for creators and marketing teams.\n\nCreate a practical content package from this validated audience opportunity:\nTopic: ${topic}\nPrimary format: ${format}\nAudience: ${audience}\nTone: ${tone}\n\nReturn ONLY valid JSON with this exact shape:\n{\n  "titles": ["5 compelling title options"],\n  "hooks": ["3 opening hooks"],\n  "contentBrief": "A concise strategic brief explaining audience need, promise and angle.",\n  "outline": [{"section":"Section name","points":["point 1","point 2"]}],\n  "script": "A useful draft script suitable for the requested format. Do not invent statistics, quotes, sources or factual claims that were not provided. Mark places requiring factual research with [VERIFY].",\n  "shorts": [{"title":"Short variation title","hook":"opening","body":"short-form body","cta":"CTA"}],\n  "description": "Publish-ready description that does not make unsupported claims.",\n  "nextSteps": ["3 concrete research or production actions"]\n}\n\nGenerate 3 shorts variations. Keep the package specific to the search intent behind the topic. Never fabricate evidence.`;

  try {
    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${config.geminiApiKey}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } },
      { timeout: 30000 }
    );
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const content = extractJson(text);
    return res.json({ topic, format, audience, tone, content });
  } catch (error) {
    return res.status(502).json({ error: "AI Studio could not generate this package. Please try again." });
  }
}));

export default router;

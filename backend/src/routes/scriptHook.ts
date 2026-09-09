import { Router, Request, Response } from "express";
import axios from "axios";
import { z } from "zod";
import { config } from "../config/env";
import { getActivePlanForUser } from "../services/subscription";
import { checkAndIncrementUsage } from "../services/usage";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const scriptHookSchema = z.object({
  phrase: z.string().trim().min(3).max(240),
});

router.post("/script-hook", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const activePlan = await getActivePlanForUser(req.user.id);
  if (!activePlan) {
    return res.status(403).json({
      error: "Script-hook generation is a Creator plan feature. Upgrade to use it.",
    });
  }

  const parsed = scriptHookSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid phrase" });
  const { phrase } = parsed.data;

  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  const allowed = await checkAndIncrementUsage({
    userId: req.user.id,
    field: "scriptHookCount",
    limit: activePlan.scriptHookLimit,
  });

  if (!allowed) {
    return res.status(429).json({ error: "Script-hook usage limit reached." });
  }

  try {
    const prompt = `You write short, punchy YouTube video hooks for content creators. 
Given this audience search query: "${phrase}"
Write exactly 3 short options (max 15 words each) for a video title/hook that would satisfy someone searching this. 
Return them as a plain numbered list, nothing else.`;

    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { timeout: 15000 }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ phrase, hooks: text });
  } catch (err) {
    res.status(502).json({ error: "Failed to generate script hooks" });
  }
}));

export default router;

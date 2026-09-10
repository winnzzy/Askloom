import { Router, Request, Response } from "express";
import axios from "axios";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "../lib/prisma";
import { config } from "../config/env";
import { getActivePlanForUser } from "../services/subscription";
import { checkAndIncrementUsage } from "../services/usage";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const sections = ["titles", "hooks", "contentBrief", "outline", "script", "shorts", "description", "nextSteps"] as const;

const studioSchema = z.object({
  topic: z.string().trim().min(3).max(240),
  format: z.enum(["youtube", "shorts", "article"]).default("youtube"),
  audience: z.string().trim().max(160).optional().default("general audience"),
  tone: z.enum(["educational", "conversational", "authoritative", "storytelling"]).default("educational"),
  opportunityId: z.string().uuid().nullable().optional(),
});

const regenerateSchema = z.object({ section: z.enum(sections) });

function extractJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function requireAiAllowance(userId: string) {
  const activePlan = await getActivePlanForUser(userId);
  if (!activePlan) return { ok: false as const, status: 403, error: "AI Studio is a Creator plan feature. Upgrade to use it." };
  if (!config.geminiApiKey) return { ok: false as const, status: 503, error: "AI Studio is not configured yet" };
  const allowed = await checkAndIncrementUsage({ userId, field: "scriptHookCount", limit: activePlan.scriptHookLimit });
  if (!allowed) return { ok: false as const, status: 429, error: "AI generation usage limit reached." };
  return { ok: true as const };
}

async function callGemini(prompt: string) {
  const response = await axios.post(
    `${GEMINI_ENDPOINT}?key=${config.geminiApiKey}`,
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } },
    { timeout: 30000 }
  );
  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  return extractJson(text);
}

router.get("/ai-studio/assets", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const opportunityId = typeof req.query.opportunityId === "string" ? req.query.opportunityId : undefined;
  const assets = await prisma.studioAsset.findMany({
    where: { userId: req.user.id, ...(opportunityId ? { opportunityId } : {}) },
    include: { opportunity: { select: { id: true, phrase: true } }, project: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ assets });
}));

router.post("/ai-studio/generate", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const parsed = studioSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid AI Studio request" });

  const allowance = await requireAiAllowance(req.user.id);
  if (!allowance.ok) return res.status(allowance.status).json({ error: allowance.error });

  const { topic, format, audience, tone, opportunityId } = parsed.data;
  let projectId: string | null = null;
  if (opportunityId) {
    const opportunity = await prisma.savedOpportunity.findFirst({
      where: { id: opportunityId, userId: req.user.id },
      select: { id: true, projectId: true },
    });
    if (!opportunity) return res.status(404).json({ error: "Saved opportunity not found" });
    projectId = opportunity.projectId;
  }

  const prompt = `You are AskLoom AI Studio, a content strategist for creators and marketing teams.\n\nCreate a practical content package from this validated audience opportunity:\nTopic: ${topic}\nPrimary format: ${format}\nAudience: ${audience}\nTone: ${tone}\n\nReturn ONLY valid JSON with this exact shape:\n{\n  "titles": ["5 compelling title options"],\n  "hooks": ["3 opening hooks"],\n  "contentBrief": "A concise strategic brief explaining audience need, promise and angle.",\n  "outline": [{"section":"Section name","points":["point 1","point 2"]}],\n  "script": "A useful draft script suitable for the requested format. Do not invent statistics, quotes, sources or factual claims that were not provided. Mark places requiring factual research with [VERIFY].",\n  "shorts": [{"title":"Short variation title","hook":"opening","body":"short-form body","cta":"CTA"}],\n  "description": "Publish-ready description that does not make unsupported claims.",\n  "nextSteps": ["3 concrete research or production actions"]\n}\n\nGenerate 3 shorts variations. Keep the package specific to the search intent behind the topic. Never fabricate evidence.`;

  try {
    const content = await callGemini(prompt);
    const latest = opportunityId
      ? await prisma.studioAsset.aggregate({ where: { userId: req.user.id, opportunityId }, _max: { version: true } })
      : null;
    const version = (latest?._max.version ?? 0) + 1;
    const asset = await prisma.studioAsset.create({
      data: {
        userId: req.user.id,
        opportunityId: opportunityId ?? null,
        projectId,
        topic,
        format,
        audience,
        tone,
        version,
        content: asInputJson(content),
      },
      include: { opportunity: { select: { id: true, phrase: true } }, project: { select: { id: true, name: true } } },
    });
    return res.json({ asset, content });
  } catch {
    return res.status(502).json({ error: "AI Studio could not generate this package. Please try again." });
  }
}));

router.post("/ai-studio/assets/:id/regenerate", asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const parsed = regenerateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid section" });

  const existing = await prisma.studioAsset.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ error: "AI Studio asset not found" });

  const allowance = await requireAiAllowance(req.user.id);
  if (!allowance.ok) return res.status(allowance.status).json({ error: allowance.error });

  const section = parsed.data.section;
  const current = existing.content as Record<string, unknown>;
  const prompt = `You are improving one section of an existing AskLoom content package.\nTopic: ${existing.topic}\nFormat: ${existing.format}\nAudience: ${existing.audience}\nTone: ${existing.tone}\nSection to regenerate: ${section}\n\nExisting package JSON:\n${JSON.stringify(current)}\n\nReturn ONLY valid JSON in this exact shape: {"value": <replacement value for the ${section} field>}. Keep the field's original data type. Improve specificity and usefulness. Never invent statistics, quotations, sources or unsupported factual claims; mark factual claims requiring research with [VERIFY].`;

  try {
    const generated = await callGemini(prompt);
    const nextContent = { ...current, [section]: generated.value };
    const latest = existing.opportunityId
      ? await prisma.studioAsset.aggregate({ where: { userId: req.user.id, opportunityId: existing.opportunityId }, _max: { version: true } })
      : await prisma.studioAsset.aggregate({ where: { userId: req.user.id, topic: existing.topic }, _max: { version: true } });
    const asset = await prisma.studioAsset.create({
      data: {
        userId: req.user.id,
        opportunityId: existing.opportunityId,
        projectId: existing.projectId,
        topic: existing.topic,
        format: existing.format,
        audience: existing.audience,
        tone: existing.tone,
        version: (latest._max.version ?? existing.version) + 1,
        content: asInputJson(nextContent),
      },
      include: { opportunity: { select: { id: true, phrase: true } }, project: { select: { id: true, name: true } } },
    });
    return res.json({ asset, content: nextContent, regeneratedSection: section });
  } catch {
    return res.status(502).json({ error: "AI Studio could not regenerate this section. Please try again." });
  }
}));

export default router;

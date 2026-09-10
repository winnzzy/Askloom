import { Router, Request, Response } from "express";
import NodeCache from "node-cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { gatherSuggestions } from "../utils/autocomplete";
import { clusterResults, groupByCategory, type ClusteredResult } from "../utils/cluster";
import { getActivePlanForUser } from "../services/subscription";
import { checkAndIncrementUsage } from "../services/usage";
import {
  getTopicMomentum,
  recordSearchSignal,
  SUPPORTED_LANGUAGES,
  SUPPORTED_MARKETS,
} from "../services/intelligence";
import { scoreOpportunities } from "../services/opportunity";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 });
const FREE_DAILY_LIMIT = 5;

const suggestSchema = z.object({
  seed: z.string().trim().min(1).max(120),
  sources: z
    .array(z.enum(["google", "youtube"]))
    .min(1)
    .max(2)
    .optional()
    .transform((sources): ("google" | "youtube")[] => sources ?? ["google", "youtube"]),
  language: z.enum(SUPPORTED_LANGUAGES).default("en"),
  market: z.enum(SUPPORTED_MARKETS).default("NG"),
});

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function persistSearchHistory(userId: string | undefined, seed: string, sources: string[], grouped: unknown, total: number) {
  if (!userId) return;
  await prisma.searchHistory.create({
    data: { userId, seed, sources: toJson(sources), grouped: toJson(grouped), total },
  });
}

function flattenGrouped(grouped: unknown): ClusteredResult[] {
  if (!grouped || typeof grouped !== "object") return [];
  const out: ClusteredResult[] = [];
  for (const [category, rawSubgroups] of Object.entries(grouped as Record<string, unknown>)) {
    if (!rawSubgroups || typeof rawSubgroups !== "object") continue;
    for (const [subgroup, rawPhrases] of Object.entries(rawSubgroups as Record<string, unknown>)) {
      if (!Array.isArray(rawPhrases)) continue;
      for (const phrase of rawPhrases) {
        if (typeof phrase !== "string") continue;
        out.push({ category: category as ClusteredResult["category"], subgroup, phrase });
      }
    }
  }
  return out;
}

router.post("/suggest", asyncHandler(async (req: Request, res: Response) => {
  const parsed = suggestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid search request" });

  const { seed, sources, language, market } = parsed.data;
  const userId = req.user?.id;
  const activePlan = userId ? await getActivePlanForUser(userId) : null;
  const limit = activePlan ? activePlan.dailySearchLimit : FREE_DAILY_LIMIT;
  const anonymousKey = req.ip || "anonymous";

  const allowed = await checkAndIncrementUsage({ userId, anonymousKey, field: "searchCount", limit });
  if (!allowed) {
    return res.status(429).json({
      error: `Search limit reached (${limit} searches/day). Upgrade to Creator for unlimited searches.`,
    });
  }

  const topicMomentum = await getTopicMomentum({ seed, language, market }).catch(() => 0);
  const cacheKey = `${seed.toLowerCase()}::${sources.join(",")}::${language}::${market}`;
  const cached = cache.get(cacheKey) as { grouped: unknown; total: number } | undefined;

  if (cached) {
    const opportunities = scoreOpportunities(flattenGrouped(cached.grouped), topicMomentum).slice(0, 24);
    await persistSearchHistory(userId, seed, sources, cached.grouped, cached.total);
    await recordSearchSignal({ seed, language, market, sources, resultCount: cached.total }).catch(() => undefined);
    return res.json({
      seed,
      cached: true,
      language,
      market,
      methodology: "beta-structural-v1",
      opportunities,
      ...cached,
    });
  }

  const rawPhrases = await gatherSuggestions(seed, sources, { language, market });
  const clustered = clusterResults(seed, rawPhrases);
  const grouped = groupByCategory(clustered);
  const payload = { grouped, total: clustered.length };
  const opportunities = scoreOpportunities(clustered, topicMomentum).slice(0, 24);
  cache.set(cacheKey, payload);

  await persistSearchHistory(userId, seed, sources, grouped, clustered.length);
  await recordSearchSignal({ seed, language, market, sources, resultCount: clustered.length }).catch(() => undefined);

  return res.json({
    seed,
    cached: false,
    language,
    market,
    methodology: "beta-structural-v1",
    opportunities,
    ...payload,
  });
}));

export default router;

import { Router, Request, Response } from "express";
import NodeCache from "node-cache";
import { Prisma } from "@prisma/client";
import { gatherSuggestions } from "../utils/autocomplete";
import { clusterResults, groupByCategory } from "../utils/cluster";
import { getActivePlanForUser } from "../services/subscription";
import { checkAndIncrementUsage } from "../services/usage";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Cache raw results for 24h per seed keyword - autocomplete data doesn't
// change fast enough to justify re-scraping on every request.
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 });

const FREE_DAILY_LIMIT = 5;

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

router.post("/suggest", asyncHandler(async (req: Request, res: Response) => {
  const { seed, sources } = req.body as {
    seed?: string;
    sources?: ("google" | "youtube")[];
  };

  if (!seed || !seed.trim()) {
    return res.status(400).json({ error: "seed keyword is required" });
  }

  const userId = req.user?.id;
  const activePlan = userId ? await getActivePlanForUser(userId) : null;
  const limit = activePlan ? activePlan.dailySearchLimit : FREE_DAILY_LIMIT;
  const anonymousKey = req.ip || "anonymous";

  const allowed = await checkAndIncrementUsage({
    userId,
    anonymousKey,
    field: "searchCount",
    limit,
  });

  if (!allowed) {
    return res.status(429).json({
      error: `Search limit reached (${limit} searches/day). Upgrade to Creator for unlimited searches.`,
    });
  }

  const cacheKey = `${seed.toLowerCase().trim()}::${(sources || ["google", "youtube"]).join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    if (userId) {
      const cachedPayload = cached as { grouped: unknown; total: number };
      await prisma.searchHistory.create({
        data: {
          userId,
          seed: seed.trim(),
          sources: toJson(sources || ["google", "youtube"]),
          grouped: toJson(cachedPayload.grouped),
          total: cachedPayload.total,
        },
      });
    }
    return res.json({ seed, cached: true, ...(cached as object) });
  }

  const rawPhrases = await gatherSuggestions(seed, sources);
  const clustered = clusterResults(seed, rawPhrases);
  const grouped = groupByCategory(clustered);

  const payload = { grouped, total: clustered.length };
  cache.set(cacheKey, payload);

  if (userId) {
    await prisma.searchHistory.create({
      data: {
        userId,
        seed: seed.trim(),
        sources: toJson(sources || ["google", "youtube"]),
        grouped: toJson(grouped),
        total: clustered.length,
      },
    });
  }

  res.json({ seed, cached: false, ...payload });
}));

export default router;

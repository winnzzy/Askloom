import { Router, Request, Response } from "express";
import NodeCache from "node-cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
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
const suggestSchema = z.object({
  seed: z.string().trim().min(1).max(120),
  sources: z
    .array(z.enum(["google", "youtube"]))
    .min(1)
    .max(2)
    .optional()
    .transform((sources): ("google" | "youtube")[] => sources ?? ["google", "youtube"]),
});

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

router.post("/suggest", asyncHandler(async (req: Request, res: Response) => {
  const parsed = suggestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid search request" });
  }
  const { seed, sources } = parsed.data;

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

  const cacheKey = `${seed.toLowerCase()}::${sources.join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    if (userId) {
      const cachedPayload = cached as { grouped: unknown; total: number };
      await prisma.searchHistory.create({
        data: {
          userId,
          seed,
          sources: toJson(sources),
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
        seed,
        sources: toJson(sources),
        grouped: toJson(grouped),
        total: clustered.length,
      },
    });
  }

  res.json({ seed, cached: false, ...payload });
}));

export default router;

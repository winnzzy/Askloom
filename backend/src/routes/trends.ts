import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { SUPPORTED_LANGUAGES, SUPPORTED_MARKETS } from "../services/intelligence";

const router = Router();
const MIN_AGGREGATE_SEARCHES = 5;

const querySchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES).default("en"),
  market: z.enum(SUPPORTED_MARKETS).default("NG"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

function utcDayStart(daysBack = 0) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysBack));
}

router.get("/trends", asyncHandler(async (req: Request, res: Response) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid trend query" });

  const { language, market, limit } = parsed.data;
  const fourteenDaysAgo = utcDayStart(13);
  const sevenDaysAgo = utcDayStart(6);

  const rows = await prisma.searchSignalDaily.findMany({
    where: {
      language,
      market,
      signalDate: { gte: fourteenDaysAgo },
    },
    select: {
      normalizedSeed: true,
      signalDate: true,
      searchCount: true,
      resultCountTotal: true,
    },
  });

  const byTopic = new Map<string, {
    recent: number;
    previous: number;
    resultCountTotal: number;
  }>();

  for (const row of rows) {
    const current = byTopic.get(row.normalizedSeed) ?? { recent: 0, previous: 0, resultCountTotal: 0 };
    if (row.signalDate >= sevenDaysAgo) current.recent += row.searchCount;
    else current.previous += row.searchCount;
    current.resultCountTotal += row.resultCountTotal;
    byTopic.set(row.normalizedSeed, current);
  }

  const trends = Array.from(byTopic.entries())
    .map(([topic, counts]) => {
      const totalSearches = counts.recent + counts.previous;
      if (totalSearches < MIN_AGGREGATE_SEARCHES) return null;

      const growthPercent = counts.previous > 0
        ? Math.round(((counts.recent - counts.previous) / counts.previous) * 100)
        : null;
      const momentum = counts.previous > 0
        ? Math.max(-1, Math.min(3, (counts.recent - counts.previous) / counts.previous))
        : counts.recent >= MIN_AGGREGATE_SEARCHES ? 1 : 0;
      const activityComponent = Math.min(70, Math.round(Math.log2(counts.recent + 1) * 18));
      const momentumComponent = Math.max(0, Math.round(momentum * 10));
      const trendIndex = Math.max(1, Math.min(100, activityComponent + momentumComponent));

      return {
        topic,
        trendIndex,
        recentSearches: counts.recent,
        previousSearches: counts.previous,
        growthPercent,
        averageResultsPerSearch: totalSearches > 0
          ? Math.round(counts.resultCountTotal / totalSearches)
          : 0,
        direction: growthPercent === null
          ? "new"
          : growthPercent >= 20
            ? "rising"
            : growthPercent <= -20
              ? "cooling"
              : "steady",
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.trendIndex - a.trendIndex || b.recentSearches - a.recentSearches)
    .slice(0, limit);

  return res.json({
    language,
    market,
    windowDays: 14,
    privacyThreshold: MIN_AGGREGATE_SEARCHES,
    methodology: "askloom-first-party-aggregate-v1",
    note: "Trend Index reflects aggregated AskLoom research activity, not total web search volume.",
    trends,
  });
}));

export default router;

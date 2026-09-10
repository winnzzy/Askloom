import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../utils/authMiddleware";
import { SUPPORTED_LANGUAGES, SUPPORTED_MARKETS } from "../services/intelligence";

const router = Router();
const MIN_PUBLISHED_ITEMS = 5;
const MIN_DISTINCT_CREATORS = 3;

function n(value: number | null | undefined) { return value ?? 0; }
function avg(total: number, count: number) { return count ? Math.round(total / count) : 0; }

router.get("/account/performance-summary", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const rows = await prisma.savedOpportunity.findMany({
    where: { userId: req.user!.id, contentStatus: "PUBLISHED" },
    select: {
      id: true, phrase: true, selectedTitle: true, platform: true, views: true, engagements: true,
      conversions: true, publishedAt: true, project: { select: { id: true, name: true } }, score: true,
    },
    orderBy: [{ views: "desc" }, { updatedAt: "desc" }],
    take: 500,
  });

  const totalViews = rows.reduce((s, x) => s + n(x.views), 0);
  const totalEngagements = rows.reduce((s, x) => s + n(x.engagements), 0);
  const totalConversions = rows.reduce((s, x) => s + n(x.conversions), 0);
  const byPlatform = new Map<string, { items: number; views: number; engagements: number; conversions: number }>();
  for (const row of rows) {
    const key = row.platform?.trim() || "Unspecified";
    const current = byPlatform.get(key) ?? { items: 0, views: 0, engagements: 0, conversions: 0 };
    current.items += 1; current.views += n(row.views); current.engagements += n(row.engagements); current.conversions += n(row.conversions);
    byPlatform.set(key, current);
  }

  return res.json({
    publishedItems: rows.length,
    totals: { views: totalViews, engagements: totalEngagements, conversions: totalConversions },
    averages: { views: avg(totalViews, rows.length), engagements: avg(totalEngagements, rows.length), conversions: avg(totalConversions, rows.length) },
    byPlatform: Array.from(byPlatform.entries()).map(([platform, value]) => ({ platform, ...value })).sort((a, b) => b.views - a.views),
    topContent: rows.slice(0, 10),
    privacy: "Private to this account. Not exposed through aggregate intelligence as an identifiable creator record.",
  });
}));

const aggregateSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES).default("en"),
  market: z.enum(SUPPORTED_MARKETS).default("NG"),
});

router.get("/outcomes", asyncHandler(async (req: Request, res: Response) => {
  const parsed = aggregateSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid outcome query" });
  const { language, market } = parsed.data;
  const rows = await prisma.savedOpportunity.findMany({
    where: { language, market, contentStatus: "PUBLISHED", views: { not: null } },
    select: { userId: true, platform: true, category: true, views: true, engagements: true, conversions: true, score: true },
    take: 5000,
  });

  const groups = new Map<string, { platform: string; category: string; creators: Set<string>; items: number; views: number; engagements: number; conversions: number; scoreTotal: number }>();
  for (const row of rows) {
    const platform = row.platform?.trim() || "Unspecified";
    const category = row.category || "other";
    const key = `${platform.toLowerCase()}::${category}`;
    const current = groups.get(key) ?? { platform, category, creators: new Set<string>(), items: 0, views: 0, engagements: 0, conversions: 0, scoreTotal: 0 };
    current.creators.add(row.userId); current.items += 1; current.views += n(row.views); current.engagements += n(row.engagements); current.conversions += n(row.conversions); current.scoreTotal += row.score;
    groups.set(key, current);
  }

  const benchmarks = Array.from(groups.values())
    .filter(g => g.items >= MIN_PUBLISHED_ITEMS && g.creators.size >= MIN_DISTINCT_CREATORS)
    .map(g => ({
      platform: g.platform, category: g.category, publishedItems: g.items, distinctCreators: g.creators.size,
      averageOpportunityScore: avg(g.scoreTotal, g.items), averageViews: avg(g.views, g.items), averageEngagements: avg(g.engagements, g.items), averageConversions: avg(g.conversions, g.items),
    }))
    .sort((a, b) => b.publishedItems - a.publishedItems || b.averageViews - a.averageViews)
    .slice(0, 50);

  return res.json({
    language, market, privacyThreshold: { publishedItems: MIN_PUBLISHED_ITEMS, distinctCreators: MIN_DISTINCT_CREATORS },
    methodology: "askloom-aggregate-content-outcomes-v1",
    note: "Benchmarks summarize sufficiently aggregated AskLoom creator-reported outcomes. They are not platform-wide market averages and may contain self-reported metrics.",
    benchmarks,
  });
}));

export default router;

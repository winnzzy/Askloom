import prisma from "../lib/prisma";

export interface OutcomeCalibration {
  adjustment: number;
  sampleSize: number;
  creatorCount: number;
  methodology: "askloom-outcome-calibration-v1";
}

export type OutcomeCalibrationMap = Record<string, OutcomeCalibration>;

const MIN_TOTAL_ITEMS = 40;
const MIN_TOTAL_CREATORS = 8;
const MIN_CATEGORY_ITEMS = 20;
const MIN_CATEGORY_CREATORS = 5;
const MAX_ADJUSTMENT = 6;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function qualityScore(row: { views: number | null; engagements: number | null; conversions: number | null }) {
  const views = row.views ?? 0;
  if (views <= 0) return null;
  const engagementRate = clamp((row.engagements ?? 0) / views, 0, 0.25) / 0.25;
  const conversionRate = clamp((row.conversions ?? 0) / views, 0, 0.1) / 0.1;
  return (engagementRate * 0.7) + (conversionRate * 0.3);
}

export async function getOutcomeCalibration(input: { language: string; market: string }): Promise<OutcomeCalibrationMap> {
  const rows = await prisma.savedOpportunity.findMany({
    where: {
      language: input.language,
      market: input.market,
      contentStatus: "PUBLISHED",
      views: { gt: 0 },
    },
    select: { userId: true, category: true, views: true, engagements: true, conversions: true },
    take: 10000,
  });

  const usable = rows.map(row => ({ ...row, quality: qualityScore(row) })).filter((row): row is typeof row & { quality: number } => row.quality !== null);
  const totalCreators = new Set(usable.map(row => row.userId));
  if (usable.length < MIN_TOTAL_ITEMS || totalCreators.size < MIN_TOTAL_CREATORS) return {};

  const overallQuality = usable.reduce((sum, row) => sum + row.quality, 0) / usable.length;
  if (!Number.isFinite(overallQuality) || overallQuality <= 0) return {};

  const groups = new Map<string, { items: number; creators: Set<string>; qualityTotal: number }>();
  for (const row of usable) {
    const key = row.category || "other";
    const current = groups.get(key) ?? { items: 0, creators: new Set<string>(), qualityTotal: 0 };
    current.items += 1;
    current.creators.add(row.userId);
    current.qualityTotal += row.quality;
    groups.set(key, current);
  }

  const output: OutcomeCalibrationMap = {};
  for (const [category, group] of groups.entries()) {
    if (group.items < MIN_CATEGORY_ITEMS || group.creators.size < MIN_CATEGORY_CREATORS) continue;
    const categoryQuality = group.qualityTotal / group.items;
    const relativeLift = (categoryQuality - overallQuality) / overallQuality;
    const adjustment = clamp(Math.round(relativeLift * 10), -MAX_ADJUSTMENT, MAX_ADJUSTMENT);
    if (adjustment === 0) continue;
    output[category] = {
      adjustment,
      sampleSize: group.items,
      creatorCount: group.creators.size,
      methodology: "askloom-outcome-calibration-v1",
    };
  }

  return output;
}

export const OUTCOME_CALIBRATION_THRESHOLDS = {
  minTotalItems: MIN_TOTAL_ITEMS,
  minTotalCreators: MIN_TOTAL_CREATORS,
  minCategoryItems: MIN_CATEGORY_ITEMS,
  minCategoryCreators: MIN_CATEGORY_CREATORS,
  maxAdjustment: MAX_ADJUSTMENT,
};

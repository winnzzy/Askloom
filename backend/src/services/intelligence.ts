import prisma from "../lib/prisma";

export const SUPPORTED_LANGUAGES = ["en", "fr", "es"] as const;
export const SUPPORTED_MARKETS = ["NG", "US", "GB", "CA", "FR", "ES", "MX"] as const;
export const PRODUCT_EVENTS = [
  "page_view",
  "research_started",
  "research_completed",
  "language_changed",
  "market_changed",
  "results_view_changed",
  "pricing_viewed",
] as const;

export type IntelligenceLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type IntelligenceMarket = (typeof SUPPORTED_MARKETS)[number];
export type ProductEventName = (typeof PRODUCT_EVENTS)[number];

function utcDateOnly(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function daysAgo(days: number): Date {
  const date = utcDateOnly();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

export function normalizeResearchSeed(seed: string): string {
  return seed.trim().toLocaleLowerCase().replace(/\s+/g, " ").slice(0, 120);
}

export async function getTopicMomentum(input: {
  seed: string;
  language: IntelligenceLanguage;
  market: IntelligenceMarket;
}): Promise<number> {
  const normalizedSeed = normalizeResearchSeed(input.seed);
  const rows = await prisma.searchSignalDaily.findMany({
    where: {
      normalizedSeed,
      language: input.language,
      market: input.market,
      signalDate: { gte: daysAgo(14) },
    },
    select: { signalDate: true, searchCount: true },
  });

  const split = daysAgo(7).getTime();
  let recent = 0;
  let previous = 0;
  for (const row of rows) {
    if (row.signalDate.getTime() >= split) recent += row.searchCount;
    else previous += row.searchCount;
  }

  // Avoid overstating momentum on tiny/no historical samples. The returned
  // number is only a small scoring boost, not a claimed market growth rate.
  if (previous < 3 || recent < 3) return 0;
  const growth = (recent - previous) / previous;
  return Math.max(0, Math.min(10, growth * 10));
}

export async function recordSearchSignal(input: {
  seed: string;
  language: IntelligenceLanguage;
  market: IntelligenceMarket;
  sources: ("google" | "youtube")[];
  resultCount: number;
}) {
  const signalDate = utcDateOnly();
  const normalizedSeed = normalizeResearchSeed(input.seed);
  const sourcesKey = [...input.sources].sort().join("+");

  await prisma.searchSignalDaily.upsert({
    where: {
      signalDate_normalizedSeed_language_market_sourcesKey: {
        signalDate,
        normalizedSeed,
        language: input.language,
        market: input.market,
        sourcesKey,
      },
    },
    create: {
      signalDate,
      normalizedSeed,
      language: input.language,
      market: input.market,
      sourcesKey,
      searchCount: 1,
      resultCountTotal: input.resultCount,
    },
    update: {
      searchCount: { increment: 1 },
      resultCountTotal: { increment: input.resultCount },
    },
  });
}

export async function recordProductMetric(input: {
  eventName: ProductEventName;
  language: IntelligenceLanguage;
  market: IntelligenceMarket;
  platform?: string;
}) {
  const metricDate = utcDateOnly();
  const platform = (input.platform || "web").slice(0, 24);

  await prisma.productMetricDaily.upsert({
    where: {
      metricDate_eventName_language_market_platform: {
        metricDate,
        eventName: input.eventName,
        language: input.language,
        market: input.market,
        platform,
      },
    },
    create: {
      metricDate,
      eventName: input.eventName,
      language: input.language,
      market: input.market,
      platform,
      count: 1,
    },
    update: { count: { increment: 1 } },
  });
}

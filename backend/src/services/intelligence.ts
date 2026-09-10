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

export function normalizeResearchSeed(seed: string): string {
  return seed.trim().toLocaleLowerCase().replace(/\s+/g, " ").slice(0, 120);
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

import type { ResearchLanguage, ResearchMarket } from "./intelligence";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export interface TrendItem {
  topic: string;
  trendIndex: number;
  recentSearches: number;
  previousSearches: number;
  growthPercent: number | null;
  averageResultsPerSearch: number;
  direction: "new" | "rising" | "cooling" | "steady";
}

export interface TrendsResponse {
  language: ResearchLanguage;
  market: ResearchMarket;
  windowDays: number;
  privacyThreshold: number;
  methodology: string;
  note: string;
  trends: TrendItem[];
}

export async function fetchTrends(
  language: ResearchLanguage,
  market: ResearchMarket,
  limit = 20
): Promise<TrendsResponse> {
  const params = new URLSearchParams({ language, market, limit: String(limit) });
  const res = await fetch(`${API_BASE}/trends?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not load trends");
  }
  return res.json();
}

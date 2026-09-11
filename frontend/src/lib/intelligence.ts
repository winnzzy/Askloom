import { getAuthHeader } from "./auth";
import type { GroupedResults } from "./api";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export type ResearchLanguage = "en" | "fr" | "es";
export type ResearchMarket = "NG" | "US" | "GB" | "CA" | "FR" | "ES" | "MX";
export type ProductEventName =
  | "page_view"
  | "research_started"
  | "research_completed"
  | "language_changed"
  | "market_changed"
  | "results_view_changed"
  | "pricing_viewed";

export interface Opportunity {
  phrase: string;
  category: string;
  subgroup: string;
  score: number;
  intent: "question" | "comparison" | "commercial" | "problem-solving" | "discovery";
  badges: string[];
  reasons: string[];
  outcomeCalibration?: {
    adjustment: number;
    sampleSize: number;
    creatorCount: number;
    methodology: string;
  };
}

export interface ResearchResponse {
  grouped: GroupedResults;
  total: number;
  opportunities: Opportunity[];
  methodology: string;
  language: ResearchLanguage;
  market: ResearchMarket;
  outcomeCalibration?: {
    active: boolean;
    thresholds: {
      minTotalItems: number;
      minTotalCreators: number;
      minCategoryItems: number;
      minCategoryCreators: number;
      maxAdjustment: number;
    };
  };
}

export async function fetchLocalizedSuggestions(
  seed: string,
  language: ResearchLanguage,
  market: ResearchMarket,
  token?: string | null
): Promise<ResearchResponse> {
  const res = await fetch(`${API_BASE}/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    credentials: "include",
    body: JSON.stringify({ seed, language, market, sources: ["google", "youtube"] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Research request failed");
  }

  return res.json();
}

export function trackProductEvent(
  eventName: ProductEventName,
  language: ResearchLanguage,
  market: ResearchMarket,
  platform = "web"
) {
  void fetch(`${API_BASE}/analytics/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    keepalive: true,
    body: JSON.stringify({ eventName, language, market, platform }),
  }).catch(() => undefined);
}

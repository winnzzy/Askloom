import { getAuthHeader } from "./auth";
import type { ResearchLanguage, ResearchMarket } from "./intelligence";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export interface PerformanceSummary {
  publishedItems: number;
  totals: { views: number; engagements: number; conversions: number };
  averages: { views: number; engagements: number; conversions: number };
  byPlatform: Array<{ platform: string; items: number; views: number; engagements: number; conversions: number }>;
  topContent: Array<any>;
  privacy: string;
}

export interface OutcomeBenchmark {
  platform: string;
  category: string;
  publishedItems: number;
  distinctCreators: number;
  averageOpportunityScore: number;
  averageViews: number;
  averageEngagements: number;
  averageConversions: number;
}

export async function fetchPerformanceSummary(token: string): Promise<PerformanceSummary> {
  const res = await fetch(`${API_BASE}/account/performance-summary`, { credentials: "include", headers: { ...getAuthHeader(token) } });
  if (!res.ok) throw new Error("Could not load performance summary");
  return res.json();
}

export async function fetchOutcomeBenchmarks(language: ResearchLanguage, market: ResearchMarket): Promise<{ benchmarks: OutcomeBenchmark[]; note: string }> {
  const query = new URLSearchParams({ language, market });
  const res = await fetch(`${API_BASE}/outcomes?${query.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Could not load AskLoom benchmarks");
  return res.json();
}

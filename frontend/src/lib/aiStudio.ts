import { getAuthHeader } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export type StudioFormat = "youtube" | "shorts" | "article";
export type StudioTone = "educational" | "conversational" | "authoritative" | "storytelling";
export type StudioSection = "titles" | "hooks" | "contentBrief" | "outline" | "script" | "shorts" | "description" | "nextSteps";

export interface StudioPackage {
  titles: string[];
  hooks: string[];
  contentBrief: string;
  outline: Array<{ section: string; points: string[] }>;
  script: string;
  shorts: Array<{ title: string; hook: string; body: string; cta: string }>;
  description: string;
  nextSteps: string[];
}

export interface StudioAsset {
  id: string;
  topic: string;
  format: StudioFormat;
  audience: string;
  tone: StudioTone;
  version: number;
  content: StudioPackage;
  createdAt: string;
  opportunity?: { id: string; phrase: string } | null;
  project?: { id: string; name: string } | null;
}

export async function generateStudioPackage(token: string | null, input: { topic: string; format: StudioFormat; audience: string; tone: StudioTone; opportunityId?: string | null }): Promise<{ asset: StudioAsset; content: StudioPackage }> {
  const res = await fetch(`${API_BASE}/ai-studio/generate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "AI Studio generation failed");
  }
  return res.json();
}

export async function fetchStudioAssets(token: string | null, opportunityId?: string | null): Promise<StudioAsset[]> {
  const query = opportunityId ? `?opportunityId=${encodeURIComponent(opportunityId)}` : "";
  const res = await fetch(`${API_BASE}/ai-studio/assets${query}`, {
    credentials: "include",
    headers: { ...getAuthHeader(token) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not load AI Studio versions");
  }
  const data = await res.json();
  return data.assets || [];
}

export async function regenerateStudioSection(token: string | null, assetId: string, section: StudioSection): Promise<{ asset: StudioAsset; content: StudioPackage; regeneratedSection: StudioSection }> {
  const res = await fetch(`${API_BASE}/ai-studio/assets/${assetId}/regenerate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    body: JSON.stringify({ section }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not regenerate section");
  }
  return res.json();
}

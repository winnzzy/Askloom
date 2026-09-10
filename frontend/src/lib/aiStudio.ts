import { getAuthHeader } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export type StudioFormat = "youtube" | "shorts" | "article";
export type StudioTone = "educational" | "conversational" | "authoritative" | "storytelling";

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

export async function generateStudioPackage(token: string | null, input: { topic: string; format: StudioFormat; audience: string; tone: StudioTone }): Promise<StudioPackage> {
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
  const data = await res.json();
  return data.content;
}

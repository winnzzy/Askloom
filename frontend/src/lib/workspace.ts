import { getAuthHeader } from "./auth";
import type { Opportunity, ResearchLanguage, ResearchMarket } from "./intelligence";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export type ContentStatus = "IDEA" | "PLANNED" | "IN_PROGRESS" | "PUBLISHED";

export async function saveOpportunity(input: {
  token: string;
  seed: string;
  opportunity: Opportunity;
  language: ResearchLanguage;
  market: ResearchMarket;
  projectId?: string | null;
}) {
  const res = await fetch(`${API_BASE}/account/opportunities`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(input.token),
    },
    body: JSON.stringify({
      projectId: input.projectId ?? null,
      seed: input.seed,
      phrase: input.opportunity.phrase,
      score: input.opportunity.score,
      intent: input.opportunity.intent,
      category: input.opportunity.category,
      language: input.language,
      market: input.market,
      reasons: input.opportunity.reasons,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not save opportunity");
  }
  return res.json();
}

export async function fetchSavedOpportunities(token: string) {
  const res = await fetch(`${API_BASE}/account/opportunities`, {
    credentials: "include",
    headers: { ...getAuthHeader(token) },
  });
  if (!res.ok) throw new Error("Could not load saved opportunities");
  return res.json();
}

export async function deleteSavedOpportunity(token: string, opportunityId: string) {
  const res = await fetch(`${API_BASE}/account/opportunities/${opportunityId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { ...getAuthHeader(token) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not delete saved opportunity");
  }
  return res.json();
}

export async function assignOpportunityToProject(
  token: string,
  opportunityId: string,
  projectId: string | null
) {
  const res = await fetch(`${API_BASE}/account/opportunities/${opportunityId}/project`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not move opportunity");
  }
  return res.json();
}

export async function updateOpportunityStatus(
  token: string,
  opportunityId: string,
  contentStatus: ContentStatus
) {
  const res = await fetch(`${API_BASE}/account/opportunities/${opportunityId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    body: JSON.stringify({ contentStatus }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not update content status");
  }
  return res.json();
}

export async function fetchProjects(token: string) {
  const res = await fetch(`${API_BASE}/account/projects`, {
    credentials: "include",
    headers: { ...getAuthHeader(token) },
  });
  if (!res.ok) throw new Error("Could not load projects");
  return res.json();
}

export async function createProject(
  token: string,
  name: string,
  language: ResearchLanguage,
  market: ResearchMarket
) {
  const res = await fetch(`${API_BASE}/account/projects`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    body: JSON.stringify({ name, language, market }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not create project");
  }
  return res.json();
}

export async function deleteProject(token: string, projectId: string) {
  const res = await fetch(`${API_BASE}/account/projects/${projectId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { ...getAuthHeader(token) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not delete project");
  }
  return res.json();
}

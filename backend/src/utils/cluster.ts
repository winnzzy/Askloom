// Buckets a flat list of autocomplete phrases into the same category
// shapes AnswerThePublic uses, so the frontend can render them as
// spokes on the radial diagram or rows in the data table.

export type ClusterCategory =
  | "questions"
  | "prepositions"
  | "comparisons"
  | "alphabeticals"
  | "related";

export interface ClusteredResult {
  category: ClusterCategory;
  subgroup: string; // e.g. "who", "for", "vs", "a"
  phrase: string;
}

const QUESTION_WORDS = [
  "who",
  "what",
  "when",
  "where",
  "why",
  "how",
  "which",
  "will",
  "can",
  "are",
  "is",
];

const PREPOSITIONS = [
  "for",
  "with",
  "without",
  "to",
  "near",
  "like",
  "on",
  "in",
  "vs",
];

const COMPARISON_WORDS = ["vs", "versus", "or", "and", "compared to"];

export function classifyPhrase(seed: string, phrase: string): ClusteredResult {
  const lower = phrase.toLowerCase().trim();
  const seedLower = seed.toLowerCase().trim();
  // Strip the seed keyword out to inspect what surrounds it
  const withoutSeed = lower.replace(seedLower, "").trim();
  const firstWord = lower.split(/\s+/)[0];

  if (QUESTION_WORDS.includes(firstWord)) {
    return { category: "questions", subgroup: firstWord, phrase };
  }

  for (const comp of COMPARISON_WORDS) {
    if (withoutSeed.includes(` ${comp} `) || withoutSeed.startsWith(`${comp} `)) {
      return { category: "comparisons", subgroup: comp, phrase };
    }
  }

  for (const prep of PREPOSITIONS) {
    if (withoutSeed.startsWith(prep) || withoutSeed.includes(` ${prep} `)) {
      return { category: "prepositions", subgroup: prep, phrase };
    }
  }

  // Alphabetical soup match: "<seed> a...", "<seed> b..." etc.
  const alphaMatch = withoutSeed.match(/^([a-z])\b/);
  if (alphaMatch) {
    return { category: "alphabeticals", subgroup: alphaMatch[1], phrase };
  }

  return { category: "related", subgroup: "related", phrase };
}

export function clusterResults(seed: string, phrases: string[]): ClusteredResult[] {
  const seen = new Set<string>();
  const out: ClusteredResult[] = [];
  for (const p of phrases) {
    const key = p.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(classifyPhrase(seed, p));
  }
  return out;
}

export function groupByCategory(results: ClusteredResult[]) {
  const grouped: Record<ClusterCategory, Record<string, string[]>> = {
    questions: {},
    prepositions: {},
    comparisons: {},
    alphabeticals: {},
    related: {},
  };
  for (const r of results) {
    if (!grouped[r.category][r.subgroup]) grouped[r.category][r.subgroup] = [];
    grouped[r.category][r.subgroup].push(r.phrase);
  }
  return grouped;
}

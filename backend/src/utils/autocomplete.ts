import axios from "axios";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const QUESTION_PREFIXES = [
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
];
const PREPOSITION_WORDS = ["for", "with", "without", "to", "near", "like"];
const COMPARISON_WORDS = ["vs", "or", "and"];

async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  try {
    const res = await axios.get(
      "https://suggestqueries.google.com/complete/search",
      {
        params: { client: "firefox", q: query },
        timeout: 4000,
      }
    );
    // Response shape: [query, [suggestion1, suggestion2, ...]]
    return Array.isArray(res.data) && Array.isArray(res.data[1])
      ? res.data[1]
      : [];
  } catch {
    return [];
  }
}

async function fetchYoutubeSuggestions(query: string): Promise<string[]> {
  try {
    const res = await axios.get(
      "https://suggestqueries.google.com/complete/search",
      {
        params: { client: "firefox", ds: "yt", q: query },
        timeout: 4000,
      }
    );
    return Array.isArray(res.data) && Array.isArray(res.data[1])
      ? res.data[1]
      : [];
  } catch {
    return [];
  }
}

function buildExpansionQueries(seed: string): string[] {
  const queries: string[] = [seed];

  for (const q of QUESTION_PREFIXES) queries.push(`${q} ${seed}`);
  for (const p of PREPOSITION_WORDS) queries.push(`${seed} ${p}`);
  for (const c of COMPARISON_WORDS) queries.push(`${seed} ${c}`);
  for (const letter of ALPHABET) queries.push(`${seed} ${letter}`);

  return queries;
}

// Runs all expansion queries in small concurrent batches so we don't
// hammer the (unofficial, free) suggestion endpoints and get rate limited.
async function runBatched(
  queries: string[],
  fetcher: (q: string) => Promise<string[]>,
  batchSize = 8
): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetcher));
    for (const arr of batchResults) results.push(...arr);
  }
  return results;
}

export async function gatherSuggestions(
  seed: string,
  sources: ("google" | "youtube")[] = ["google", "youtube"]
): Promise<string[]> {
  const queries = buildExpansionQueries(seed.trim());
  const all: string[] = [];

  if (sources.includes("google")) {
    all.push(...(await runBatched(queries, fetchGoogleSuggestions)));
  }
  if (sources.includes("youtube")) {
    all.push(...(await runBatched(queries, fetchYoutubeSuggestions)));
  }

  return all;
}

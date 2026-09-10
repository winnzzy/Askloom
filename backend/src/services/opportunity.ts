import type { ClusteredResult } from "../utils/cluster";

export interface OpportunityScore {
  phrase: string;
  category: ClusteredResult["category"];
  subgroup: string;
  score: number;
  intent: "question" | "comparison" | "commercial" | "problem-solving" | "discovery";
  badges: string[];
  reasons: string[];
}

const COMMERCIAL_TERMS = [
  "best", "buy", "price", "cost", "cheap", "review", "reviews", "software",
  "tool", "tools", "service", "services", "course", "agency", "platform",
  "alternative", "alternatives", "vs", "versus",
];

const PROBLEM_TERMS = [
  "how", "fix", "solve", "why", "can", "should", "guide", "tutorial",
  "ideas", "examples", "tips", "strategy", "strategies",
];

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "i").test(text));
}

function classifyIntent(result: ClusteredResult): OpportunityScore["intent"] {
  if (result.category === "comparisons") return "comparison";
  if (hasAny(result.phrase, COMMERCIAL_TERMS)) return "commercial";
  if (result.category === "questions") return "question";
  if (hasAny(result.phrase, PROBLEM_TERMS)) return "problem-solving";
  return "discovery";
}

function specificityScore(phrase: string) {
  const words = phrase.trim().split(/\s+/).length;
  if (words >= 6 && words <= 11) return 16;
  if (words >= 4 && words <= 13) return 12;
  if (words >= 3) return 8;
  return 4;
}

export function scoreOpportunities(
  clustered: ClusteredResult[],
  topicMomentum = 0
): OpportunityScore[] {
  return clustered
    .map((result) => {
      const intent = classifyIntent(result);
      let score = 38;
      const badges: string[] = [];
      const reasons: string[] = [];

      if (result.category === "questions") {
        score += 18;
        badges.push("Question intent");
        reasons.push("Direct audience question");
      } else if (result.category === "comparisons") {
        score += 20;
        badges.push("Comparison intent");
        reasons.push("Comparison queries often signal active evaluation");
      } else if (result.category === "prepositions") {
        score += 10;
        reasons.push("Specific use-case phrasing");
      } else if (result.category === "related") {
        score += 7;
      }

      if (intent === "commercial") {
        score += 15;
        badges.push("Commercial intent");
        reasons.push("Contains evaluation or buying language");
      } else if (intent === "problem-solving") {
        score += 10;
        badges.push("Problem solving");
        reasons.push("Contains actionable problem-solving language");
      }

      const specificity = specificityScore(result.phrase);
      score += specificity;
      if (specificity >= 12) {
        badges.push("Specific");
        reasons.push("Longer, more specific query");
      }

      if (topicMomentum > 0) {
        const momentumBoost = Math.min(10, Math.round(topicMomentum));
        score += momentumBoost;
        badges.push("AskLoom momentum");
        reasons.push("Topic is gaining first-party AskLoom research activity");
      }

      return {
        phrase: result.phrase,
        category: result.category,
        subgroup: result.subgroup,
        score: Math.max(1, Math.min(99, score)),
        intent,
        badges: badges.slice(0, 3),
        reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.score - a.score || a.phrase.localeCompare(b.phrase));
}

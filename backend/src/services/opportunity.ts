import type { ClusteredResult } from "../utils/cluster";
import type { SuggestionEvidenceMap } from "../utils/autocomplete";
import type { OutcomeCalibrationMap } from "./outcomeCalibration";

export interface OpportunityScore {
  phrase: string;
  category: ClusteredResult["category"];
  subgroup: string;
  score: number;
  intent: "question" | "comparison" | "commercial" | "problem-solving" | "discovery";
  badges: string[];
  reasons: string[];
  sourceEvidence?: { sources: Array<"google" | "youtube">; occurrences: number };
  outcomeCalibration?: {
    adjustment: number;
    sampleSize: number;
    creatorCount: number;
    methodology: string;
  };
}

const COMMERCIAL_TERMS = [
  "best", "buy", "price", "cost", "cheap", "review", "reviews", "software",
  "tool", "tools", "service", "services", "course", "agency", "platform",
  "alternative", "alternatives", "vs", "versus",
];
const PROBLEM_TERMS = ["how", "fix", "solve", "why", "can", "should", "guide", "tutorial", "ideas", "examples", "tips", "strategy", "strategies"];
function hasAny(text: string, terms: string[]) { return terms.some((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "i").test(text)); }
function classifyIntent(result: ClusteredResult): OpportunityScore["intent"] { if (result.category === "comparisons") return "comparison"; if (hasAny(result.phrase, COMMERCIAL_TERMS)) return "commercial"; if (result.category === "questions") return "question"; if (hasAny(result.phrase, PROBLEM_TERMS)) return "problem-solving"; return "discovery"; }
function specificityScore(phrase: string) { const words = phrase.trim().split(/\s+/).length; if (words >= 6 && words <= 11) return 16; if (words >= 4 && words <= 13) return 12; if (words >= 3) return 8; return 4; }
function evidenceKey(phrase: string) { return phrase.trim().replace(/\s+/g, " ").toLowerCase(); }

export function scoreOpportunities(clustered: ClusteredResult[], topicMomentum = 0, outcomeCalibration: OutcomeCalibrationMap = {}, sourceEvidence: SuggestionEvidenceMap = {}): OpportunityScore[] {
  return clustered.map((result) => {
    const intent = classifyIntent(result); let score = 38; const badges: string[] = []; const reasons: string[] = [];
    if (result.category === "questions") { score += 18; badges.push("Question intent"); reasons.push("Direct audience question"); }
    else if (result.category === "comparisons") { score += 20; badges.push("Comparison intent"); reasons.push("Comparison queries often signal active evaluation"); }
    else if (result.category === "prepositions") { score += 10; reasons.push("Specific use-case phrasing"); }
    else if (result.category === "related") score += 7;
    if (intent === "commercial") { score += 15; badges.push("Commercial intent"); reasons.push("Contains evaluation or buying language"); }
    else if (intent === "problem-solving") { score += 10; badges.push("Problem solving"); reasons.push("Contains actionable problem-solving language"); }
    const specificity = specificityScore(result.phrase); score += specificity;
    if (specificity >= 12) { badges.push("Specific"); reasons.push("Longer, more specific query"); }
    if (topicMomentum > 0) { const momentumBoost = Math.min(10, Math.round(topicMomentum)); score += momentumBoost; badges.push("AskLoom momentum"); reasons.push("Topic is gaining first-party AskLoom research activity"); }

    const evidence = sourceEvidence[evidenceKey(result.phrase)];
    if (evidence?.sources.includes("google") && evidence.sources.includes("youtube")) { score += 4; badges.push("Cross-source"); reasons.push("Appeared in both Google and YouTube autocomplete"); }
    else if (evidence?.sources.includes("youtube")) { badges.push("YouTube source"); reasons.push("Appeared in YouTube autocomplete"); }
    else if (evidence?.sources.includes("google")) { badges.push("Google source"); }

    const calibration = outcomeCalibration[result.category];
    if (calibration) { score += calibration.adjustment; badges.push("Outcome calibrated"); reasons.push(`Based on aggregated outcomes from ${calibration.sampleSize} published items across ${calibration.creatorCount} creators`); }
    return { phrase: result.phrase, category: result.category, subgroup: result.subgroup, score: Math.max(1, Math.min(99, score)), intent, badges: badges.slice(0, 5), reasons: reasons.slice(0, 5), ...(evidence ? { sourceEvidence: evidence } : {}), ...(calibration ? { outcomeCalibration: calibration } : {}) };
  }).sort((a, b) => b.score - a.score || a.phrase.localeCompare(b.phrase));
}

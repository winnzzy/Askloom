import { describe, expect, it } from "vitest";
import { scoreOpportunities } from "./opportunity";
import type { ClusteredResult } from "../utils/cluster";

describe("scoreOpportunities", () => {
  it("prioritizes high-intent specific queries over generic discovery", () => {
    const input: ClusteredResult[] = [
      { category: "related", subgroup: "related", phrase: "ai agents" },
      { category: "questions", subgroup: "how", phrase: "how can small businesses use ai agents for customer service" },
      { category: "comparisons", subgroup: "vs", phrase: "ai agents vs virtual assistants for small business" },
    ];
    const ranked = scoreOpportunities(input);
    const generic = ranked.find((item) => item.phrase === "ai agents")!;
    const question = ranked.find((item) => item.category === "questions")!;
    const comparison = ranked.find((item) => item.category === "comparisons")!;
    expect(question.score).toBeGreaterThan(generic.score);
    expect(comparison.score).toBeGreaterThan(generic.score);
    expect(question.badges).toContain("Question intent");
    expect(comparison.badges).toContain("Comparison intent");
  });

  it("caps scores below 100 and marks first-party momentum without claiming market growth", () => {
    const input: ClusteredResult[] = [
      { category: "comparisons", subgroup: "vs", phrase: "best ai automation platform vs agency for small business" },
    ];
    const [ranked] = scoreOpportunities(input, 10);
    expect(ranked.score).toBeLessThanOrEqual(99);
    expect(ranked.badges).toContain("AskLoom momentum");
    expect(ranked.reasons.join(" ")).toContain("AskLoom");
  });

  it("applies only the supplied aggregate outcome adjustment and explains its sample", () => {
    const input: ClusteredResult[] = [
      { category: "questions", subgroup: "how", phrase: "how to automate customer service with ai agents" },
    ];
    const [baseline] = scoreOpportunities(input);
    const [calibrated] = scoreOpportunities(input, 0, {
      questions: { adjustment: 4, sampleSize: 28, creatorCount: 7, methodology: "askloom-outcome-calibration-v1" },
    });
    expect(calibrated.score).toBe(Math.min(99, baseline.score + 4));
    expect(calibrated.badges).toContain("Outcome calibrated");
    expect(calibrated.reasons.join(" ")).toContain("28 published items");
    expect(calibrated.outcomeCalibration?.creatorCount).toBe(7);
  });
});

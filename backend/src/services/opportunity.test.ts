import { describe, expect, it } from "vitest";
import { scoreOpportunities } from "./opportunity";
import type { ClusteredResult } from "../utils/cluster";

describe("scoreOpportunities", () => {
  it("prioritizes specific comparison and question intent over generic discovery", () => {
    const input: ClusteredResult[] = [
      { category: "related", subgroup: "related", phrase: "ai agents" },
      { category: "questions", subgroup: "how", phrase: "how can small businesses use ai agents for customer service" },
      { category: "comparisons", subgroup: "vs", phrase: "ai agents vs virtual assistants for small business" },
    ];

    const ranked = scoreOpportunities(input);

    expect(ranked[0].phrase).toBe("ai agents vs virtual assistants for small business");
    expect(ranked[0].score).toBeGreaterThan(ranked[2].score);
    expect(ranked.some((item) => item.badges.includes("Question intent"))).toBe(true);
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
});

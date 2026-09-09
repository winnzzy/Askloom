import { describe, expect, it } from "vitest";
import { classifyPhrase, clusterResults, groupByCategory } from "../utils/cluster";

describe("cluster utilities", () => {
  it("classifies questions, comparisons, prepositions, and alphabeticals", () => {
    expect(classifyPhrase("coffee", "how to brew coffee").category).toBe("questions");
    expect(classifyPhrase("coffee", "coffee vs tea").category).toBe("comparisons");
    expect(classifyPhrase("coffee", "coffee for beginners").category).toBe("prepositions");
    expect(classifyPhrase("coffee", "coffee b").category).toBe("alphabeticals");
  });

  it("deduplicates phrases before grouping", () => {
    const clustered = clusterResults("coffee", [
      "how to brew coffee",
      "How to brew coffee",
      "coffee vs tea",
    ]);
    const grouped = groupByCategory(clustered);

    expect(clustered).toHaveLength(2);
    expect(grouped.questions.how).toEqual(["how to brew coffee"]);
    expect(grouped.comparisons.vs).toEqual(["coffee vs tea"]);
  });
});

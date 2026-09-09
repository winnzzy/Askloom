import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { GroupedResults } from "../lib/api";

interface Props {
  seed: string;
  grouped: GroupedResults;
}

const CATEGORY_COLORS: Record<string, string> = {
  questions: "#c9a24b",
  prepositions: "#7a86c7",
  comparisons: "#c76b6b",
  alphabeticals: "#6bc79a",
  related: "#9b96b3",
};

export default function SearchCloud({ seed, grouped }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 520;
    const height = 520;
    const cx = width / 2;
    const cy = height / 2;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Center node = the seed keyword
    svg
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 46)
      .attr("fill", "#1c1a2e")
      .attr("stroke", "#c9a24b")
      .attr("stroke-width", 1.5);

    svg
      .append("text")
      .attr("x", cx)
      .attr("y", cy)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#f6f2e9")
      .attr("font-family", "IBM Plex Mono, monospace")
      .attr("font-size", 11)
      .text(seed.length > 14 ? seed.slice(0, 12) + "…" : seed);

    // Build one spoke per subgroup (e.g. "who", "for", "vs", "a"), each
    // carrying up to 4 sample phrases as small ticks along the spoke.
    const categories = Object.keys(grouped);
    const spokes: { category: string; subgroup: string; count: number; sample: string }[] = [];

    for (const category of categories) {
      for (const [subgroup, phrases] of Object.entries(grouped[category])) {
        spokes.push({
          category,
          subgroup,
          count: phrases.length,
          sample: phrases[0],
        });
      }
    }

    const angleStep = (2 * Math.PI) / Math.max(spokes.length, 1);
    const radius = 200;

    spokes.forEach((spoke, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const color = CATEGORY_COLORS[spoke.category] || "#9b96b3";

      svg
        .append("line")
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);

      const r = 5 + Math.min(spoke.count, 10);
      svg
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", r)
        .attr("fill", color)
        .attr("opacity", 0.85);

      svg
        .append("text")
        .attr("x", x + (Math.cos(angle) >= 0 ? r + 6 : -(r + 6)))
        .attr("y", y)
        .attr("text-anchor", Math.cos(angle) >= 0 ? "start" : "end")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#f6f2e9")
        .attr("font-family", "IBM Plex Mono, monospace")
        .attr("font-size", 10)
        .text(`${spoke.subgroup} (${spoke.count})`);
    });
  }, [seed, grouped]);

  return <svg ref={ref} style={{ width: "100%", maxWidth: 480, height: "auto" }} />;
}

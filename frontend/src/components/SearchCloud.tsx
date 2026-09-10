import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { GroupedResults } from "../lib/api";

interface Props {
  seed: string;
  grouped: GroupedResults;
}

const CATEGORY_COLORS: Record<string, string> = {
  questions: "#d9b75d",
  prepositions: "#86a8ff",
  comparisons: "#ff7d73",
  alphabeticals: "#66d29d",
  related: "#b7b0ca",
};

function shorten(value: string, length = 18) {
  return value.length > length ? `${value.slice(0, length - 3)}...` : value;
}

export default function SearchCloud({ seed, grouped }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 560;
    const height = 560;
    const cx = width / 2;
    const cy = height / 2;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    svg
      .append("circle")
      .attr("class", "cloud-halo")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 78)
      .attr("fill", "none")
      .attr("stroke", "rgba(217, 183, 93, 0.2)")
      .attr("stroke-width", 16);

    svg
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 48)
      .attr("fill", "#161423")
      .attr("stroke", "#d9b75d")
      .attr("stroke-width", 1.5);

    svg
      .append("text")
      .attr("x", cx)
      .attr("y", cy)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#f8f0dd")
      .attr("font-family", "IBM Plex Mono, monospace")
      .attr("font-size", 11)
      .text(shorten(seed, 15));

    const spokes: { category: string; subgroup: string; count: number; sample: string }[] = [];
    for (const category of Object.keys(grouped)) {
      for (const [subgroup, phrases] of Object.entries(grouped[category])) {
        spokes.push({ category, subgroup, count: phrases.length, sample: phrases[0] });
      }
    }

    const angleStep = (2 * Math.PI) / Math.max(spokes.length, 1);
    const radius = 210;

    spokes.forEach((spoke, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const color = CATEGORY_COLORS[spoke.category] || "#b7b0ca";
      const r = 6 + Math.min(spoke.count, 12);
      const group = svg.append("g").attr("class", "cloud-spoke");

      group
        .append("line")
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", color)
        .attr("stroke-width", 1.1)
        .attr("opacity", 0.48);

      group
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", r)
        .attr("fill", color)
        .attr("opacity", 0.95);

      group
        .append("text")
        .attr("x", x + (Math.cos(angle) >= 0 ? r + 8 : -(r + 8)))
        .attr("y", y)
        .attr("text-anchor", Math.cos(angle) >= 0 ? "start" : "end")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#f8f0dd")
        .attr("font-family", "IBM Plex Mono, monospace")
        .attr("font-size", 10)
        .text(`${shorten(spoke.subgroup, 10)} (${spoke.count})`);

      group.append("title").text(`${spoke.category}: ${spoke.sample}`);
    });
  }, [seed, grouped]);

  return <svg className="search-cloud" ref={ref} />;
}

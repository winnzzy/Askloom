import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const steps = [
  ["01", "Audience signal", "Observed questions and comparisons"],
  ["02", "Opportunity", "Prioritized with transparent scoring"],
  ["03", "Create", "Structured content package and versions"],
  ["04", "Publish", "Planner, ownership and production status"],
  ["05", "Outcome", "Views, engagement and conversions"],
  ["06", "Learn", "Aggregate learning after privacy thresholds"],
]

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ClosedLoopWorkflow(props: any) {
  const accent = props.accent || "#7357FF"
  return (
    <div style={{ width: "100%", height: "100%", background: "#0D1323", color: "#F8F3EA", border: "1px solid rgba(255,255,255,.10)", borderRadius: 28, padding: 28, fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", fontWeight: 800, color: "#8E96A8" }}>{props.eyebrow || "CLOSED-LOOP INTELLIGENCE"}</div>
          <div style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 760, marginTop: 8, maxWidth: 590 }}>{props.title || "Research becomes more valuable when outcomes come back."}</div>
        </div>
        <div style={{ maxWidth: 360, color: "#A8B0C1", fontSize: 13, lineHeight: 1.55 }}>{props.note || "Aggregate learning activates only after sample-size and privacy thresholds are satisfied."}</div>
      </div>
      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        {steps.map(([n, label, description], index) => (
          <div key={label} style={{ position: "relative", minHeight: 155, padding: 17, borderRadius: 18, background: index % 2 ? "#111A30" : "#10172A", border: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: index === steps.length - 1 ? accent : "#727C91" }}>{n}</div>
            <div style={{ marginTop: 35, fontWeight: 760, fontSize: 17 }}>{label}</div>
            <div style={{ color: "#929BAD", lineHeight: 1.45, fontSize: 12, marginTop: 7 }}>{description}</div>
            {index < steps.length - 1 && <div style={{ position: "absolute", right: -8, top: "50%", width: 16, height: 1, background: "rgba(255,255,255,.25)", zIndex: 2 }} />}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center", color: "#8E96A8", fontSize: 11 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: accent, boxShadow: `0 0 20px ${accent}` }} />
        {props.footer || "No individual creator record is exposed as aggregate market intelligence."}
      </div>
    </div>
  )
}

addPropertyControls(ClosedLoopWorkflow, {
  eyebrow: { type: ControlType.String, defaultValue: "CLOSED-LOOP INTELLIGENCE" },
  title: { type: ControlType.String, defaultValue: "Research becomes more valuable when outcomes come back.", displayTextArea: true },
  note: { type: ControlType.String, defaultValue: "Aggregate learning activates only after sample-size and privacy thresholds are satisfied.", displayTextArea: true },
  footer: { type: ControlType.String, defaultValue: "No individual creator record is exposed as aggregate market intelligence.", displayTextArea: true },
  accent: { type: ControlType.Color, defaultValue: "#7357FF" },
})

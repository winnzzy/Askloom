import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Item = { label: string; value: string; description: string; tone: string }

const defaults: Item[] = [
  { label: "Observed signal", value: "Google + YouTube", description: "Autocomplete phrases are captured from configured research sources.", tone: "#73D7B5" },
  { label: "Structural score", value: "Intent + specificity", description: "Transparent heuristics rank clearer, more actionable audience needs.", tone: "#7357FF" },
  { label: "Momentum", value: "AskLoom first-party", description: "Research activity is labelled as AskLoom activity, never total web demand.", tone: "#C9A94C" },
  { label: "Outcome learning", value: "Privacy-thresholded", description: "Published outcomes affect scores only after strict sample thresholds are crossed.", tone: "#F0A878" },
]

export default function MethodologyEvidence(props: any) {
  const items = defaults.map((item, index) => ({
    ...item,
    label: props[`label${index + 1}`] || item.label,
    value: props[`value${index + 1}`] || item.value,
    description: props[`description${index + 1}`] || item.description,
  }))

  return (
    <div style={{ width: "100%", height: "100%", display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", fontFamily: "Inter, sans-serif" }}>
      {items.map((item) => (
        <div key={item.label} style={{ position: "relative", overflow: "hidden", borderRadius: 20, padding: 22, background: "#11172A", border: "1px solid rgba(255,255,255,.10)", minHeight: 190 }}>
          <div style={{ position: "absolute", width: 130, height: 130, borderRadius: 999, background: item.tone, filter: "blur(65px)", opacity: .14, right: -35, top: -45 }} />
          <div style={{ width: 9, height: 9, borderRadius: 999, background: item.tone, boxShadow: `0 0 24px ${item.tone}` }} />
          <div style={{ marginTop: 28, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "#8E96A8" }}>{item.label}</div>
          <div style={{ marginTop: 7, fontSize: 21, lineHeight: 1.15, fontWeight: 760, color: "#F7F2E8" }}>{item.value}</div>
          <p style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.6, color: "#A8B0C1" }}>{item.description}</p>
        </div>
      ))}
    </div>
  )
}

addPropertyControls(MethodologyEvidence, {
  label1: { type: ControlType.String, defaultValue: defaults[0].label },
  value1: { type: ControlType.String, defaultValue: defaults[0].value },
  description1: { type: ControlType.String, defaultValue: defaults[0].description, displayTextArea: true },
  label2: { type: ControlType.String, defaultValue: defaults[1].label },
  value2: { type: ControlType.String, defaultValue: defaults[1].value },
  description2: { type: ControlType.String, defaultValue: defaults[1].description, displayTextArea: true },
  label3: { type: ControlType.String, defaultValue: defaults[2].label },
  value3: { type: ControlType.String, defaultValue: defaults[2].value },
  description3: { type: ControlType.String, defaultValue: defaults[2].description, displayTextArea: true },
  label4: { type: ControlType.String, defaultValue: defaults[3].label },
  value4: { type: ControlType.String, defaultValue: defaults[3].value },
  description4: { type: ControlType.String, defaultValue: defaults[3].description, displayTextArea: true },
})

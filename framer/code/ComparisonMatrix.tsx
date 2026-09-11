import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Row = { stage: string; askloom: string; competitor: string }

const defaultRows: Row[] = [
  { stage: "Discover demand", askloom: "Google + YouTube autocomplete evidence", competitor: "Mature keyword and question discovery" },
  { stage: "Prioritize", askloom: "Transparent Opportunity Score", competitor: "Keyword metrics and research tools" },
  { stage: "Create", askloom: "Versioned AI Studio packages", competitor: "AI Content Studio" },
  { stage: "Plan", askloom: "Idea → Planned → In progress → Published", competitor: "Content scheduling available" },
  { stage: "Learn", askloom: "Privacy-thresholded outcome calibration", competitor: "Different product emphasis" },
]

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ComparisonMatrix({ title = "Research is only the first step.", subtitle = "Compare workflows, not marketing checklists.", competitorName = "AnswerThePublic" }) {
  return <section style={wrap}>
    <div style={header}>
      <span style={eyebrow}>WORKFLOW COMPARISON</span>
      <h2 style={h2}>{title}</h2>
      <p style={sub}>{subtitle}</p>
    </div>
    <div style={matrix}>
      <div style={{...row, ...headRow}}><strong>Workflow</strong><strong>AskLoom</strong><strong>{competitorName}</strong></div>
      {defaultRows.map((item) => <div key={item.stage} style={row}>
        <strong style={stage}>{item.stage}</strong>
        <span style={askloom}>{item.askloom}</span>
        <span style={competitor}>{item.competitor}</span>
      </div>)}
    </div>
    <p style={note}>Feature sets change. Publish only after rechecking the competitor’s current product and pricing pages.</p>
  </section>
}

addPropertyControls(ComparisonMatrix, {
  title: { type: ControlType.String, title: "Title" },
  subtitle: { type: ControlType.String, title: "Subtitle" },
  competitorName: { type: ControlType.String, title: "Competitor" },
})

const wrap: React.CSSProperties = { width: "100%", background: "#0E1222", color: "#F6F0E4", borderRadius: 24, padding: "clamp(24px,4vw,54px)", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }
const header: React.CSSProperties = { maxWidth: 760, marginBottom: 28 }
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: ".14em", color: "#A898FF", fontWeight: 800 }
const h2: React.CSSProperties = { margin: "10px 0", fontSize: "clamp(34px,5vw,64px)", lineHeight: 1.02, letterSpacing: "-.04em" }
const sub: React.CSSProperties = { color: "#ADB5C9", fontSize: 16, lineHeight: 1.6, maxWidth: 620 }
const matrix: React.CSSProperties = { border: "1px solid rgba(255,255,255,.11)", borderRadius: 16, overflow: "hidden" }
const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(120px,.7fr) minmax(180px,1.15fr) minmax(180px,1.15fr)", gap: 12, padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,.08)", alignItems: "start" }
const headRow: React.CSSProperties = { background: "rgba(255,255,255,.045)", fontSize: 12, color: "#D8DCEC" }
const stage: React.CSSProperties = { fontSize: 13, color: "#F4E8B0" }
const askloom: React.CSSProperties = { fontSize: 13, lineHeight: 1.5, color: "#F4F5F8" }
const competitor: React.CSSProperties = { fontSize: 13, lineHeight: 1.5, color: "#9FA8BC" }
const note: React.CSSProperties = { color: "#737D92", fontSize: 11, marginTop: 14, lineHeight: 1.5 }

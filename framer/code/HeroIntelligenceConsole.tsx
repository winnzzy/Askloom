import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const rows = [
  { score: 94, title: "AI agents for small businesses", meta: "Google + YouTube", label: "Example" },
  { score: 89, title: "Will AI agents replace assistants?", meta: "Question intent", label: "Example" },
  { score: 84, title: "AI customer service agents", meta: "Commercial intent", label: "Example" },
]

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function HeroIntelligenceConsole(props: {
  topic: string
  signalCount: string
  questionCount: string
  clusterCount: string
}) {
  const { topic, signalCount, questionCount, clusterCount } = props

  return (
    <section style={wrap} aria-label="Illustrative product preview">
      <div style={glow} />
      <div style={topbar}>
        <span style={eyebrow}>ILLUSTRATIVE PRODUCT PREVIEW</span>
        <span style={pill}>Example research flow</span>
      </div>

      <div style={heroBlock}>
        <div style={smallLabel}>Topic</div>
        <h3 style={topicStyle}>{topic}</h3>
        <p style={description}>A designer-safe preview of how AskLoom organizes source evidence and intent. These values are not live market data.</p>
      </div>

      <div style={metricGrid}>
        {[
          [signalCount, "source evidence"],
          [questionCount, "intent"],
          [clusterCount, "cluster"],
        ].map(([value, label]) => (
          <div key={label} style={metricCard}>
            <div style={metricValue}>{value}</div>
            <div style={metricLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={list}>
        {rows.map((row) => (
          <div key={row.title} style={rowStyle}>
            <div style={score}>{row.score}</div>
            <div style={{ minWidth: 0 }}>
              <div style={rowTitle}>{row.title}</div>
              <div style={rowMeta}>{row.meta}</div>
            </div>
            <div style={demoLabel}>{row.label}</div>
          </div>
        ))}
      </div>

      <p style={footnote}>All values in this visual are illustrative. Live AskLoom surfaces use first-party methodology and clearly label source evidence.</p>
    </section>
  )
}

HeroIntelligenceConsole.defaultProps = {
  topic: "AI agents",
  signalCount: "Source",
  questionCount: "Intent",
  clusterCount: "Cluster",
}

addPropertyControls(HeroIntelligenceConsole, {
  topic: { type: ControlType.String, title: "Topic" },
  signalCount: { type: ControlType.String, title: "Signal" },
  questionCount: { type: ControlType.String, title: "Intent" },
  clusterCount: { type: ControlType.String, title: "Cluster" },
})

const wrap: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 500,
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,.10)",
  background: "linear-gradient(180deg,rgba(24,29,50,.96),rgba(14,18,31,.98))",
  boxShadow: "0 40px 100px rgba(5,8,18,.35)",
  padding: 24,
  boxSizing: "border-box",
  color: "#F7F1E6",
  fontFamily: "Inter, sans-serif",
  overflow: "hidden",
  position: "relative",
}
const glow: React.CSSProperties = { position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "rgba(118,83,255,.18)", filter: "blur(70px)", right: -30, top: -40 }
const topbar: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", position: "relative" }
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: ".12em", fontWeight: 800, color: "#AAA4BC" }
const pill: React.CSSProperties = { fontSize: 11, padding: "7px 10px", borderRadius: 999, border: "1px solid rgba(132,241,190,.22)", color: "#9BE3BD", background: "rgba(85,193,139,.08)" }
const heroBlock: React.CSSProperties = { padding: "42px 2px 26px", position: "relative" }
const smallLabel: React.CSSProperties = { fontSize: 11, color: "#817B91", textTransform: "uppercase", letterSpacing: ".12em" }
const topicStyle: React.CSSProperties = { fontSize: "clamp(30px, 8vw, 42px)", lineHeight: 1.04, fontWeight: 670, margin: "7px 0 0" }
const description: React.CSSProperties = { fontSize: 14, color: "#B6B0C2", margin: "8px 0 0", lineHeight: 1.45, maxWidth: 620 }
const metricGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, position: "relative" }
const metricCard: React.CSSProperties = { minWidth: 0, padding: "17px 16px", background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 15 }
const metricValue: React.CSSProperties = { fontSize: 23, fontWeight: 760 }
const metricLabel: React.CSSProperties = { fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#837D91", marginTop: 4 }
const list: React.CSSProperties = { marginTop: 16, display: "grid", gap: 9, position: "relative" }
const rowStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "58px minmax(0, 1fr) auto", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.035)" }
const score: React.CSSProperties = { width: 48, height: 48, borderRadius: 14, border: "1px solid rgba(243,215,119,.34)", display: "grid", placeItems: "center", fontWeight: 800, color: "#F3D777" }
const rowTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, lineHeight: 1.35, overflowWrap: "anywhere" }
const rowMeta: React.CSSProperties = { fontSize: 11, color: "#8F899C", marginTop: 4 }
const demoLabel: React.CSSProperties = { fontSize: 12, fontWeight: 780, color: "#9BE3BD" }
const footnote: React.CSSProperties = { margin: "18px 0 0", fontSize: 10, color: "#777184", lineHeight: 1.5 }

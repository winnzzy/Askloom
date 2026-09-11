import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function SourceConvergence(props: { phrase: string }) {
  const { phrase } = props
  return (
    <section style={wrap} aria-label="Source convergence example">
      <div style={backgroundGlow} />
      <div style={content}>
        <div style={eyebrow}>SOURCE CONVERGENCE</div>
        <h2 style={title}>One phrase. Two discovery surfaces.</h2>
        <p style={body}>
          When the same audience phrase appears independently in both Google and YouTube autocomplete, AskLoom records that source evidence and gives it a modest ranking boost. No inferred YouTube fit.
        </p>

        <div style={exampleLabel}>Example source-evidence visualization</div>

        <div style={sourceGrid}>
          <SourceCard label="Google autocomplete" mark="G" phrase={phrase} color="#4285F4" />
          <div style={connector}>
            <div style={connectorLine} />
            <div style={connectorBadge}>CROSS SOURCE</div>
          </div>
          <SourceCard label="YouTube autocomplete" mark="▶" phrase={phrase} color="#FF0033" />
        </div>

        <div style={evidenceBar}>
          <span>Evidence label: Google + YouTube</span>
          <strong>Source boost: +4 max</strong>
        </div>
      </div>
    </section>
  )
}

function SourceCard({ label, mark, phrase, color }: { label: string; mark: string; phrase: string; color: string }) {
  return (
    <article style={sourceCard}>
      <div style={sourceHeader}>
        <div style={{ ...sourceMark, background: color }}>{mark}</div>
        <div>
          <div style={sourceTitle}>{label}</div>
          <div style={sourceMeta}>Observed source</div>
        </div>
      </div>
      <div style={phraseStyle}>{phrase}</div>
    </article>
  )
}

SourceConvergence.defaultProps = { phrase: "ai agents for small business customer service" }

addPropertyControls(SourceConvergence, {
  phrase: { type: ControlType.String, title: "Phrase" },
})

const wrap: React.CSSProperties = { width: "100%", minHeight: 340, borderRadius: 24, background: "#12172A", border: "1px solid rgba(255,255,255,.08)", padding: 26, boxSizing: "border-box", fontFamily: "Inter,sans-serif", color: "#F5EFE4", position: "relative", overflow: "hidden" }
const backgroundGlow: React.CSSProperties = { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%,rgba(118,83,255,.12),transparent 42%)" }
const content: React.CSSProperties = { position: "relative" }
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: ".12em", fontWeight: 800, color: "#9D97AD" }
const title: React.CSSProperties = { fontSize: "clamp(24px, 5vw, 30px)", lineHeight: 1.08, fontWeight: 720, margin: "8px 0 0" }
const body: React.CSSProperties = { fontSize: 13, lineHeight: 1.65, color: "#AFA9BC", maxWidth: 650, margin: "10px 0 0" }
const exampleLabel: React.CSSProperties = { marginTop: 22, fontSize: 11, color: "#D9CAFF", fontWeight: 800 }
const sourceGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(86px,130px) minmax(0,1fr)", gap: 14, alignItems: "center", marginTop: 14 }
const sourceCard: React.CSSProperties = { minWidth: 0, padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.035)" }
const sourceHeader: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10 }
const sourceMark: React.CSSProperties = { width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", color: "#fff", fontWeight: 900 }
const sourceTitle: React.CSSProperties = { fontSize: 12, fontWeight: 800 }
const sourceMeta: React.CSSProperties = { fontSize: 10, color: "#8E899B", marginTop: 2 }
const phraseStyle: React.CSSProperties = { marginTop: 18, padding: 13, borderRadius: 12, background: "rgba(0,0,0,.16)", fontSize: 13, fontWeight: 650, lineHeight: 1.45, overflowWrap: "anywhere" }
const connector: React.CSSProperties = { position: "relative", minHeight: 68, display: "grid", placeItems: "center" }
const connectorLine: React.CSSProperties = { position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "linear-gradient(90deg,#5B8DEF,#B89CFF,#F27C72)" }
const connectorBadge: React.CSSProperties = { position: "relative", width: 58, height: 58, borderRadius: "50%", background: "#1C2340", border: "1px solid rgba(184,156,255,.35)", display: "grid", placeItems: "center", fontWeight: 800, color: "#D9CAFF", fontSize: 10, textAlign: "center", lineHeight: 1.15 }
const evidenceBar: React.CSSProperties = { marginTop: 24, padding: "13px 14px", borderRadius: 13, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.035)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontSize: 11, color: "#9C96A8" }

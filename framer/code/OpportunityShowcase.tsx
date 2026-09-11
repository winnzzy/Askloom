import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Card = { score: number; title: string; intent: string; source: string; reason: string }

const cards: Card[] = [
  { score: 94, title: "How can small businesses use AI agents for customer service?", intent: "Question intent", source: "Google + YouTube", reason: "Specific, actionable and observed across both autocomplete sources." },
  { score: 89, title: "AI agents vs virtual assistants for small business", intent: "Comparison intent", source: "Cross-source", reason: "Evaluation-style query with strong specificity and source convergence." },
  { score: 84, title: "Best AI customer service tools for small business", intent: "Commercial intent", source: "Google source", reason: "Contains clear evaluation language and a specific use case." },
]

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function OpportunityShowcase(props: { title: string; subtitle: string }) {
  const { title, subtitle } = props
  return (
    <section style={wrap} aria-label="Illustrative opportunity score examples">
      <div style={header}>
        <div>
          <div style={eyebrow}>OPPORTUNITY ENGINE</div>
          <h2 style={titleStyle}>{title}</h2>
        </div>
        <p style={subtitleStyle}>{subtitle}</p>
      </div>

      <div style={exampleLabel}>Illustrative product UI. Scores below are examples, not live market data.</div>

      <div style={cardGrid}>
        {cards.map((card, index) => (
          <article key={card.title} style={cardStyle}>
            <div style={rank}>#{index + 1}</div>
            <div style={scoreBox}>
              <strong>{card.score}</strong>
              <span>/100</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={cardTitle}>{card.title}</h3>
              <div style={badgeRow}>
                <span style={badge}>{card.intent}</span>
                <span style={badge}>{card.source}</span>
                <span style={badge}>Example</span>
              </div>
              <p style={reason}>{card.reason}</p>
            </div>
            <div style={icon} aria-hidden="true">-></div>
          </article>
        ))}
      </div>

      <p style={note}>AskLoom does not claim search volume or competition data unless explicitly sourced. Scores remain methodology-led and auditable.</p>
    </section>
  )
}

OpportunityShowcase.defaultProps = {
  title: "Know what deserves your attention first.",
  subtitle: "AskLoom ranks discovered questions using intent, specificity, real autocomplete source evidence, first-party momentum and, only when statistically safe, historical outcome calibration.",
}

addPropertyControls(OpportunityShowcase, {
  title: { type: ControlType.String, title: "Title" },
  subtitle: { type: ControlType.String, title: "Subtitle", displayTextArea: true },
})

const wrap: React.CSSProperties = { width: "100%", fontFamily: "Inter, sans-serif", color: "#191C2B", boxSizing: "border-box" }
const header: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 12, flexWrap: "wrap" }
const eyebrow: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#765BDA" }
const titleStyle: React.CSSProperties = { fontSize: "clamp(28px, 5vw, 34px)", lineHeight: 1.08, fontWeight: 700, margin: "7px 0 0" }
const subtitleStyle: React.CSSProperties = { maxWidth: 430, fontSize: 13, lineHeight: 1.6, color: "#6C6E7B", margin: 0 }
const exampleLabel: React.CSSProperties = { fontSize: 11, color: "#765BDA", fontWeight: 750, marginBottom: 12 }
const cardGrid: React.CSSProperties = { display: "grid", gap: 12 }
const cardStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(28px, 42px) minmax(58px, 74px) minmax(0, 1fr) auto", gap: 14, alignItems: "center", padding: "16px 18px", border: "1px solid #E7E1D5", borderRadius: 18, background: "linear-gradient(180deg,#FFFDF8,#FAF5EA)", boxShadow: "0 10px 30px rgba(36,27,10,.04)", boxSizing: "border-box" }
const rank: React.CSSProperties = { fontSize: 11, color: "#AAA29A", fontWeight: 800 }
const scoreBox: React.CSSProperties = { height: 54, borderRadius: 14, border: "1px solid #D8C883", display: "grid", placeItems: "center", color: "#6D5707", background: "#FFF8D9", fontSize: 12 }
const cardTitle: React.CSSProperties = { fontSize: 15, fontWeight: 730, lineHeight: 1.35, margin: 0, overflowWrap: "anywhere" }
const badgeRow: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }
const badge: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "#625E72", padding: "5px 8px", borderRadius: 999, border: "1px solid #E3DDD1", background: "#F5F0E8" }
const reason: React.CSSProperties = { fontSize: 11, color: "#797A84", margin: "8px 0 0", lineHeight: 1.5 }
const icon: React.CSSProperties = { fontSize: 14, color: "#765BDA", fontWeight: 800 }
const note: React.CSSProperties = { marginTop: 14, fontSize: 11, color: "#8E8F99", lineHeight: 1.5 }

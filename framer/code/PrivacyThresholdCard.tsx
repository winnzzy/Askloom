import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function PrivacyThresholdCard({ benchmarkItems = 5, benchmarkCreators = 3, calibrationItems = 40, calibrationCreators = 8 }) {
  return <section style={wrap}>
    <div style={glow} />
    <div style={copy}>
      <span style={eyebrow}>PRIVACY BY THRESHOLD</span>
      <h3 style={title}>No single creator becomes the market.</h3>
      <p style={body}>AskLoom only promotes account outcomes into broader intelligence after minimum sample and creator thresholds are crossed. Score calibration uses an even stricter gate.</p>
    </div>
    <div style={grid}>
      <div style={card}><span style={label}>Public outcome benchmark</span><strong style={number}>{benchmarkItems}+</strong><span style={meta}>published items</span><strong style={number}>{benchmarkCreators}+</strong><span style={meta}>distinct creators</span></div>
      <div style={card}><span style={label}>Score calibration gate</span><strong style={number}>{calibrationItems}+</strong><span style={meta}>published items overall</span><strong style={number}>{calibrationCreators}+</strong><span style={meta}>distinct creators overall</span></div>
    </div>
  </section>
}

addPropertyControls(PrivacyThresholdCard, {
  benchmarkItems: { type: ControlType.Number, title: "Benchmark Items", min: 1, max: 100, step: 1 },
  benchmarkCreators: { type: ControlType.Number, title: "Benchmark Creators", min: 1, max: 50, step: 1 },
  calibrationItems: { type: ControlType.Number, title: "Calibration Items", min: 1, max: 500, step: 1 },
  calibrationCreators: { type: ControlType.Number, title: "Calibration Creators", min: 1, max: 100, step: 1 },
})

const wrap: React.CSSProperties = { position: "relative", overflow: "hidden", width: "100%", borderRadius: 24, padding: "clamp(24px,4vw,48px)", boxSizing: "border-box", background: "#F4EFE5", color: "#151A2B", border: "1px solid #DED5C4", fontFamily: "Inter, sans-serif", display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(320px,1fr)", gap: 28 }
const glow: React.CSSProperties = { position: "absolute", width: 280, height: 280, borderRadius: "50%", right: -80, top: -110, background: "radial-gradient(circle, rgba(119,92,255,.16), rgba(119,92,255,0) 68%)" }
const copy: React.CSSProperties = { position: "relative", zIndex: 1, alignSelf: "center" }
const eyebrow: React.CSSProperties = { fontSize: 10, letterSpacing: ".15em", fontWeight: 850, color: "#725DE7" }
const title: React.CSSProperties = { fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.04, letterSpacing: "-.035em", margin: "10px 0 14px" }
const body: React.CSSProperties = { color: "#626979", lineHeight: 1.65, fontSize: 15, maxWidth: 620 }
const grid: React.CSSProperties = { position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }
const card: React.CSSProperties = { background: "rgba(255,255,255,.72)", border: "1px solid #E2DACB", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", minHeight: 210 }
const label: React.CSSProperties = { fontSize: 11, color: "#6C7280", marginBottom: 14, fontWeight: 750 }
const number: React.CSSProperties = { fontSize: 34, lineHeight: 1, color: "#251C55", marginTop: 8 }
const meta: React.CSSProperties = { fontSize: 11, color: "#858B98", marginTop: 4 }

import * as React from "react"
import { framer } from "@framer/plugin"

const files = [
  "AskLoomHeader.tsx",
  "BrandMark.tsx",
  "ClosedLoopWorkflow.tsx",
  "ComparisonMatrix.tsx",
  "HeroIntelligenceConsole.tsx",
  "MethodologyEvidence.tsx",
  "OpportunityShowcase.tsx",
  "PrivacyThresholdCard.tsx",
  "ResearchLauncher.tsx",
  "SourceConvergence.tsx",
  "TrendIndexPreview.tsx",
]

const base = "https://raw.githubusercontent.com/winnzzy/Askloom/master/framer/code/"

type Result = { name: string; action: "created" | "updated" | "failed"; detail?: string }

export default function App() {
  const [busy, setBusy] = React.useState(false)
  const [results, setResults] = React.useState<Result[]>([])

  async function install() {
    setBusy(true)
    setResults([])
    const next: Result[] = []

    for (const name of files) {
      try {
        const response = await fetch(`${base}${name}`, { cache: "no-store" })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const code = await response.text()
        const existing = await framer.getCodeFile(name)
        const codeFile = existing
          ? await existing.setFileContent(code).then(() => existing)
          : await framer.createCodeFile(name, code)

        const diagnostics = await codeFile.typecheck()
        const errors = diagnostics.filter((item: any) => item.category === "error" || item.severity === "error")
        next.push({
          name,
          action: existing ? "updated" : "created",
          detail: errors.length ? `${errors.length} type-check issue(s)` : "type-check clean",
        })
      } catch (error: any) {
        next.push({ name, action: "failed", detail: error?.message || "Unknown error" })
      }
      setResults([...next])
    }

    setBusy(false)
  }

  const complete = results.length === files.length && results.every(r => r.action !== "failed")

  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 20, color: "var(--framer-color-text, #111)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", opacity: .55, marginBottom: 8 }}>ASKLOOM</div>
      <h1 style={{ fontSize: 22, lineHeight: 1.15, margin: "0 0 8px" }}>Install Framer components</h1>
      <p style={{ fontSize: 13, lineHeight: 1.55, opacity: .72, margin: "0 0 18px" }}>
        Creates or updates the AskLoom Code Components in this Framer project from the public AskLoom repository, then runs Framer type-checking on each file.
      </p>

      <button
        onClick={install}
        disabled={busy}
        style={{
          appearance: "none",
          border: 0,
          borderRadius: 10,
          padding: "10px 14px",
          fontWeight: 700,
          cursor: busy ? "wait" : "pointer",
          background: "#6C45FF",
          color: "white",
          width: "100%",
        }}
      >
        {busy ? "Installing…" : results.length ? "Sync components again" : "Install 11 components"}
      </button>

      <div style={{ display: "grid", gap: 7, marginTop: 16 }}>
        {results.map(result => (
          <div key={result.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center", padding: "8px 10px", borderRadius: 9, background: "rgba(127,127,127,.08)" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 650 }}>{result.name}</div>
              <div style={{ fontSize: 10, opacity: .6, marginTop: 2 }}>{result.detail}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 750, color: result.action === "failed" ? "#D94D4D" : result.action === "created" ? "#3A9B68" : "#6C45FF" }}>
              {result.action.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {complete && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(63,183,123,.12)", fontSize: 12, lineHeight: 1.5 }}>
          Components are installed. Open Assets → Code in Framer, add them to the canvas, and follow the AskLoom assembly runbook.
        </div>
      )}
    </main>
  )
}

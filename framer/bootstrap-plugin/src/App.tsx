import * as React from "react"
import { framer } from "@framer/plugin"
import { components, publicAppDefault, publicBackendDefault, type ComponentDefinition } from "./componentManifest"

framer.showUI({
  position: "top right",
  width: 360,
  height: 560,
})

type Action = "created" | "updated" | "unchanged" | "failed"
type Result = { name: string; action: Action; detail: string }
type Preflight = {
  apiAvailable: boolean
  insideFramer: boolean
  mode: string
  canWriteCodeFiles: boolean
  detail?: string
}

function fileNameFromPath(path: string) {
  return path.split("/").pop() ?? path
}

function diagnosticIsError(diagnostic: unknown) {
  if (!diagnostic || typeof diagnostic !== "object") return false
  const item = diagnostic as { category?: unknown; severity?: unknown }
  return item.category === "error" || item.severity === "error"
}

function summarize(results: Result[]) {
  return {
    installed: results.filter((result) => result.action === "created").length,
    updated: results.filter((result) => result.action === "updated").length,
    unchanged: results.filter((result) => result.action === "unchanged").length,
    failed: results.filter((result) => result.action === "failed").length,
  }
}

async function fetchComponent(definition: ComponentDefinition) {
  const response = await fetch(definition.source, { cache: "no-store" })
  if (!response.ok) throw new Error(`Source fetch failed: HTTP ${response.status}`)
  return response.text()
}

export default function App() {
  const [busy, setBusy] = React.useState(false)
  const [preflight, setPreflight] = React.useState<Preflight>({
    apiAvailable: false,
    insideFramer: false,
    mode: "unknown",
    canWriteCodeFiles: false,
  })
  const [results, setResults] = React.useState<Result[]>([])

  React.useEffect(() => {
    let active = true

    async function check() {
      const apiAvailable =
        typeof framer.getCodeFiles === "function" &&
        typeof framer.createCodeFile === "function" &&
        typeof framer.getProjectInfo === "function"
      const canWriteCodeFiles =
        apiAvailable &&
        framer.isAllowedTo("createCodeFile", "CodeFile.setFileContent")

      try {
        const info = apiAvailable ? await framer.getProjectInfo() : null
        if (!active) return
        setPreflight({
          apiAvailable,
          insideFramer: Boolean(info?.id),
          mode: framer.mode ?? "unknown",
          canWriteCodeFiles,
          detail: info?.name ? `Project: ${info.name}` : undefined,
        })
      } catch (error) {
        if (!active) return
        setPreflight({
          apiAvailable,
          insideFramer: false,
          mode: framer.mode ?? "unknown",
          canWriteCodeFiles: false,
          detail: error instanceof Error ? error.message : "Framer project check failed",
        })
      }
    }

    void check()
    return () => {
      active = false
    }
  }, [])

  async function install() {
    setBusy(true)
    setResults([])

    const next: Result[] = []

    try {
      const existingFiles = await framer.getCodeFiles()

      for (const component of components) {
        try {
          const code = await fetchComponent(component)
          const existing =
            existingFiles.find(
              (file) =>
                file.path === component.fileName ||
                file.name === component.fileName ||
                fileNameFromPath(file.path) === component.fileName
            ) ?? (await framer.getCodeFile(component.fileName))

          const isUnchanged = existing?.content === code
          const codeFile = existing
            ? isUnchanged
              ? existing
              : await existing.setFileContent(code)
            : await framer.createCodeFile(component.fileName, code, { editViaPlugin: true })

          const diagnostics = await codeFile.typecheck()
          const errors = diagnostics.filter(diagnosticIsError)

          next.push({
            name: component.name,
            action: existing ? (isUnchanged ? "unchanged" : "updated") : "created",
            detail: errors.length ? `${errors.length} type-check error(s)` : "type-check clean",
          })
        } catch (error) {
          next.push({
            name: component.name,
            action: "failed",
            detail: error instanceof Error ? error.message : "Unknown component sync error",
          })
        }

        setResults([...next])
      }
    } catch (error) {
      next.push({
        name: "Preflight",
        action: "failed",
        detail: error instanceof Error ? error.message : "Unable to read Framer Code Files",
      })
      setResults([...next])
    } finally {
      setBusy(false)
    }
  }

  const counts = summarize(results)
  const processed = results.length
  const canRun = preflight.apiAvailable && preflight.insideFramer && preflight.canWriteCodeFiles && !busy

  return (
    <main style={styles.root}>
      <div style={styles.eyebrow}>ASKLOOM</div>
      <h1 style={styles.title}>Bootstrap Code Components</h1>
      <p style={styles.copy}>
        Installs or updates the AskLoom Framer Code Components from the public repository, skips unchanged files, then runs Framer type-checking for each component.
      </p>

      <section style={styles.panel} aria-label="Preflight">
        <div style={styles.panelTitle}>Preflight</div>
        <StatusRow label="Components packaged" value={`${components.length}`} ok />
        <StatusRow label="Framer API available" value={preflight.apiAvailable ? "Yes" : "No"} ok={preflight.apiAvailable} />
        <StatusRow label="Running inside Framer" value={preflight.insideFramer ? "Yes" : "No"} ok={preflight.insideFramer} />
        <StatusRow label="Mode" value={preflight.mode} ok={preflight.mode === "canvas"} />
        <StatusRow label="Operation" value="Install / update matching Code Files" ok />
        <StatusRow label="Secrets included" value="No" ok />
        <StatusRow label="Public URLs" value={`${publicAppDefault} + ${publicBackendDefault}`} ok />
        {preflight.detail && <div style={styles.note}>{preflight.detail}</div>}
      </section>

      <button type="button" onClick={install} disabled={!canRun} style={{ ...styles.button, opacity: canRun ? 1 : 0.55 }}>
        {busy ? "Installing..." : "Install AskLoom Components"}
      </button>

      {results.length > 0 && (
        <section style={styles.panel} aria-label="Install results">
          <div style={styles.panelTitle}>Results</div>
          <div style={styles.countGrid}>
            <Count label="Installed" value={counts.installed} />
            <Count label="Updated" value={counts.updated} />
            <Count label="Unchanged" value={counts.unchanged} />
            <Count label="Failed" value={counts.failed} tone={counts.failed ? "#D94D4D" : undefined} />
          </div>
          <div style={styles.note}>{processed} of {components.length} components processed</div>
          <div style={styles.resultList}>
            {results.map((result) => (
              <div key={result.name} style={styles.resultRow}>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.resultName}>{result.name}</div>
                  <div style={styles.resultDetail}>{result.detail}</div>
                </div>
                <span style={{ ...styles.badge, color: result.action === "failed" ? "#D94D4D" : "#6C45FF" }}>
                  {result.action.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div style={styles.statusRow}>
      <span>{label}</span>
      <strong style={{ color: ok ? "#2F8F5B" : "#D94D4D" }}>{value}</strong>
    </div>
  )
}

function Count({ label, value, tone = "#191C2B" }: { label: string; value: number; tone?: string }) {
  return (
    <div style={styles.countCard}>
      <strong style={{ color: tone }}>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { fontFamily: "Inter, system-ui, sans-serif", padding: 20, color: "var(--framer-color-text, #111)" },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: ".12em", opacity: .55, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 1.15, margin: "0 0 8px" },
  copy: { fontSize: 13, lineHeight: 1.55, opacity: .72, margin: "0 0 18px" },
  panel: { display: "grid", gap: 8, padding: 12, borderRadius: 10, background: "rgba(127,127,127,.08)", marginBottom: 14 },
  panelTitle: { fontSize: 12, fontWeight: 750 },
  statusRow: { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 11, lineHeight: 1.35 },
  note: { fontSize: 10, lineHeight: 1.45, opacity: .65 },
  button: { appearance: "none", border: 0, borderRadius: 10, padding: "11px 14px", fontWeight: 750, cursor: "pointer", background: "#6C45FF", color: "white", width: "100%", marginBottom: 14 },
  countGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 7 },
  countCard: { display: "grid", gap: 2, padding: 8, borderRadius: 8, background: "rgba(255,255,255,.55)", fontSize: 10 },
  resultList: { display: "grid", gap: 7, marginTop: 4 },
  resultRow: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8, alignItems: "center", padding: "8px 0", borderTop: "1px solid rgba(127,127,127,.16)" },
  resultName: { fontSize: 12, fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis" },
  resultDetail: { fontSize: 10, opacity: .6, marginTop: 2 },
  badge: { fontSize: 10, fontWeight: 750 },
}

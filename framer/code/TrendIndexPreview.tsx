import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function TrendIndexPreview(props: {
    apiBase: string
    language: string
    market: string
    title: string
    eyebrow: string
    surface: string
    textColor: string
    muted: string
    accent: string
    limit: number
}) {
    const [state, setState] = React.useState<{ loading: boolean; error?: string; trends: any[] }>({ loading: true, trends: [] })
    const isCanvas = RenderTarget.current() === RenderTarget.canvas

    React.useEffect(() => {
        let active = true
        const controller = new AbortController()
        async function load() {
            try {
                const base = props.apiBase.replace(/\/$/, "")
                const url = `${base}/trends?language=${encodeURIComponent(props.language)}&market=${encodeURIComponent(props.market)}&limit=${props.limit}`
                const response = await fetch(url, { signal: controller.signal })
                if (!response.ok) throw new Error("Trend data unavailable")
                const data = await response.json()
                if (active) setState({ loading: false, trends: Array.isArray(data.trends) ? data.trends : [] })
            } catch (error) {
                if (controller.signal.aborted) return
                if (active) setState({ loading: false, trends: [], error: error instanceof Error ? error.message : "Trend data unavailable" })
            }
        }
        if (!isCanvas) load()
        else setState({ loading: false, trends: [] })
        return () => { active = false; controller.abort() }
    }, [props.apiBase, props.language, props.market, props.limit, isCanvas])

    const demo = [
        { topic: "ai voice agents", trendIndex: 84, direction: "rising", recentSearches: 18, growthPercent: 80 },
        { topic: "faceless youtube", trendIndex: 72, direction: "steady", recentSearches: 13, growthPercent: 12 },
        { topic: "small business automation", trendIndex: 67, direction: "new", recentSearches: 10, growthPercent: null },
    ]
    const rows = isCanvas ? demo : state.trends

    return (
        <section style={{ width: "100%", boxSizing: "border-box", padding: 24, borderRadius: 22, background: props.surface, color: props.textColor, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 90px rgba(0,0,0,0.24)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "end", marginBottom: 20 }}>
                <div>
                    <div style={{ color: props.accent, fontSize: 11, fontWeight: 800, letterSpacing: ".12em" }}>{props.eyebrow}</div>
                    <h3 style={{ margin: "7px 0 0", fontSize: 28, lineHeight: 1.05, fontWeight: 650 }}>{props.title}</h3>
                </div>
                <div style={{ color: props.muted, fontSize: 11, textAlign: "right" }}>{props.language.toUpperCase()} · {props.market}<br/>14-day window</div>
            </div>

            {state.loading && !isCanvas && <div style={{ color: props.muted, padding: "28px 0" }}>Loading live AskLoom signals…</div>}
            {state.error && !isCanvas && <div style={{ color: props.muted, padding: "28px 0" }}>{state.error}</div>}
            {!state.loading && !state.error && rows.length === 0 && !isCanvas && <div style={{ color: props.muted, padding: "28px 0" }}>The dataset is still building. Topics appear after AskLoom’s privacy threshold is met.</div>}

            <div style={{ display: "grid", gap: 10 }}>
                {rows.map((item, index) => (
                    <div key={`${item.topic}-${index}`} style={{ display: "grid", gridTemplateColumns: "54px minmax(0,1fr) auto", gap: 14, alignItems: "center", padding: "14px 0", borderTop: index ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 999, display: "grid", placeItems: "center", border: `1px solid ${props.accent}`, color: props.accent, fontSize: 15, fontWeight: 850 }}>{item.trendIndex}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 760, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.topic}</div>
                            <div style={{ marginTop: 4, color: props.muted, fontSize: 11 }}>{item.recentSearches} recent AskLoom searches · {item.direction}</div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: 12, fontWeight: 800, color: item.growthPercent == null ? props.muted : item.growthPercent >= 0 ? "#54D6B0" : "#FF8176" }}>{item.growthPercent == null ? "NEW" : `${item.growthPercent > 0 ? "+" : ""}${item.growthPercent}%`}</div>
                    </div>
                ))}
            </div>

            <p style={{ color: props.muted, fontSize: 10, lineHeight: 1.5, margin: "18px 0 0" }}>AskLoom Trend Index reflects aggregated AskLoom research activity, not total Google or YouTube search volume.</p>
        </section>
    )
}

TrendIndexPreview.defaultProps = {
    apiBase: "https://askloom-backend.onrender.com/api",
    language: "en",
    market: "NG",
    title: "Signals gaining momentum",
    eyebrow: "ASKLOOM TREND INDEX",
    surface: "#11131B",
    textColor: "#FAF8F2",
    muted: "#8D93A4",
    accent: "#E2CA83",
    limit: 4,
}

addPropertyControls(TrendIndexPreview, {
    apiBase: { type: ControlType.String, title: "API Base" },
    language: { type: ControlType.Enum, title: "Language", options: ["en", "fr", "es"], optionTitles: ["English", "French", "Spanish"] },
    market: { type: ControlType.Enum, title: "Market", options: ["NG", "US", "GB", "CA", "FR", "ES", "MX"] },
    title: { type: ControlType.String, title: "Title" },
    eyebrow: { type: ControlType.String, title: "Eyebrow" },
    limit: { type: ControlType.Number, title: "Rows", min: 1, max: 8, step: 1, defaultValue: 4 },
    surface: { type: ControlType.Color, title: "Surface" },
    textColor: { type: ControlType.Color, title: "Text" },
    muted: { type: ControlType.Color, title: "Muted" },
    accent: { type: ControlType.Color, title: "Accent" },
})

import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ResearchLauncher(props: {
    appUrl: string
    placeholder: string
    buttonLabel: string
    defaultTopic: string
    surface: string
    textColor: string
    accent: string
    borderColor: string
}) {
    const [topic, setTopic] = React.useState(props.defaultTopic || "")
    const isCanvas = RenderTarget.current() === RenderTarget.canvas

    function submit(event: React.FormEvent) {
        event.preventDefault()
        const trimmed = topic.trim()
        if (!trimmed || isCanvas) return
        const target = new URL(props.appUrl)
        target.searchParams.set("topic", trimmed)
        window.location.assign(target.toString())
    }

    return (
        <form
            onSubmit={submit}
            style={{
                width: "100%",
                display: "flex",
                gap: 10,
                padding: 8,
                borderRadius: 18,
                border: `1px solid ${props.borderColor}`,
                background: props.surface,
                boxSizing: "border-box",
                boxShadow: "0 20px 70px rgba(4, 6, 14, 0.24)",
            }}
        >
            <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                aria-label="Research topic"
                placeholder={props.placeholder}
                style={{
                    flex: 1,
                    minWidth: 0,
                    border: 0,
                    outline: 0,
                    background: "transparent",
                    color: props.textColor,
                    fontSize: 16,
                    lineHeight: 1.4,
                    padding: "15px 14px",
                    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                }}
            />
            <button
                type="submit"
                style={{
                    border: 0,
                    borderRadius: 12,
                    padding: "0 22px",
                    minHeight: 50,
                    cursor: isCanvas ? "default" : "pointer",
                    background: props.accent,
                    color: "#0A0B10",
                    fontWeight: 800,
                    fontSize: 14,
                    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                    whiteSpace: "nowrap",
                }}
            >
                {props.buttonLabel}
            </button>
        </form>
    )
}

ResearchLauncher.defaultProps = {
    appUrl: "https://askloom-frontend.onrender.com/",
    placeholder: "Search any topic, product, industry or question",
    buttonLabel: "Start researching →",
    defaultTopic: "",
    surface: "rgba(255,255,255,0.08)",
    textColor: "#FAF8F2",
    accent: "#E2CA83",
    borderColor: "rgba(255,255,255,0.16)",
}

addPropertyControls(ResearchLauncher, {
    appUrl: { type: ControlType.String, title: "App URL" },
    placeholder: { type: ControlType.String, title: "Placeholder" },
    buttonLabel: { type: ControlType.String, title: "Button" },
    defaultTopic: { type: ControlType.String, title: "Topic" },
    surface: { type: ControlType.Color, title: "Surface" },
    textColor: { type: ControlType.Color, title: "Text" },
    accent: { type: ControlType.Color, title: "Accent" },
    borderColor: { type: ControlType.Color, title: "Border" },
})

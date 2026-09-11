import * as React from "react"
import { addPropertyControls, Color, ControlType } from "framer"

type Props = {
    size: number
    background: string
    foreground: string
    accent: string
    rounded: number
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function BrandMark({
    size = 72,
    background = "#0D1224",
    foreground = "#FFFFFF",
    accent = "#6C45FF",
    rounded = 18,
}: Props) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minWidth: size,
                minHeight: size,
                display: "grid",
                placeItems: "center",
                background,
                borderRadius: rounded,
                overflow: "hidden",
            }}
            aria-label="AskLoom brand mark"
        >
            <svg
                viewBox="0 0 100 100"
                width="72%"
                height="72%"
                fill="none"
                role="img"
                aria-hidden="true"
            >
                <path
                    d="M20 72 C30 50 37 32 48 22 C58 13 69 22 66 35 C63 49 49 61 34 67"
                    stroke={foreground}
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M31 32 C43 42 52 53 60 68 C66 79 77 80 82 70"
                    stroke={accent}
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}

BrandMark.defaultProps = {
    width: 72,
    height: 72,
}

addPropertyControls(BrandMark, {
    size: { type: ControlType.Number, title: "Size", min: 24, max: 256, step: 1, defaultValue: 72 },
    background: { type: ControlType.Color, title: "Background", defaultValue: "#0D1224" },
    foreground: { type: ControlType.Color, title: "Stroke", defaultValue: "#FFFFFF" },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#6C45FF" },
    rounded: { type: ControlType.Number, title: "Radius", min: 0, max: 64, step: 1, defaultValue: 18 },
})

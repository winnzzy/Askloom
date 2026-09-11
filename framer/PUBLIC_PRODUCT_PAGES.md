# AskLoom Framer Public Product Pages

This document defines the production-ready public pages to build in Framer. The goal is to make AskLoom feel like a serious content-intelligence platform while keeping claims aligned with current product capabilities.

## Shared design language

- Max content width: 1200px
- Narrow editorial width: 760px
- Section padding desktop: 112px top/bottom
- Tablet: 80px
- Mobile: 56px
- Dark surface: #0E1324
- Deeper surface: #090D18
- Paper: #F6F0E5
- Paper light: #FFF9EE
- Ink: #192033
- Muted: #6E7482
- Violet: #7357FF
- Gold: #C9A94C
- Mint signal: #73D7B5
- Border dark: rgba(255,255,255,.12)
- Border light: rgba(25,32,51,.12)

Use Framer-native stacks, text, frames, effects, breakpoints, CMS, localization and interactions by default. Use Code Components only for live data or app-like visuals.

---

# 1. Product / Opportunity Engine

Path: `/product/opportunity-engine`

SEO title: `AskLoom Opportunity Engine — Decide What to Create Next`

Meta description: `See how AskLoom turns real audience questions, source evidence, first-party momentum and privacy-thresholded outcomes into transparent content opportunity scores.`

## Hero

Eyebrow: `OPPORTUNITY ENGINE`

H1: `Not every question is worth creating for.`

Body: `AskLoom helps you move from hundreds of audience signals to a ranked set of ideas worth investigating first — using transparent evidence rather than an opaque AI number.`

Primary CTA: `Research a topic`
Secondary CTA: `See methodology`

Right visual: use `OpportunityShowcase.tsx`.

## Evidence strip

Four compact cards:

1. `Intent`
   - Question, comparison, commercial and problem-solving signals.
2. `Specificity`
   - More explicit queries can reveal clearer audience needs.
3. `Source evidence`
   - Google, YouTube, or confirmed cross-source presence.
4. `AskLoom learning`
   - First-party momentum and sufficiently aggregated published outcomes.

## Transparent scoring section

H2: `A score you can interrogate.`

Copy: `The Opportunity Score is designed to explain itself. Open any result and AskLoom shows the reasons behind its ranking instead of hiding everything behind a model.`

Use a two-column native Framer layout:
- left: score anatomy diagram
- right: explanation blocks

Current structural score components:
- category/query structure
- intent
- specificity
- AskLoom first-party topic momentum
- source convergence when a phrase is actually observed in both Google and YouTube autocomplete

Outcome calibration:
- disabled until at least 40 published items from 8 creators exist overall for the relevant market/language dataset
- category-specific adjustment requires at least 20 published items from 5 creators
- adjustment capped at ±6 points

Do not claim search volume, CPC or competition unless a future data source provides them.

## Source convergence section

H2: `Cross-source evidence, not guessed platform fit.`

Body: `AskLoom only labels a phrase as cross-source when the same phrase was actually observed from both Google and YouTube autocomplete.`

Use `SourceConvergence.tsx`.

## Calibration section

Dark block.

H2: `The score gets smarter only when the evidence is strong enough.`

Three columns:
- `Collect outcomes`
- `Cross privacy thresholds`
- `Apply a bounded adjustment`

Callout: `Early data never gets to dominate the score.`

## Final CTA

H2: `Find the ideas that deserve your next hour.`
CTA: `Open AskLoom`

---

# 2. Methodology

Path: `/methodology`

SEO title: `AskLoom Methodology — How Our Signals and Scores Work`

Meta description: `Understand AskLoom's research sources, Opportunity Score methodology, Trend Index, privacy thresholds and outcome calibration.`

## Hero

Eyebrow: `METHODOLOGY`

H1: `Useful intelligence should explain itself.`

Body: `AskLoom separates observed data, first-party product signals and heuristics so you can understand what each metric actually means.`

## Core principles

Four Framer-native editorial cards:
- `Observed before inferred`
- `First-party signals are labelled first-party`
- `Privacy thresholds before aggregate learning`
- `No unsupported market claims`

## Research sources

H2: `Where audience signals come from`

Current sources:
- Google autocomplete
- YouTube autocomplete

Explain that language and market parameters are passed where supported.

Do not claim Google Search Console, Google Ads, TikTok, Instagram, Amazon or AI-model search data unless later integrated.

## Opportunity Score methodology

Native stepped diagram:

`Query structure → Intent → Specificity → Source evidence → AskLoom momentum → Optional outcome calibration`

Include note:
`The current score does not claim external search volume or competition data.`

## Trend Index methodology

H2: `What the AskLoom Trend Index measures`

Definition: `Aggregated AskLoom research activity over a 14-day comparison window.`

Public threshold: at least 5 aggregate searches before a topic can appear.

Direction labels:
- new
- rising
- steady
- cooling

Explicit disclaimer: `The Trend Index is not total Google or YouTube market demand.`

## Outcome intelligence methodology

Explain private vs aggregate data:
- private creator performance remains private to account
- public/aggregate benchmarks require at least 5 published items from 3 creators
- score calibration has stricter thresholds
- creator-reported metrics may be imperfect

## Privacy section

H2: `Aggregate intelligence without selling individual behavior.`

Copy should emphasize data minimization, aggregation, no individual user/IP/cookie/device identifier in trend aggregate tables, and no resale of identifiable customer research history as a data product.

## Versioning

Add a methodology version panel:
- Opportunity methodology: `structural + source + bounded outcomes`
- Trend methodology: `askloom-first-party-aggregate-v1`
- Outcome benchmark methodology: `askloom-aggregate-content-outcomes-v1`

---

# 3. Trend Index

Path: `/trend-index`

SEO title: `AskLoom Trend Index — See What Creators Are Researching`

Meta description: `Explore privacy-conscious first-party research momentum inside AskLoom by market and language.`

## Hero

Eyebrow: `ASKLOOM TREND INDEX`

H1: `See what is gaining research momentum.`

Body: `A privacy-conscious view of what AskLoom users are researching over time — useful as a directional signal, never presented as total internet search demand.`

Use `TrendIndexPreview.tsx` as the live hero data component when MARKETING_URL is configured.

## Explanation band

Three facts:
- `14-day window`
- `5-search privacy threshold`
- `First-party AskLoom activity`

## Trend cards

Use live component for a few highlights. For the deeper experience, CTA into the authenticated/public React Trend Index route until Framer fully reproduces it.

CTA: `Explore live Trend Index`

## Why it matters

Editorial three-column section:
- `Spot rising research themes`
- `Compare recent vs previous activity`
- `Move promising topics into research`

## What it is not

Paper section with strong typography:
`Not Google Trends. Not search volume. Not a black-box prediction.`

Body explains exact scope.

---

# 4. AI Studio

Path: `/product/ai-studio`

SEO title: `AskLoom AI Studio — Turn Research Into Versioned Content`

Meta description: `Move from a saved audience opportunity into structured titles, hooks, briefs, scripts, shorts and reusable content versions.`

## Hero

Eyebrow: `AI STUDIO`

H1: `Create from evidence, not a blank prompt.`

Body: `Start with a real audience opportunity, generate a structured content package, regenerate individual sections and keep every version.`

Primary CTA: `Open AI Studio`
Secondary: `See the workflow`

Hero visual should be a Framer-native mock interface, not live generation.

## Workflow

Native Framer sequence:
`Saved opportunity → Content package → Section regeneration → Version history → Export`

## Structured package

Eight cards:
- titles
- hooks
- brief
- outline
- script
- shorts
- description
- next steps

## Versioning

H2: `Iteration without destroying your previous work.`

Show stacked version cards: v1, v2, v3.

## Guardrails

Explain that prompts instruct the model not to invent evidence/statistics/quotes and to mark factual research placeholders `[VERIFY]` where appropriate.

Do not imply AI generation is currently available if Gemini is still unconfigured in production. Use wording such as `AI Studio is designed to...` until GEMINI_API_KEY is live.

---

# 5. Content Planner

Path: `/product/planner`

SEO title: `AskLoom Content Planner — From Idea to Published Outcome`

Meta description: `Plan content from validated audience opportunities, assign ownership, track publishing status and capture performance outcomes.`

## Hero

Eyebrow: `CONTENT PLANNER`

H1: `Turn research into an operating rhythm.`

Body: `Move ideas through a clear editorial pipeline, keep ownership and deadlines visible, then connect published outcomes back to the original audience signal.`

## Pipeline visual

Use native Framer horizontal pipeline:
`Ideas → Planned → In progress → Published`

Cards show sample fields:
- Opportunity Score
- Project
- Platform
- Assignee
- Due date

## Published outcome panel

Show views, engagements and conversions.

Explain these are creator-entered first-party metrics today.

## Closed-loop intelligence section

Dark block.

H2: `The long-term advantage is the feedback loop.`

Diagram:
`Audience signal → Opportunity → Content → Publication → Outcome → Aggregate learning`

Disclaimer: `Aggregate learning only activates after privacy and sample-size thresholds are met.`

---

# 6. Pricing

Path: `/pricing`

Do not invent final pricing until commercial decisions are approved.

Framer page should support 4 plan cards:
- Free
- Creator
- Pro
- Team

Design recommendations:
- Creator highlighted visually
- monthly/yearly toggle native Framer
- comparison table below cards
- FAQ CMS section

Current product packaging recommendation:

Free:
- limited daily research
- basic Opportunity Scores
- Trend Index browsing

Creator:
- expanded/unlimited research depending approved limits
- saved opportunities/projects
- AI Studio allowance
- content planner

Pro:
- higher AI limits
- deeper workflow/history/export
- advanced trend/outcome intelligence as released

Team:
- seats
- shared projects
- team workflows
- organization-level controls as implemented

Important: the existing Flutterwave V4 paid checkout remains blocked until hosted checkout support is implemented. Do not publish a working paid CTA that suggests checkout is ready. Use `Join waitlist`, `Contact us`, or disabled/coming-soon state until payment is operational.

---

# 7. Shared AI Studio + Planner storytelling section for homepage

Use a two-panel dark section.

Left panel: AI Studio
Headline: `From opportunity to first draft.`
Supporting line: `Generate a structured content package from a saved audience signal.`
Visual: version stack + content sections.

Right panel: Planner
Headline: `From first draft to published outcome.`
Supporting line: `Plan, assign, publish and record what happened next.`
Visual: compact four-column pipeline.

Connector line below both:
`Research → create → publish → learn`

---

# 8. Framer implementation notes

Use native Framer for:
- all headings/copy
- page layout and responsive stacks
- pricing cards
- FAQ
- methodology diagrams where static
- hero backgrounds
- gradients/noise overlays
- section transitions
- localized text

Use Code Components for:
- TrendIndexPreview
- ResearchLauncher
- OpportunityShowcase where desired
- SourceConvergence
- future live public benchmark widgets

Avoid embedding authenticated product screens directly in Framer.

Primary app CTA base URL: `https://app.askloom.com` once DNS is configured. Until then use the current Render frontend URL.

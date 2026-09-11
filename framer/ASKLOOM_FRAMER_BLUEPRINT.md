# AskLoom — Framer World-Class Experience Blueprint

## 1. Architecture Decision

Use **Framer itself** for the public-facing brand and marketing experience. Keep the authenticated SaaS application in the existing React/Vite frontend until specific app surfaces are deliberately rebuilt as Framer Code Components.

Recommended domain split:

- `www.askloom.com` — Framer: homepage, product, pricing, Trend Index marketing/preview, methodology, resources, comparison pages, localization, SEO.
- `app.askloom.com` — existing React application: authenticated research workspace, Opportunity Engine, saved opportunities, projects, AI Studio, Studio Library, planner, account/billing/admin.
- `api.askloom.com` — existing Express API when a custom backend domain is introduced. Until then use the current Render API origin.

Why this split:

- Framer is strongest at high-end visual composition, motion, content, localization, SEO and editorial pages.
- AskLoom's authenticated app is list-heavy, stateful, API-driven and uses JWT + refresh-session cookies. Rebuilding all of that in Framer immediately would add risk without improving the core product.
- Public API-backed UI can still be embedded into Framer through Fetch or Code Components.
- The application can progressively adopt Framer-designed shared components later.

## 2. Brand Positioning

Primary statement:

> Know what people want before you create.

Product category:

> Audience intelligence for creators, marketers and content teams.

Differentiated promise:

> Discover real audience questions, rank what is worth creating, turn opportunities into production-ready content, and learn from what actually performs.

Supporting line:

> Research → Opportunity Score → AI Studio → Planner → Outcome Intelligence.

Do not position AskLoom as a generic keyword tool or generic AI writer.

## 3. Visual Direction

### Personality

- Editorial intelligence
- Premium SaaS
- Confident, calm, evidence-led
- African-founded but globally positioned; avoid decorative stereotypes
- More Bloomberg / Linear / Stripe / Arc / high-end editorial product than generic purple SaaS

### Palette

Create Framer Color Styles rather than hardcoding colors.

- `Ink/950` — `#0A0B10`
- `Ink/900` — `#11131B`
- `Ink/800` — `#171A24`
- `Paper/50` — `#FAF8F2`
- `Paper/100` — `#F3EFE5`
- `Paper/200` — `#E7E0D0`
- `Gold/500` — `#C9A84A`
- `Gold/300` — `#E2CA83`
- `Violet/500` — `#7357FF`
- `Violet/300` — `#A897FF`
- `Mint/400` — `#54D6B0`
- `Coral/400` — `#FF8176`
- `Text/Primary` — `#161722`
- `Text/Muted` — `#727789`

Use gold as evidence/value, violet as product intelligence/AI, mint for positive/rising states, coral for cooling/errors.

### Typography

Use two families maximum.

Display:
- Prefer `Instrument Serif`, `DM Serif Display`, `Newsreader`, or another editorial serif available in Framer.

UI/body:
- Prefer `Inter`, `Geist`, `Manrope`, or `Satoshi` equivalent available in the project.

Set Framer Text Styles:

- `Display/XL`: 88–104 desktop / 58 tablet / 42 mobile, 0.94–1.0 line height
- `Display/L`: 64 / 48 / 36
- `Heading/H2`: 48 / 38 / 30
- `Heading/H3`: 28 / 24 / 22
- `Body/L`: 20 / 18 / 17
- `Body/M`: 16
- `Label/XS`: 11–12, tracking 0.08–0.12em
- `Data/M`: 13–14 tabular figures

## 4. Layout System

Use Framer Stacks everywhere possible.

Desktop:
- Page max width: 1440
- Content max width: 1240
- Horizontal page padding: 48–64
- Section vertical rhythm: 112–160

Tablet:
- Padding: 32
- Sections: 88–112

Mobile:
- Padding: 20
- Sections: 64–88

Create reusable layout components:

- `Layout/Container`
- `Layout/Section`
- `Layout/Split`
- `Layout/Grid12`
- `Layout/StackGap24`

## 5. Core Component Library

Create a dedicated Framer Library project and publish these components to the workspace library.

### Navigation

`Navigation/Header`
Variants:
- Desktop
- Tablet
- Phone
- Light
- Dark
- Scrolled

Contains:
- Logo
- Product
- Trends
- Methodology
- Pricing
- Resources
- Log in
- Start researching CTA

### Buttons

`Buttons/Primary`
`Buttons/Secondary`
`Buttons/Ghost`
`Buttons/Text`

States:
- Default
- Hover
- Pressed
- Focus
- Disabled

### Data chips

`Data/SignalBadge`
Variants:
- Google
- YouTube
- Cross-source
- Rising
- Cooling
- Outcome-backed

### Opportunity card

`Product/OpportunityCard`
Properties:
- Rank
- Score
- Phrase
- Intent
- Source badge
- Trend label
- Calibration state

### Trend card

`Product/TrendCard`
Properties:
- Topic
- Trend Index
- Direction
- Recent activity
- Growth

### Workflow node

`Product/WorkflowStep`
Variants:
- Discover
- Understand
- Prioritize
- Create
- Publish
- Learn

### Proof / methodology components

`Trust/MethodologyCallout`
`Trust/PrivacyThreshold`
`Trust/SourceCoverage`

## 6. Homepage Structure

### 6.1 Header

Transparent over hero. Switch to blurred dark surface after scroll.

Primary CTA:
- `Start researching`

Secondary:
- `See how scoring works`

### 6.2 Hero

Eyebrow:

`AUDIENCE INTELLIGENCE FOR CONTENT TEAMS`

H1:

`Know what people want before you create.`

Body:

`Discover real questions from Google and YouTube, find the opportunities worth pursuing, create from the evidence, and learn from what performs.`

Hero search shell should resemble the actual AskLoom research bar, but on the marketing site it should either:

1. send the topic to `app.askloom.com/?topic=...`, or
2. show a lightweight public preview via an API-backed Code Component.

Do not fake search-volume numbers.

Hero visual should be a polished animated intelligence console with:

- Topic
- Source coverage
- Three real-looking but clearly demo-labeled opportunities
- Opportunity Scores
- Source badges
- Momentum markers
- animated connection lines / subtle orbital map

Motion:
- stagger 60–90ms
- spring-like easing
- no looping decorative motion longer than needed
- respect reduced-motion

### 6.3 Credibility strip

Four statements:

- Google + YouTube source evidence
- Explainable Opportunity Score
- Privacy-thresholded outcome intelligence
- Multilingual research targeting

### 6.4 Product story

Headline:

`From audience signal to published content.`

Six connected stages:

1. Discover
2. Understand
3. Prioritize
4. Create
5. Publish
6. Learn

Each stage should reveal a real UI fragment on scroll.

### 6.5 Opportunity Engine section

Headline:

`Not every question deserves a video.`

Show two stacked opportunity cards:
- weak generic query
- stronger specific cross-source query

Show scoring factors:
- intent
- specificity
- source evidence
- AskLoom momentum
- outcome calibration, only when thresholds are met

Copy must explicitly state that AskLoom does not currently claim proprietary web-wide search volume or competition data.

CTA:
`How the score works`

### 6.6 Source evidence section

Split layout with Google and YouTube paths converging into `Cross-source`.

Headline:

`See where the signal came from.`

This visually explains that AskLoom now preserves source provenance rather than merging all autocomplete phrases into an opaque list.

### 6.7 Trend Index section

Dark cinematic section.

Headline:

`See what your market is researching before everyone calls it a trend.`

Use real public `/api/trends` data when enough first-party activity exists.

Disclosure:

`AskLoom Trend Index reflects aggregated AskLoom research activity, not total Google or YouTube search volume.`

### 6.8 AI Studio section

Do not present generic text generation.

Headline:

`Create from an opportunity, not from a blank prompt.`

Visual flow:

Opportunity → brief → titles → hooks → outline → script → shorts → next steps

Show version history and section regeneration as product differentiators.

### 6.9 Planner / outcome section

Headline:

`Close the loop between research and results.`

Show:
- Ideas
- Planned
- In progress
- Published

Then an outcome panel:
- views
- engagements
- conversions
- private creator summary
- aggregate benchmark disclosure

### 6.10 Privacy / trust section

Headline:

`Useful intelligence without selling individual histories.`

Explain:
- aggregated product signals
- no individual user/IP/cookie/device identity in trend intelligence
- public outcome benchmarks require minimum data and multiple distinct creators
- creator workspace data remains private

### 6.11 Pricing

Three tiers recommended for visual design only until commercial pricing is finalized:

- Free
- Creator
- Team

Do not publish placeholder prices as final unless approved.

### 6.12 Final CTA

Headline:

`Stop guessing what to create next.`

CTA:
`Start researching`

Secondary:
`Explore the Trend Index`

## 7. Additional Public Pages

Build these in Framer:

- `/product`
- `/opportunity-score`
- `/trends`
- `/ai-studio`
- `/planner`
- `/pricing`
- `/methodology`
- `/privacy-intelligence`
- `/compare/answerthepublic`
- `/resources`

CMS collections:

- Resources
- Use Cases
- Comparisons
- Methodology updates
- Product changelog

## 8. Localization

Use Framer Localization for the public site.

Launch locales:
- English
- French
- Spanish

Research language and target market inside the app remain application controls rather than marketing-site locale controls.

Localization rules:
- translate page titles/descriptions/alt text
- preserve branded terms such as AskLoom, Opportunity Score, Trend Index and AI Studio unless language-specific product naming is deliberately chosen
- test each breakpoint per locale because text expansion will alter composition

## 9. SEO / Structured Content

Every Framer page should have:

- one clear semantic H1
- concise title + meta description
- canonical URL
- OG image
- descriptive image alt text
- semantic navigation/footer tags
- FAQ schema only where genuine FAQs exist
- SoftwareApplication/Product schema only if the page content supports it

Create long-form indexable pages for methodology, comparison and use-case intent instead of hiding key product copy inside overlays.

## 10. Motion System

World-class does not mean excessive motion.

Use:
- opacity + Y 12–24px section entrances
- staggered cards
- subtle scale 0.98 → 1.0 on reveal
- navigation blur transition
- card hover elevation 2–6px
- data line draw for source convergence
- spring score-number reveal

Avoid:
- constant floating blobs
- oversized cursor effects
- parallax on every section
- motion that blocks reading

## 11. Accessibility

- visible keyboard focus
- minimum AA text contrast
- semantic heading hierarchy
- labels for icon-only buttons
- reduced motion mode
- target size around 44px for primary mobile interactions
- no text baked into images

## 12. Framer-native Data Integration

### Use Framer Fetch for

- public aggregate Trend Index values
- simple product-status values
- simple API-driven text/numbers

### Use Framer Code Components for

- live opportunity preview
- animated source evidence visualization
- interactive score explainer
- any repeated/list-based public API results

### Keep in the React app for now

- login/signup
- refresh-session auth
- research workspace
- project management
- AI Studio authenticated generation
- Studio Library
- planner
- billing
- admin

## 13. Authentication / Domain Strategy

Recommended:

- `www.askloom.com` → Framer
- `app.askloom.com` → existing frontend
- app CTA links from Framer should pass only non-sensitive query parameters such as `?topic=ai%20agents`.

Do not expose JWTs, API keys, payment secrets or authenticated state inside Framer custom code.

## 14. Framer Build Order

1. Foundation styles
2. Header + buttons + layout library
3. Homepage hero
4. Product workflow
5. Opportunity Engine / methodology
6. Source evidence
7. Trend Index
8. AI Studio
9. Planner / outcome intelligence
10. Privacy / trust
11. Pricing
12. Footer
13. Responsive pass
14. Localization
15. SEO/accessibility pass
16. staging review
17. custom domain launch

## 15. Quality Bar

The redesign is ready only when:

- product purpose is clear in under 10 seconds
- mobile has no desktop-only scaled-down layouts
- every animation has a communication purpose
- no metric is invented
- source evidence labels are real
- score methodology is inspectable
- public trend/outcome claims carry methodology disclosure
- Lighthouse/Core Web Vitals are reviewed after publishing
- every CTA leads to a useful product action

## 16. First Framer Canvas to Build

Start with one page only: the homepage.

Create frames in this exact order:

1. Header
2. Hero
3. Credibility strip
4. Workflow
5. Opportunity Engine
6. Source Evidence
7. Trend Index
8. AI Studio
9. Planner / Outcomes
10. Privacy
11. Pricing
12. Final CTA
13. Footer

Do not begin with CMS or secondary pages until the homepage visual system is approved.

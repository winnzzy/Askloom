# AskLoom Framer Homepage Assembly

## Principle
Use Framer canvas for layout, typography, responsive sections, CMS, localization, buttons and motion. Use Code Components only where real product behavior/data adds value. The site should feel editorial, premium and calm—not like a generic SaaS template.

## Global frame
- Page max width: 1280px
- Content max width: 1180–1240px depending on section
- Desktop horizontal padding: 32px
- Tablet: 24px
- Mobile: 18px
- Section vertical spacing desktop: 112–144px
- Tablet: 88–104px
- Mobile: 64–80px

## Type scale
Use a restrained grotesk/sans family with strong optical sizing.
- Hero H1: 76–92px desktop / 56–64 tablet / 42–50 mobile, line-height 0.94–1.0, tracking -0.055em
- Section H2: 48–60 desktop / 38–44 tablet / 32–38 mobile
- H3: 24–30
- Lead body: 18–20 / 1.55
- Body: 14–16 / 1.6
- Data labels: 10–12 uppercase, tracking .10–.14em

## Color system
- Ink: #15182A
- Deep Loom: #0E1220
- Deep Panel: #12172A
- Paper: #F7F2E8
- Paper Warm: #FFFDF8
- Muted Ink: #6C6E7B
- Violet Thread: #765BDA
- Soft Violet: #B89CFF
- Gold Thread: #F3D777
- Mint Signal: #9BE3BD
- Soft Border Light: #E7E1D5
- Soft Border Dark: rgba(255,255,255,.08)

## Homepage order
1. Header
2. Hero
3. Evidence strip
4. Workflow story
5. Opportunity Engine
6. Source Convergence
7. Trend Index
8. AI Studio
9. Content Planner / Outcomes
10. Privacy & methodology
11. Pricing
12. Closing CTA
13. Footer

## 1. Header
Use `AskLoomHeader.tsx` inside a sticky Framer frame.
- Sticky top: 0
- z-index: 100
- no page-wide opaque bar; keep floating glass pill
- scroll transition: scale from 1 to .985 and increase backdrop blur
- mobile: replace middle nav with native Framer menu overlay; keep logo + primary CTA

## 2. Hero
Native Framer two-column section.
Left: canvas layers.
Right: `HeroIntelligenceConsole.tsx`.

Eyebrow:
AUDIENCE INTELLIGENCE FOR CREATORS & TEAMS

H1:
Know what people want before you create.

Lead:
Discover real questions across Google and YouTube, understand audience intent, find the strongest angles, and move the best ideas from research to publication.

Primary action: large native Framer button or `ResearchLauncher.tsx` directly below lead.
Secondary action: `See how AskLoom scores opportunities` → /methodology

Hero layout desktop: 54% copy / 46% console.
Hero height: minimum 820px including header spacing.

Hero motion:
- eyebrow fade+rise 10px, .45s
- H1 staggered by word or line, 30–45ms
- research box .6s delay
- console scale .97→1 + opacity .3→1
Do not use looping decorative animations.

## 3. Evidence strip
Native Framer horizontal band. Four items:
- Google + YouTube evidence
- Audience intent clusters
- Transparent opportunity scoring
- Privacy-thresholded outcomes

Use small icons, uppercase labels, subtle divider rules. Avoid fake counts.

## 4. Workflow story
Large paper section, 5 steps:
Discover → Understand → Prioritize → Create → Learn

Each step should have one strong verb, one short sentence and one product screenshot/frame fragment. Use scroll-linked reveal, not carousel autoplay.

## 5. Opportunity Engine
Use `OpportunityShowcase.tsx` inside warm paper section.
Native Framer heading beside/above it:
"Not every question deserves your next video."

Support copy:
AskLoom scores what it can defend: intent, specificity, observed sources, first-party momentum and—only when statistically safe—historical outcome patterns.

Add methodology link under component.

## 6. Source Convergence
Dark full-width section.
Use `SourceConvergence.tsx`.
Headline:
"See where audience intent overlaps."

Do not call a phrase "YouTube fit" unless the actual product returned YouTube evidence. This section exists to make that product principle visual.

## 7. Trend Index
Dark-to-paper transition section.
Use `TrendIndexPreview.tsx` as live data component.
Important labels:
- AskLoom Trend Index
- First-party aggregated research activity
- Not total web search volume

If the live threshold is not met, show the component empty state rather than demo numbers.

## 8. AI Studio
Native Framer product-story section with static product screenshot/visual treatment.
Headline:
"Turn a validated opportunity into a production-ready content package."

Show:
- titles
- hooks
- brief
- outline
- script
- shorts
- description
- version history

CTA: Open AI Studio → app domain.
Do not claim generation is live until GEMINI_API_KEY is configured in production.

## 9. Planner / Outcomes
Warm/white section.
Left: visual Kanban board mock based on real product states: Ideas, Planned, In progress, Published.
Right: outcome intelligence card.

Headline:
"Close the loop between what people ask and what actually performs."

Explicitly say account performance remains private and broader benchmarks only appear after privacy thresholds are satisfied.

## 10. Privacy & methodology
Two-column editorial section.
Left: "Built to become smarter without selling your identity."
Right: rules:
- no user/IP/device identifiers in Trend Index aggregates
- minimum thresholds before public benchmark display
- stricter thresholds before calibration affects ranking
- methodology visible to users

CTA: Read methodology

## 11. Pricing
Native Framer cards. Keep visually simple. Avoid too many feature bullets.
Use three tiers when product packaging is finalized:
Free / Creator / Pro or Team.
Do not publish payment CTA for paid plans until Flutterwave hosted checkout is production-ready.

## 12. Closing CTA
Dark cinematic section, 520–620px high.
H2: "Make the next thing people are already asking for."
Research launcher beneath it.

## 13. Footer
Minimal 4-column footer:
Product / Resources / Company / Legal
Include language selector.

## Framer component inventory
Code Components:
- AskLoomHeader.tsx
- ResearchLauncher.tsx
- HeroIntelligenceConsole.tsx
- OpportunityShowcase.tsx
- SourceConvergence.tsx
- TrendIndexPreview.tsx

Keep native in Framer:
- section frames
- headlines/body copy
- pricing cards
- workflow step cards
- screenshots/product mock containers
- footer
- FAQ/CMS content
- mobile navigation overlay
- localization variants

## Responsive rules
Desktop > 1200: full two-column compositions.
Tablet 768–1199: preserve 2 columns where readable; reduce hero H1; stack Opportunity section heading above component.
Mobile < 768:
- single-column sections
- component radius 18–20px
- remove nonessential decorative blobs
- ResearchLauncher full width
- hide long source-reason copy from first view
- show 2–3 strongest metrics only
- use native mobile nav overlay

## Motion rules
- duration: 300–650ms
- easing: cubic-bezier(.2,.8,.2,1)
- entrance movement: 8–18px maximum
- no infinite logo/gradient animation
- no cursor-follow gimmicks
- use scroll-linked parallax only for large ambient backgrounds, max 20px movement
- honor prefers-reduced-motion

## Framer setup checklist
1. Create design tokens as Color/Text Styles.
2. Create Desktop/Tablet/Mobile breakpoints before page assembly.
3. Add the Code Components from `/framer/code` to Framer Code.
4. Build shared native components: Button, Eyebrow, Section Header, Feature Card, Pricing Card, Footer Column.
5. Build homepage in the order above.
6. Set app-domain links on all product CTAs.
7. Set real Framer staging/custom origin as backend `MARKETING_URL` before live Trend Index fetches.
8. Configure Framer locales: EN, FR, ES.
9. Add title/description/OG metadata per locale.
10. Test keyboard, contrast, reduced motion, 320px mobile width and 1440px desktop.

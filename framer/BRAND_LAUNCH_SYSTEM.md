# AskLoom — Brand & Launch System

## Brand position
AskLoom is an audience-intelligence workflow for creators and content teams.

Primary promise: **Know what people want before you create.**

Supporting line: **Discover audience demand. Rank the opportunity. Create with context. Track what worked.**

Do not position AskLoom as a generic AI writer, a complete technical SEO suite, or a provider of total-market search volume.

## Wordmark
Use a text-first wordmark: `AskLoom`.
- Ask: near-black/white depending on surface.
- Loom: restrained violet accent.
- No decorative AI sparkles.
- No robot/brain iconography.
- Keep clear space equal to the cap height of the A.

### Product mark
Use a simple woven-signal monogram: two continuous rounded strokes forming an abstract `A/L` and crossing once. It should read as signal convergence + weaving, not as a literal loom.

## Core palette
- Ink 950: `#0D1224`
- Ink 900: `#11172A`
- Ink 800: `#1C2440`
- Paper: `#F7F5EF`
- White: `#FFFFFF`
- Violet: `#6C45FF`
- Violet soft: `#8D73FF`
- Gold: `#D7A94A`
- Green signal: `#3FB77B`
- Muted text: `#737B8C`
- Border light: `#E3E5EB`

Gold is an editorial accent, not the main CTA color. Violet owns interaction and intelligence.

## Typography
Framer-native recommendation:
- Display: **Manrope** 700–800
- Body/UI: **Inter** 400–700

Display scale desktop: 76 / 60 / 48 / 36 / 28 / 22.
Body: 18 / 16 / 14 / 12.
Mobile hero: 46–52 with tight leading.

## Homepage final copy hierarchy
Eyebrow: `AUDIENCE INTELLIGENCE FOR CONTENT DECISIONS`
H1: **Know what people want before you create.**
Subhead: `Discover real audience questions from Google and YouTube, rank the strongest opportunities, turn them into content, and learn from what performs.`
Primary CTA: `Research a topic`
Secondary CTA: `See how scoring works`
Trust microcopy: `Source-aware research · Transparent scoring · Privacy-thresholded learning`

### Evidence strip
`Google autocomplete` · `YouTube autocomplete` · `First-party AskLoom momentum` · `Creator-reported outcomes`

### Opportunity section
Eyebrow: `FROM QUESTIONS TO DECISIONS`
Headline: **A list of keywords is not a content strategy.**
Body: `AskLoom groups audience questions, identifies intent, preserves source evidence, and scores opportunities so you can decide what deserves production time.`
CTA: `Explore Opportunity Engine`

### Trend section
Headline: **See what AskLoom researchers are leaning into.**
Body: `Trend Index measures first-party AskLoom research activity by market and language. It is not presented as total Google or YouTube demand.`
CTA: `Explore Trend Index`

### Creation section
Headline: **Turn the opportunity into a production-ready package.**
Body: `Carry research context into AI Studio for titles, hooks, outlines, scripts, descriptions and short-form variants—with version history and export.`
CTA: `Explore AI Studio`

### Planner section
Headline: **Close the loop after the idea.**
Body: `Move opportunities through planning and production, record publishing outcomes, and build a private performance history that can improve future decisions.`
CTA: `Explore Content Planner`

### Final CTA
Eyebrow: `RESEARCH WITH A NEXT STEP`
Headline: **Find the opportunity. Then do something with it.**
Primary: `Start researching`
Secondary: `Read the methodology`

## OG/social system
Create 1200×630 masters in Framer using native frames.

### Default OG
Dark Ink 950 background. Small AskLoom wordmark top-left. Large line: `Know what people want before you create.` Bottom-right: a cropped Opportunity Score / source-evidence visual. Avoid screenshots with unreadably small UI.

### Page OG variants
- Opportunity Engine: `Rank what deserves to be created.`
- Trend Index: `First-party research momentum, made visible.`
- AI Studio: `From audience signal to production-ready content.`
- Planner: `From idea to published outcome.`
- Methodology: `Transparent signals. Explainable scoring.`
- Comparison: `Research is only the beginning.`
- Privacy: `Useful intelligence without selling individual behavior.`

## Favicon and app icon
Use the woven-signal monogram only.
- Favicon: 32×32 and 48×48.
- Apple touch: 180×180.
- App/PWA: 192×192 and 512×512.
- Use Ink 950 background + white/violet mark for dark icon; Paper + Ink 950 for light alternative.
- Test at 16×16 before approval. If crossing detail disappears, simplify to two strokes.

## SEO metadata
### Home `/`
Title: `AskLoom — Audience Intelligence for Content Decisions`
Description: `Discover audience questions from Google and YouTube, rank content opportunities, create with context, and learn from published outcomes.`

### Opportunity Engine `/opportunity-engine`
Title: `Opportunity Engine — Prioritize Content Ideas | AskLoom`
Description: `Turn audience questions into explainable content opportunities using intent, specificity, source evidence, AskLoom momentum and privacy-thresholded outcome learning.`

### Trend Index `/trends`
Title: `AskLoom Trend Index — First-Party Research Momentum`
Description: `Explore privacy-thresholded trends in what AskLoom users are researching by language and market. Trend Index reflects AskLoom activity, not total search demand.`

### AI Studio `/ai-studio`
Title: `AI Studio — Turn Research Into Content | AskLoom`
Description: `Carry audience research into titles, hooks, briefs, outlines, scripts, short-form variants and production-ready exports.`

### Planner `/content-planner`
Title: `Content Planner — From Opportunity to Outcome | AskLoom`
Description: `Plan researched content opportunities, manage production status, record publishing outcomes and build a private performance history.`

### Methodology `/methodology`
Title: `How AskLoom Works — Signals, Scoring & Privacy`
Description: `Understand AskLoom's source evidence, Opportunity Score, Trend Index, outcome calibration thresholds and privacy methodology.`

### Pricing `/pricing`
Title: `AskLoom Pricing`
Description: `Compare AskLoom plans for audience research, opportunity prioritization, AI-assisted creation and content planning.`
Do not publish prices until final commercial tiers and payment flow are approved.

### Comparison `/compare/answerthepublic`
Title: `AskLoom vs AnswerThePublic — From Research to Production`
Description: `Compare two different content-research workflows. See how AskLoom connects audience discovery with prioritization, creation, planning and outcome learning.`

### Privacy `/privacy-security`
Title: `Privacy & Security | AskLoom`
Description: `Learn how AskLoom separates private workspace data from privacy-thresholded aggregate intelligence and minimizes unnecessary personal data collection.`

## Structured data
Use Framer custom code or JSON-LD fields where appropriate.

### Organization
- name: AskLoom
- url: final marketing domain
- logo: final absolute logo URL
Do not add social `sameAs` until official accounts exist.

### SoftwareApplication
Use on Home/Product pages:
- applicationCategory: BusinessApplication
- operatingSystem: Web
- name: AskLoom
Do not add aggregateRating/review fields until genuine public review data exists.

### FAQPage
Use only on the dedicated FAQ page and only for FAQs visibly present on that page.

### BreadcrumbList
Use on deeper Product, Solution, Resource and Comparison pages.

## Framer CMS
Create collections:

### Resources
Fields: title, slug, excerpt, category, author, publishedAt, updatedAt, cover, body, seoTitle, seoDescription, featured, canonicalUrl.
Categories: Methodology, Guides, Research, Product education.

### Changelog
Fields: title, slug, date, summary, body, tags, status.
Status: New, Improved, Fixed.

### Use cases
Prefer static pages initially because there are only four and each needs bespoke conversion design. Move to CMS only when the set grows.

### Comparisons
CMS-ready fields: competitorName, slug, intro, lastReviewedAt, sourceLinks, rows, faq, seoTitle, seoDescription. Every comparison needs a visible `Last reviewed` date.

## Indexing rules
Index: home, product pages, use cases, methodology, FAQ, pricing, privacy/security, high-quality resource posts, comparison pages with verified current claims.
Noindex: temporary campaign pages, duplicate localization tests, thin tag pages, staging domain.
Canonicalize localized/duplicate content correctly. Use Framer localization hreflang output and verify after publish.

## Launch quality gates
- No fake testimonials, customer logos, ratings, search volume or market-size claims.
- No claim that Trend Index equals Google/YouTube market demand.
- No claim that Opportunity Score predicts guaranteed performance.
- Comparison facts reviewed against current official competitor pages before publish.
- Every public page has unique title, description, OG image and canonical URL.
- Keyboard focus visible; contrast AA; reduced-motion respected.
- Mobile tested at 390px and 430px; tablet at 768px; desktop 1440px.
- Lighthouse/PageSpeed checked after Framer publish; optimize large images/video.
- Staging domain noindexed before custom-domain launch.

## Domain launch
Target architecture:
- `www.askloom.com` — Framer marketing/public content.
- `app.askloom.com` — authenticated React SaaS.
- API remains separately hosted behind the application.

Before connecting live Trend Index components, set backend `MARKETING_URL` to the exact published Framer origin. Never wildcard all Framer origins.

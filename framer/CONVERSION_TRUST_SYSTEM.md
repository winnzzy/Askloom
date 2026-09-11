# AskLoom Framer Conversion + Trust System

## Goal
Turn the public site from a polished product demo into a credible SaaS business surface that can answer three buyer questions quickly:

1. Why AskLoom instead of established alternatives?
2. Can I trust the methodology and privacy model?
3. Is this useful for my workflow and team?

---

## 1. Comparison Page — AskLoom vs AnswerThePublic

### Positioning
**Headline:** Research is only the first step.

**Subhead:** AnswerThePublic is a mature keyword and consumer-research platform. AskLoom is being built around the next operational layer: deciding what to create, turning research into production-ready content, managing the publishing workflow, and learning from outcomes.

### Important fairness rule
Never claim AnswerThePublic lacks features it currently offers. As of September 2026, its public pricing/features include keyword volume, CPC, search listening, historical comparison, AI prompt suggestions, AI sentiment/responses, Content Studio, AI article generation, scheduling, anti-plagiarism controls, AI editing and WordPress publishing. Its paid tiers list 100/200/300 monthly searches depending on plan, with annual prices publicly shown around $13.33 / $66 / $132.66 per month respectively. Recheck current values before publishing.

### Comparison framing
Use a workflow matrix, not a generic checklist.

| Workflow stage | AskLoom direction | AnswerThePublic |
| --- | --- | --- |
| Discover audience questions | Google + YouTube autocomplete evidence | Mature keyword/question discovery |
| Source provenance | Explicit Google / YouTube / Cross-source labels | Source-dependent research features |
| Opportunity prioritization | Transparent Opportunity Score | Keyword metrics and research prioritization tools |
| First-party trend intelligence | AskLoom Trend Index | Historical comparison/search listening |
| Content creation | AI Studio with versioned assets | Content Studio / AI content creation |
| Project organization | Saved opportunities + projects | Projects / tags / saved research capabilities |
| Production pipeline | Planner: Idea → Planned → In progress → Published | Content scheduling available in Content Studio |
| Post-publication outcomes | Creator-reported views, engagement, conversions | Do not claim absent unless reverified |
| Closed-loop learning | Privacy-thresholded outcome calibration | AskLoom-specific differentiator if maintained |

### Recommended copy block
**AnswerThePublic helps you understand what people are searching for. AskLoom is designed to carry that signal through the rest of the content operating system.**

No “we are better at everything” copy.

---

## 2. FAQ System

Build as native Framer accordion components for SEO/accessibility. Use one reusable FAQ item component with variants: closed / open.

### Core FAQ questions

**What is AskLoom?**
AskLoom is an audience and content intelligence platform that turns search questions into prioritized content opportunities, creation workflows, publishing plans and first-party performance intelligence.

**Where does AskLoom get research ideas from?**
Current research uses Google and YouTube autocomplete signals for selected languages and markets. AskLoom preserves source provenance so a phrase is only labelled Cross-source when it is actually observed from both sources.

**Does AskLoom provide Google search volume?**
Not currently. The Opportunity Score does not claim Google search volume, CPC or competition data unless those metrics are explicitly added from a verified source in the future.

**How does the Opportunity Score work?**
The current score combines query structure, intent, specificity, source evidence and first-party AskLoom momentum. Historical content outcomes can only adjust the score after privacy and sample-size thresholds are crossed, and that adjustment is capped.

**What is the AskLoom Trend Index?**
It is a first-party measure of research activity inside AskLoom. It is not the same thing as total Google, YouTube or internet search demand.

**Does AskLoom sell personal user data?**
The product direction is explicitly designed around aggregated market intelligence rather than selling individual users’ personal histories. Public trend/outcome intelligence should only use sufficiently aggregated, privacy-thresholded data.

**Can I use AskLoom for YouTube?**
Yes. YouTube autocomplete is one of the current research sources, and AI Studio supports YouTube-oriented content packages.

**Can teams use AskLoom?**
The current architecture includes projects and team-related account structures, with a roadmap toward collaborative planning and enterprise intelligence.

**Does AI Studio invent statistics or sources?**
The generation prompt is explicitly instructed not to invent statistics, quotations, sources or factual evidence. Items needing factual verification should be marked for verification.

**Can I publish directly from AskLoom?**
The current Planner tracks publishing state and published URLs. Direct publishing integrations should only be advertised after they are implemented and verified.

---

## 3. Privacy + Security Page

### Hero
**Intelligence should get smarter without becoming invasive.**

### Sections

#### Data minimization
Explain that public intelligence features are designed without exposing individual user identity, IP, cookie or device-level history as a market product.

#### Private workspace data
Saved opportunities, projects, Studio assets and account performance summaries remain account-scoped.

#### Aggregate intelligence
Trend and outcome products use thresholds before broader signals appear. Current outcome benchmarks require multiple creators and multiple published items; outcome calibration uses stricter thresholds.

#### Authentication + sessions
Explain at a high level only:
- short-lived access tokens
- HTTP-only refresh sessions
- rotated/revocable refresh sessions
- hashed reset/verification tokens
- rate limiting

Do not publish implementation secrets or configuration details.

#### Payments
State that AskLoom does not collect card PINs, OTPs or banking authentication secrets. Payments must be handled by the payment provider’s approved flow.

#### AI
Explain that AI Studio outputs are drafts and may require factual verification.

---

## 4. Use-Case Pages

### `/for/youtubers`
Headline: **Find the video before you write the script.**
Flow: YouTube signals → opportunity ranking → AI Studio → planner → performance.
Proof visuals: SourceConvergence + OpportunityShowcase + ClosedLoopWorkflow.

### `/for/content-teams`
Headline: **Turn audience research into a repeatable content operating system.**
Flow: research → projects → saved opportunities → Studio versions → production stages → outcomes.
Emphasize consistency, visibility and handoffs.

### `/for/agencies`
Headline: **Research faster. Explain the strategy. Keep every client pipeline visible.**
Emphasize multiple projects, evidence-backed opportunity reasoning, client-facing methodology, exportable Studio packages, and production tracking.
Do not claim multi-client permissions or white-labeling until built.

### `/for/seo-content`
Headline: **Move from keyword discovery to editorial decisions.**
Position AskLoom as complementary to full SEO suites while being strong at question discovery, source evidence, content prioritization and production workflows.
Do not claim backlink, rank-tracking or technical SEO features.

---

## 5. Social Proof Architecture

Until real customer proof exists, do **not** fabricate logos, testimonials, user counts or revenue claims.

Use these legitimate trust substitutes:
- methodology transparency
- live product screenshots
- real source evidence labels
- privacy thresholds
- visible product changelog
- founder/product principles
- transparent beta labels
- specific workflow examples

When testimonials become available, capture:
- role/company
- exact problem before AskLoom
- measurable change after use
- permission to publish

---

## 6. Navigation

### Desktop primary
Product
- Opportunity Engine
- Trend Index
- AI Studio
- Content Planner

Solutions
- YouTubers
- Content teams
- Agencies
- SEO content

Resources
- Methodology
- AskLoom vs AnswerThePublic
- Privacy & Security
- FAQ
- Changelog (future)

Pricing

Right side:
- Log in
- Start researching → app

### Mobile
Use a full-height Framer overlay menu with three grouped sections and a sticky bottom CTA.

---

## 7. Footer Sitemap

Column 1 — Product
- Opportunity Engine
- Trend Index
- AI Studio
- Planner
- Pricing

Column 2 — Solutions
- YouTubers
- Content teams
- Agencies
- SEO content

Column 3 — Company / Trust
- Methodology
- Privacy & Security
- FAQ
- Compare

Column 4 — Account
- Open app
- Log in
- Create account

Bottom row:
- Privacy
- Terms
- © AskLoom
- Language switcher

---

## 8. Conversion CTAs

Primary CTA language should vary by page but resolve to the app:
- Discover opportunities
- Research a topic
- Open AskLoom
- Start with a real question

Avoid “Book a demo” until there is an actual sales/demo process.
Avoid “Start free” if registration/limits do not support that exact promise.

---

## 9. Framer Implementation Rules

Keep these native Framer:
- page layout
- accordions
- navigation
- footer
- use-case cards
- typography
- testimonials when available
- pricing cards
- CMS resources

Use Code Components for:
- live Trend Index preview
- source convergence visuals
- methodology evidence visualization
- Opportunity showcase
- workflow visualization
- research launcher

This keeps the site editable by designers while retaining live product credibility.

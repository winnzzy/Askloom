# AskLoom — Framer Assembly Runbook

This is the execution checklist for assembling the public AskLoom site in Framer itself.

## 0. Project architecture
- Marketing/public: Framer.
- Authenticated SaaS: existing React app.
- Marketing target: `www.askloom.com`.
- App target: `app.askloom.com`.
- Until custom domains are connected, keep production app links pointed at the current working app origin.

## 1. Create the Framer project foundation
### Breakpoints
Create:
- Desktop: 1440 reference
- Tablet: 768–1199
- Mobile: 390 reference

### Page width
- Outer page width: Fill
- Main content max: 1240
- Narrow editorial max: 860
- Desktop side padding: 32
- Tablet: 24
- Mobile: 18

### Color styles
Create named styles:
- Ink/950 `#0D1224`
- Ink/900 `#11172A`
- Ink/800 `#1C2440`
- Paper `#F7F5EF`
- White `#FFFFFF`
- Violet `#6C45FF`
- Violet/Soft `#8D73FF`
- Gold `#D7A94A`
- Signal/Green `#3FB77B`
- Muted `#737B8C`
- Border `#E3E5EB`

### Text styles
Use Manrope for display and Inter for body/UI.
Create:
- Display/Hero
- Display/H2
- Display/H3
- Body/Lead
- Body/Base
- UI/Label
- UI/Small

## 2. Install Code Components
Recommended: use `/framer/bootstrap-plugin`.
Fallback: Assets → Code → Create Code File and paste files from `/framer/code`.

From `/framer/bootstrap-plugin`:
1. Run `npm ci`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Open the development plugin in Framer and click `Install AskLoom Components`.

Framer's Code Components render on canvas, preview and published site and should stay React 18 compatible.

After install, type-check every Code File in Framer before production use.

## 3. Create shared native Framer components
Build these in canvas, not code:
1. `Button/Primary`
2. `Button/Secondary`
3. `Eyebrow`
4. `SectionHeading`
5. `FeatureCard`
6. `MetricCard`
7. `PricingCard`
8. `FooterColumn`
9. `MobileNav`
10. `ScreenshotShell`

Add variants for default/hover/focus where relevant.

## 4. Assemble homepage
Order:
1. AskLoomHeader
2. Hero
3. Evidence strip
4. Workflow story
5. Opportunity Engine
6. Source Convergence
7. Trend Index
8. AI Studio
9. Planner + outcomes
10. Privacy/methodology
11. Pricing
12. Closing CTA
13. Footer

### Hero
- Two-column desktop; stacked mobile.
- Left: eyebrow, H1, lead, ResearchLauncher, methodology link.
- Right: HeroIntelligenceConsole.
- Do not use fake search volume or invented customer numbers.

### Opportunity Engine
- Use OpportunityShowcase.
- Pair with source-aware methodology copy.

### Source section
- Use SourceConvergence on dark background.
- Cross-source means observed in both Google and YouTube only.

### Trend
- Use TrendIndexPreview.
- Respect empty state if privacy threshold has not been crossed.

### Privacy
- Use PrivacyThresholdCard plus native explanatory copy.

### Closed loop
- Use ClosedLoopWorkflow where it best bridges Planner + Outcomes.

## 5. Build public pages
Create these routes:
- `/`
- `/opportunity-engine`
- `/trends`
- `/ai-studio`
- `/content-planner`
- `/methodology`
- `/pricing`
- `/compare/answerthepublic`
- `/privacy-security`
- `/faq`
- `/solutions/youtubers`
- `/solutions/content-teams`
- `/solutions/agencies`
- `/solutions/seo-content`
- `/resources`
- `/changelog`

Use the page systems and copy already defined under `/framer`.

## 6. Navigation
Desktop top navigation:
- Product
  - Opportunity Engine
  - Trend Index
  - AI Studio
  - Content Planner
- Solutions
  - YouTubers
  - Content teams
  - Agencies
  - SEO content
- Resources
  - Methodology
  - Comparison
  - Privacy & Security
  - FAQ
  - Resources
  - Changelog
- Pricing
- CTA: Open AskLoom

Mobile: use native Framer overlay menu instead of forcing the desktop Code Component navigation.

## 7. CMS
Create collections:
### Resources
Fields:
- Title
- Slug
- Excerpt
- Category
- Author
- Published At
- Updated At
- Cover
- Body
- SEO Title
- SEO Description
- Featured
- Canonical URL

### Changelog
Fields:
- Title
- Slug
- Date
- Summary
- Body
- Tags
- Status (New / Improved / Fixed)

Do not create thin tag archive pages initially.

## 8. Localization
Configure EN, FR, ES.
Priority:
1. Navigation
2. Home
3. Opportunity Engine
4. Pricing
5. Methodology
6. Use cases
7. FAQ

Do not machine-publish unreviewed pricing/legal copy.

## 9. SEO
Set page title + description from `BRAND_LAUNCH_SYSTEM.md`.
Framer automatically provides sitemap/robots support, but verify both after publish.

Add structured data from `SEO_SCHEMA_TEMPLATES.md` using Project Settings → Custom Code, scoped to the relevant page where possible.
- Organization: site-wide or Home.
- SoftwareApplication: Home/Product.
- FAQPage: FAQ only.
- BreadcrumbList: deep pages.

Do not add ratings/reviews without genuine data.

## 10. OG/social images
Create a 1200×630 native Framer master frame.
Create variants for:
- Default
- Opportunity Engine
- Trend Index
- AI Studio
- Planner
- Methodology
- Comparison
- Privacy

Export/publish and set each page's social image.

## 11. API/CORS integration
Before any Framer page fetches AskLoom live data:
1. Publish to a stable Framer staging origin.
2. Set backend `MARKETING_URL` to that exact origin.
3. Verify `/api/trends` works from the published site.
4. Never allow wildcard Framer origins.

## 12. Motion
- 300–650ms
- max entrance translation: 18px
- no infinite gradient loops
- no cursor-follow gimmicks
- reduced-motion must remain usable

Use Framer interactions for hover/focus/reveal. Keep product intelligence calm and legible.

## 13. QA matrix
Test at minimum:
- 1440 desktop
- 1024 laptop/tablet landscape
- 768 tablet
- 430 mobile
- 390 mobile

Validate:
- no horizontal overflow
- nav accessible via keyboard
- visible focus states
- CTA labels accurate
- no dead app links
- Trend empty state acceptable
- comparison claims current
- pricing not published before checkout readiness
- AI Studio claims reflect Gemini production readiness
- contrast AA
- reduced-motion behavior

## 14. Performance
- Use Framer-native image optimization.
- Avoid huge autoplay video in hero.
- Use custom scripts only where needed.
- Keep page-specific custom code scoped to the relevant page.
- Check Site Settings → Versions and confirm the latest published version is Optimized.

## 15. Pre-launch domain cutover
1. Freeze marketing copy.
2. Confirm final app domain.
3. Publish Framer staging build.
4. Run QA matrix.
5. Set `MARKETING_URL` on backend.
6. Connect `www.askloom.com` to Framer.
7. Connect `app.askloom.com` to React app.
8. Verify auth/payment redirect URLs after domain changes.
9. Verify canonical URLs, sitemap, robots, JSON-LD and OG cards.
10. Submit sitemap to search engines after production launch.

## 16. Final rule
Framer owns visual storytelling. React owns authenticated product complexity. Revisit that boundary deliberately, one workflow at a time, rather than rebuilding the application in Framer for aesthetic reasons alone.

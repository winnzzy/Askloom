# AskLoom Framer Bootstrap Plugin

This helper installs/syncs the AskLoom Code Components into a Framer project using Framer's Code File API.

## Setup
1. Run `npm ci` from this folder.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. In Framer, enable Plugin Developer Tools and choose **Open Development Plugin**.
6. Click **Install AskLoom Components**.

This folder is intentionally self-contained so the AskLoom repository can validate the bootstrap plugin without creating a second scaffold elsewhere. It uses the current `@framer/plugin` package, not the deprecated `framer-plugin` package.

The plugin pulls the current component source from:
`https://raw.githubusercontent.com/winnzzy/Askloom/master/framer/code/`

The component inventory lives in `src/componentManifest.ts`. The plugin will update existing files with matching names rather than creating duplicates. If a file already matches the GitHub source exactly, the plugin skips it to avoid unnecessary Framer code-file versions.

The current development defaults are:
- App: `https://askloom-frontend.onrender.com`
- API: `https://askloom-backend.onrender.com/api`

When production custom domains exist, update public component defaults to `https://app.askloom.com` and `https://api.askloom.com`. Do not point production pages to those domains until DNS and hosting are actually configured.

## Installed components
- AskLoomHeader.tsx
- BrandMark.tsx
- ClosedLoopWorkflow.tsx
- ComparisonMatrix.tsx
- HeroIntelligenceConsole.tsx
- MethodologyEvidence.tsx
- OpportunityShowcase.tsx
- PrivacyThresholdCard.tsx
- ResearchLauncher.tsx
- SourceConvergence.tsx
- TrendIndexPreview.tsx

## Safety
Run the plugin only against the intended AskLoom Framer project. Updating a matching Code File creates a new Framer version but replaces that file's current contents.

If a component reports type-check issues, inspect it in Framer Code before placing it on production pages.

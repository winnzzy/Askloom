# AskLoom Framer Bootstrap Plugin

This helper installs/syncs the AskLoom Code Components into a Framer project using Framer's Code File API.

## Setup
1. Run `npm ci` from this folder.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run `npm run dev`.
5. Keep the dev server running. The localhost URL is a Framer development endpoint, not the normal installation interface.
6. In the intended Framer project, use Framer's development plugin workflow to open the local AskLoom Bootstrap plugin. If the dev server or Framer prompts for the opener, use `https://framer.com/plugins/open/`.
7. Verify preflight shows `Framer API available: Yes`, `Running inside Framer: Yes`, and `Mode: canvas`.
8. Click **Install AskLoom Components**.

Opening the localhost URL directly in a browser is useful only to confirm the UI renders. It should not enable installation there because the Framer Plugin API is unavailable outside the Framer editor host.

This folder is intentionally self-contained so the AskLoom repository can validate the bootstrap plugin without creating a second scaffold elsewhere. It uses `@framer/plugin` with the current official scaffold pattern: Vite, `vite-plugin-framer`, `framer.json`, and `framer.showUI(...)`.

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

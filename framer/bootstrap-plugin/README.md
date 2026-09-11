# AskLoom Framer Bootstrap Plugin

This helper installs/syncs the AskLoom Code Components into a Framer project using Framer's Code File API.

## Setup
1. Create a fresh Framer plugin scaffold locally with `npm create framer-plugin@latest`.
2. Replace the generated `src/App.tsx` with this folder's `src/App.tsx`.
3. Replace the generated `framer.json` with this folder's `framer.json`.
4. Ensure the scaffold uses the current `@framer/plugin` package. Framer renamed the package from `framer-plugin` to `@framer/plugin` in v4.
5. Run `npm run dev`.
6. In Framer, enable Plugin Developer Tools and choose **Open Development Plugin**.
7. Click **Install 11 components**.

The plugin pulls the current component source from:
`https://raw.githubusercontent.com/winnzzy/Askloom/master/framer/code/`

It will update existing files with matching names rather than creating duplicates.

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

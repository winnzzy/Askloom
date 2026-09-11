# AskLoom Framer Editor Launch

This is the next manual procedure after the repository work is complete.

## A. Start plugin

```powershell
cd framer/bootstrap-plugin
npm ci
npm run dev
```

Keep the terminal running while the Framer editor is open.

Do not use the localhost URL as a normal browser installer. The local URL is the development endpoint Framer loads into its plugin host. If you open it directly in Chrome, the preflight should report that the Framer API is unavailable.

## B. Framer

Open the intended AskLoom Framer project.

Open Framer's development plugin workflow from inside the Framer editor. The current scaffold points Framer to the local development server via `vite-plugin-framer`; use Framer's **Open Development Plugin** flow, or visit Framer's plugin opener if prompted by the dev server:

```text
https://framer.com/plugins/open/
```

Select/open the local AskLoom Bootstrap development plugin while `npm run dev` is still running.

The plugin must open inside Framer. Preflight should then report:

```text
Framer API available: Yes
Running inside Framer: Yes
Mode: canvas
```

## C. Run bootstrap

Click:

```text
Install AskLoom Components
```

Expected:

```text
11 components processed
0 failed
```

Counts may differ only if the component manifest changes.

## D. Verify

In Framer Assets / Code, verify the installed components.

Run or check Framer's in-editor Code File typechecking.

Confirm no duplicate Code Files were generated. Rerunning the bootstrap should show existing files as updated or unchanged, not duplicate names.

## E. Canvas QA

Create test frames:

```text
Desktop 1440
Laptop 1200
Tablet 768
Mobile 430
Mobile 390
Mobile 320
```

Drop every Code Component onto the QA page and check responsive behavior, text wrapping, overflow, keyboard behavior, and contrast.

## F. Build real marketing pages

Then follow:

```text
FRAMER_ASSEMBLY_RUNBOOK.md
```

## CORS note

Before any published Framer page fetches AskLoom API data, configure the exact Framer staging or production origin in Render:

```text
MARKETING_URL=https://<exact-origin>
```

Do not use `*`, `*.framer.app`, or any broad wildcard origin.

Current development defaults may use:

```text
https://askloom-frontend.onrender.com
https://askloom-backend.onrender.com/api
```

When custom domains exist, production should move to:

```text
https://app.askloom.com
https://api.askloom.com
```

# AskLoom Framer Component QA Matrix

Use this matrix on a dedicated Framer QA page before assembling production marketing pages.

Test frames:

```text
1440
1200
768
430
390
320
```

| Component | 1440 | 1200 | 768 | 430 | 390 | 320 | Canvas rendering | Preview rendering | Property controls | Keyboard/accessibility | Overflow | Text wrapping | Reduced motion | Dark/light contrast | Live API state | Loading state | Error state | Empty state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AskLoomHeader | Check | Check | Check | Check | Check | Check | Check | Check | Links editable | Links keyboard reachable | Check | Check | N/A | Check dark header | N/A | N/A | N/A | N/A |
| BrandMark | Check | Check | Check | Check | Check | Check | Check | Check | Colors/size/radius | Decorative SVG hidden correctly | Check | N/A | N/A | Check | N/A | N/A | N/A | N/A |
| HeroIntelligenceConsole | Check | Check | Check | Check | Check | Check | Check | Check | Topic/labels editable | Section label present | Check | Check | N/A | Check dark UI | N/A | N/A | N/A | N/A |
| ResearchLauncher | Check | Check | Check | Check | Check | Check | Check | Check | URL/copy/colors editable | Form label and submit button | Check | Check | N/A | Check | N/A | N/A | N/A | N/A |
| OpportunityShowcase | Check | Check | Check | Check | Check | Check | Check | Check | Title/subtitle editable | Semantic section/articles | Check | Check | N/A | Check light UI | N/A | N/A | N/A | N/A |
| SourceConvergence | Check | Check | Check | Check | Check | Check | Check | Check | Phrase editable | Semantic section/articles | Check | Check | N/A | Check dark UI | N/A | N/A | N/A | N/A |
| TrendIndexPreview | Check | Check | Check | Check | Check | Check demo-only | Check live fetch | API/language/market/colors | Section label and readable states | Check | Check | N/A | Check dark UI | Check real data only | Check | Check | Check threshold empty state |
| MethodologyEvidence | Check | Check | Check | Check | Check | Check | Check | Check | Labels/values/descriptions | Readable card structure | Check | Check | N/A | Check dark UI | N/A | N/A | N/A | N/A |
| ClosedLoopWorkflow | Check | Check | Check | Check | Check | Check | Check | Check | Copy/accent editable | Readable workflow sequence | Check | Check | N/A | Check dark UI | N/A | N/A | N/A | N/A |
| ComparisonMatrix | Check | Check | Check | Check | Check | Check | Check | Check | Title/subtitle/competitor | Table-like content readable | Check | Check | N/A | Check dark UI | N/A | N/A | N/A | N/A |
| PrivacyThresholdCard | Check | Check | Check | Check | Check | Check | Check | Check | Threshold numbers editable | Privacy thresholds clear | Check | Check | N/A | Check dark UI | N/A | N/A | N/A | N/A |

Pass criteria:

- No horizontal page overflow at any test width.
- Long phrases wrap or truncate intentionally.
- Demo values are visibly labeled as example or illustrative content.
- TrendIndexPreview uses demo data only on canvas and live API data in preview/published mode.
- Failed, loading, and empty TrendIndexPreview states remain readable.
- No component asks for secrets, API keys, customer data, or private credentials.

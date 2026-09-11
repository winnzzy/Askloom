export type ComponentDefinition = {
  name: string
  fileName: string
  source: string
}

const sourceBase = "https://raw.githubusercontent.com/winnzzy/Askloom/master/framer/code/"

export const components: ComponentDefinition[] = [
  "AskLoomHeader",
  "BrandMark",
  "HeroIntelligenceConsole",
  "ResearchLauncher",
  "OpportunityShowcase",
  "SourceConvergence",
  "TrendIndexPreview",
  "MethodologyEvidence",
  "ClosedLoopWorkflow",
  "ComparisonMatrix",
  "PrivacyThresholdCard",
].map((name) => ({
  name,
  fileName: `${name}.tsx`,
  source: `${sourceBase}${name}.tsx`,
}))

export const publicBackendDefault = "https://askloom-backend.onrender.com/api"
export const publicAppDefault = "https://askloom-frontend.onrender.com"

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import "./intelligence.css";
import SearchCloud from "./components/SearchCloud";
import ResultsList from "./components/ResultsList";
import OpportunityPanel from "./components/OpportunityPanel";
import Pricing from "./components/Pricing";
import AuthModal from "./components/AuthModal";
import { fetchCurrentAccount, type GroupedResults } from "./lib/api";
import { useAuth } from "./lib/auth";
import {
  fetchLocalizedSuggestions,
  trackProductEvent,
  type Opportunity,
  type ResearchLanguage,
  type ResearchMarket,
} from "./lib/intelligence";

const copy = {
  en: {
    nav: ["Discover", "Opportunities", "Trends", "AI Studio"],
    eyebrow: "Audience intelligence for creators & teams",
    title: "Know what people want before you create.",
    body: "Discover real questions across Google and YouTube, understand audience intent, find the strongest content angles and turn them into ideas worth publishing.",
    placeholder: "Search any topic, product, industry or question",
    search: "Discover opportunities",
    searching: "Discovering...",
    proof: ["Google + YouTube signals", "Audience intent clusters", "AI-ready content angles"],
    workflow: "From question to opportunity",
    workflowBody: "AskLoom is designed to move beyond keyword lists. Explore demand, understand the audience behind it, prioritize what matters and create from the evidence.",
  },
  fr: {
    nav: ["Découvrir", "Opportunités", "Tendances", "Studio IA"],
    eyebrow: "Intelligence d’audience pour créateurs et équipes",
    title: "Sachez ce que les gens veulent avant de créer.",
    body: "Découvrez les vraies questions sur Google et YouTube, comprenez l’intention du public et transformez les meilleurs angles en contenu.",
    placeholder: "Recherchez un sujet, produit, secteur ou une question",
    search: "Découvrir les opportunités",
    searching: "Recherche...",
    proof: ["Signaux Google + YouTube", "Intentions regroupées", "Angles prêts pour l’IA"],
    workflow: "De la question à l’opportunité",
    workflowBody: "AskLoom va au-delà des listes de mots-clés : découvrez la demande, comprenez votre audience, priorisez et créez à partir des données.",
  },
  es: {
    nav: ["Descubrir", "Oportunidades", "Tendencias", "Estudio IA"],
    eyebrow: "Inteligencia de audiencia para creadores y equipos",
    title: "Descubre lo que la gente quiere antes de crear.",
    body: "Encuentra preguntas reales en Google y YouTube, entiende la intención de tu audiencia y convierte las mejores oportunidades en contenido.",
    placeholder: "Busca un tema, producto, industria o pregunta",
    search: "Descubrir oportunidades",
    searching: "Buscando...",
    proof: ["Señales de Google + YouTube", "Grupos de intención", "Ángulos listos para IA"],
    workflow: "De pregunta a oportunidad",
    workflowBody: "AskLoom va más allá de las listas de palabras clave: descubre demanda, entiende a tu audiencia, prioriza y crea con evidencia.",
  },
} as const;

type Language = keyof typeof copy;

const opportunityExamples = [
  { score: 94, label: "AI agents for small businesses", meta: "High demand · YouTube fit", trend: "+38%" },
  { score: 89, label: "Will AI agents replace assistants?", meta: "Question · Informational intent", trend: "+27%" },
  { score: 84, label: "AI customer service agents", meta: "Commercial intent · Rising", trend: "+19%" },
];

const markets: Array<{ code: ResearchMarket; label: string }> = [
  { code: "NG", label: "Nigeria" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "MX", label: "Mexico" },
];

export default function App() {
  const { user, token, login, logout } = useAuth();
  const [seed, setSeed] = useState(() => new URLSearchParams(window.location.search).get("topic") ?? "");
  const [submittedSeed, setSubmittedSeed] = useState("");
  const [grouped, setGrouped] = useState<GroupedResults | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"cloud" | "list">("cloud");
  const [authOpen, setAuthOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("askloom-language");
    return saved === "fr" || saved === "es" ? saved : "en";
  });
  const [market, setMarket] = useState<ResearchMarket>(() => {
    const saved = localStorage.getItem("askloom-market") as ResearchMarket | null;
    return markets.some((item) => item.code === saved) ? saved! : "NG";
  });
  const starterTopics = ["faceless youtube", "ai content ideas", "personal finance", "small business marketing"];
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("askloom-language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("askloom-market", market);
  }, [market]);

  useEffect(() => {
    trackProductEvent("page_view", language as ResearchLanguage, market);
    // Intentionally count aggregate page usage only once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchCurrentAccount(token)
      .then((account) => login(token, account.user))
      .catch(() => logout());
  }, [login, logout, token]);

  const resultCount = useMemo(() => {
    if (!grouped) return 0;
    return Object.values(grouped).reduce((sum, items) => sum + Object.values(items).reduce((inner, phrases) => inner + phrases.length, 0), 0);
  }, [grouped]);

  function changeLanguage(next: Language) {
    setLanguage(next);
    trackProductEvent("language_changed", next as ResearchLanguage, market);
  }

  function changeMarket(next: ResearchMarket) {
    setMarket(next);
    trackProductEvent("market_changed", language as ResearchLanguage, next);
  }

  function changeView(next: "cloud" | "list") {
    setView(next);
    trackProductEvent("results_view_changed", language as ResearchLanguage, market, next);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!seed.trim()) return;
    setLoading(true);
    setError(null);
    trackProductEvent("research_started", language as ResearchLanguage, market);
    try {
      const data = await fetchLocalizedSuggestions(seed.trim(), language as ResearchLanguage, market, token);
      setGrouped(data.grouped);
      setOpportunities(data.opportunities || []);
      setSubmittedSeed(seed.trim());
      setView("cloud");
      trackProductEvent("research_completed", language as ResearchLanguage, market);
      requestAnimationFrame(() => document.getElementById("research-results")?.scrollIntoView({ behavior: "smooth" }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="site-header intelligence-header">
        <a className="wordmark" href="/">Ask<span>Loom</span></a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#discover">{t.nav[0]}</a>
          <a href="#opportunities">{t.nav[1]}</a>
          <Link to="/trends">{t.nav[2]}</Link>
          <a href="#workflow">{t.nav[3]}</a>
        </nav>
        <div className="account-area">
          <label className="language-picker" aria-label="Interface language">
            <span>🌐</span>
            <select value={language} onChange={(e) => changeLanguage(e.target.value as Language)}>
              <option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option>
            </select>
          </label>
          {user ? (
            <><span className="desktop-account">{user.email}</span><span className="plan-pill">{user.currentPlan?.name ?? "Free"}</span><Link className="header-link" to="/account">Dashboard</Link>{user.role === "ADMIN" && <Link className="header-link" to="/admin">Admin</Link>}<button type="button" onClick={logout}>Log out</button></>
          ) : <button className="header-cta" type="button" onClick={() => setAuthOpen(true)}>Log in</button>}
        </div>
      </header>

      <main>
        <section className="hero intelligence-hero" id="discover">
          <div className="hero-copy">
            <div className="eyebrow">{t.eyebrow}</div>
            <h1>{t.title}</h1>
            <p>{t.body}</p>
            <form className="search-form intelligence-search" onSubmit={handleSearch}>
              <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder={t.placeholder} aria-label="Research topic" />
              <button type="submit" disabled={loading}>{loading ? t.searching : t.search}</button>
            </form>
            <div className="research-dimensions" aria-label="Research targeting">
              <label className="dimension-control"><span>Research language</span><select value={language} onChange={(e) => changeLanguage(e.target.value as Language)}><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option></select></label>
              <label className="dimension-control"><span>Target market</span><select value={market} onChange={(e) => changeMarket(e.target.value as ResearchMarket)}>{markets.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
            </div>
            <p className="research-note"><span className="privacy-badge">Trend signals are aggregated without user, IP, cookie or device identifiers.</span></p>
            <div className="topic-chips" aria-label="Starter topics">
              {starterTopics.map((topic) => <button key={topic} type="button" onClick={() => setSeed(topic)}>{topic}</button>)}
            </div>
            <div className="hero-stats" aria-label="Product highlights">{t.proof.map((item) => <span key={item}>{item}</span>)}</div>
            {error && <p className="hero-error">{error}</p>}
          </div>

          <div className="hero-visual intelligence-preview">
            {grouped ? <SearchCloud seed={submittedSeed} grouped={grouped} /> : (
              <div className="insight-console" aria-label="Example AskLoom intelligence">
                <div className="console-top"><span>LIVE OPPORTUNITY MAP</span><span className="live-dot">Research preview</span></div>
                <div className="console-topic"><small>Topic</small><strong>AI agents</strong><span>Audience demand is accelerating</span></div>
                <div className="console-metrics"><div><strong>2,481</strong><span>signals</span></div><div><strong>387</strong><span>questions</span></div><div><strong>42</strong><span>clusters</span></div></div>
                <div className="console-list">{opportunityExamples.map((item) => <div className="console-row" key={item.label}><span className="score-ring">{item.score}</span><div><strong>{item.label}</strong><small>{item.meta}</small></div><b>{item.trend}</b></div>)}</div>
              </div>
            )}
          </div>
        </section>

        <section className="value-strip" aria-label="AskLoom workflow">
          {["Discover demand", "Understand intent", "Score opportunities", "Create content", "Track momentum"].map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}
        </section>

        <section className="product-story" id="opportunities">
          <div className="section-heading"><div className="eyebrow dark-eyebrow">CONTENT INTELLIGENCE, NOT ANOTHER KEYWORD LIST</div><h2>{t.workflow}</h2><p>{t.workflowBody}</p></div>
          <div className="feature-grid">
            <article><span className="feature-icon">⌁</span><h3>Discover</h3><p>Explore the questions and comparisons audiences are already searching across Google and YouTube.</p></article>
            <article><span className="feature-icon">◎</span><h3>Understand</h3><p>Turn hundreds of phrases into clear audience themes and intent clusters you can actually use.</p></article>
            <article className="featured-feature"><span className="feature-icon">↗</span><h3>Prioritize</h3><p>Use the beta AskLoom Opportunity Score to surface the ideas most worth investigating first.</p></article>
            <article><span className="feature-icon">✦</span><h3>Create</h3><p>Turn a discovered question into a hook and, as AI Studio expands, a complete content workflow.</p></article>
          </div>
        </section>

        <section className="trend-section" id="trends">
          <div><div className="eyebrow">THE DATA MOAT STARTS WITH USEFUL RESEARCH</div><h2>See what is gaining momentum.</h2><p>AskLoom is being designed to learn from privacy-conscious, aggregated product signals over time—building trend intelligence without turning individual user histories into a product.</p><Link className="secondary-action trend-live-link" to="/trends">Open live Trend Index</Link></div>
          <div className="trend-card"><div className="trend-card-head"><span>AskLoom Trend Index · Concept</span><b>90 days</b></div><strong className="trend-name">AI voice agents</strong><div className="trend-number">+141%</div><div className="trend-bars" aria-hidden="true">{[22,28,31,38,42,49,58,66,73,82,91,100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><small>Example visualization · historical trend product in development</small></div>
        </section>

        {grouped && (
          <section className="results" id="research-results">
            <div className="results-toolbar"><div><span className="result-kicker">RESEARCH WORKSPACE · {resultCount} SIGNALS · {language.toUpperCase()} · {market}</span><h2>Results for “{submittedSeed}”</h2></div><div className="view-toggle"><button className={view === "cloud" ? "active" : ""} onClick={() => changeView("cloud")}>Visual map</button><button className={view === "list" ? "active" : ""} onClick={() => changeView("list")}>Action list</button></div></div>
            <OpportunityPanel opportunities={opportunities} seed={submittedSeed} language={language as ResearchLanguage} market={market} token={token} onAuthRequired={() => setAuthOpen(true)} />
            {view === "cloud" ? <div className="cloud-result-panel"><SearchCloud seed={submittedSeed} grouped={grouped} /></div> : <ResultsList grouped={grouped} token={token} />}
          </section>
        )}

        <section className="workflow-cta" id="workflow"><span>Research → opportunity → creation</span><h2>Stop guessing what to create next.</h2><p>Start with a real audience question. AskLoom helps you find the angles hiding inside demand.</p><button onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}>Start researching</button></section>
        <Pricing onAuthRequired={() => setAuthOpen(true)} />
      </main>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}

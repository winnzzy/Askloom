import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../trends.css";
import { fetchTrends, type TrendItem } from "../lib/trends";
import type { ResearchLanguage, ResearchMarket } from "../lib/intelligence";

const markets: Array<{ code: ResearchMarket; label: string }> = [
  { code: "NG", label: "Nigeria" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "MX", label: "Mexico" },
];

const languages: Array<{ code: ResearchLanguage; label: string }> = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

function growthLabel(item: TrendItem) {
  if (item.growthPercent === null) return "New signal";
  if (item.growthPercent > 0) return `+${item.growthPercent}%`;
  return `${item.growthPercent}%`;
}

export default function Trends() {
  const [language, setLanguage] = useState<ResearchLanguage>(() => {
    const value = localStorage.getItem("askloom-language");
    return value === "fr" || value === "es" ? value : "en";
  });
  const [market, setMarket] = useState<ResearchMarket>(() => {
    const value = localStorage.getItem("askloom-market") as ResearchMarket | null;
    return markets.some((item) => item.code === value) ? value! : "NG";
  });
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [threshold, setThreshold] = useState(5);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchTrends(language, market)
      .then((data) => {
        if (!active) return;
        setTrends(data.trends);
        setThreshold(data.privacyThreshold);
        setNote(data.note);
      })
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [language, market]);

  return (
    <main className="trends-page">
      <header className="trends-header">
        <Link className="wordmark" to="/">Ask<span>Loom</span></Link>
        <nav>
          <Link to="/">Discover</Link>
          <Link className="active" to="/trends">Trends</Link>
          <Link to="/account">Workspace</Link>
        </nav>
      </header>

      <section className="trends-hero">
        <div>
          <div className="eyebrow">ASKLOOM FIRST-PARTY INTELLIGENCE</div>
          <h1>What is gaining momentum inside AskLoom?</h1>
          <p>
            A privacy-thresholded view of aggregated research activity. This is not a claim about total Google or YouTube search volume—it measures what AskLoom users are researching over time.
          </p>
        </div>
        <div className="trends-filter-card">
          <label><span>Language</span><select value={language} onChange={(e) => setLanguage(e.target.value as ResearchLanguage)}>{languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
          <label><span>Market</span><select value={market} onChange={(e) => setMarket(e.target.value as ResearchMarket)}>{markets.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
          <small>Topics appear only after at least {threshold} aggregate searches in the analysis window.</small>
        </div>
      </section>

      <section className="trends-content">
        <div className="trends-section-heading">
          <div><span className="result-kicker">14-DAY WINDOW</span><h2>Trend Index</h2></div>
          <p>{note || "Aggregated AskLoom research activity."}</p>
        </div>

        {loading && <div className="trend-empty"><strong>Loading trend intelligence…</strong></div>}
        {error && <div className="trend-empty danger"><strong>{error}</strong></div>}
        {!loading && !error && trends.length === 0 && (
          <div className="trend-empty">
            <strong>Trend history is still building for this market.</strong>
            <p>As more qualifying research accumulates, topics will appear here automatically. AskLoom intentionally hides sparse data rather than exposing tiny samples.</p>
            <Link to="/">Explore research</Link>
          </div>
        )}

        {!loading && trends.length > 0 && (
          <div className="trend-table">
            {trends.map((item, index) => (
              <article className="trend-row" key={item.topic}>
                <span className="trend-rank">#{index + 1}</span>
                <div className="trend-index"><strong>{item.trendIndex}</strong><span>INDEX</span></div>
                <div className="trend-topic"><strong>{item.topic}</strong><span>{item.direction} · {item.recentSearches} recent AskLoom searches</span></div>
                <div className={`trend-growth ${item.direction}`}><strong>{growthLabel(item)}</strong><span>vs prior 7 days</span></div>
                <Link className="secondary-action" to={`/?topic=${encodeURIComponent(item.topic)}`}>Research</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

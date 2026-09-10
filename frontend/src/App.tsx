import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import SearchCloud from "./components/SearchCloud";
import ResultsList from "./components/ResultsList";
import Pricing from "./components/Pricing";
import AuthModal from "./components/AuthModal";
import { fetchCurrentAccount, fetchSuggestions, type GroupedResults } from "./lib/api";
import { useAuth } from "./lib/auth";

export default function App() {
  const { user, token, login, logout } = useAuth();
  const [seed, setSeed] = useState("");
  const [submittedSeed, setSubmittedSeed] = useState("");
  const [grouped, setGrouped] = useState<GroupedResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"cloud" | "list">("cloud");
  const [authOpen, setAuthOpen] = useState(false);
  const starterTopics = ["faceless youtube", "ai content ideas", "meal prep", "personal finance"];

  useEffect(() => {
    if (!token) return;

    fetchCurrentAccount(token)
      .then((account) => login(token, account.user))
      .catch(() => logout());
  }, [login, logout, token]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!seed.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuggestions(seed.trim(), token);
      setGrouped(data.grouped);
      setSubmittedSeed(seed.trim());
      setView("cloud");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="site-header">
        <a className="wordmark" href="/">
          Ask<span>Loom</span>
        </a>
        <div className="account-area">
          {user ? (
            <>
              <span>{user.email}</span>
              <span className="plan-pill">{user.currentPlan?.name ?? "Free"}</span>
              <Link className="header-link" to="/account">
                Account
              </Link>
              {user.role === "ADMIN" && (
                <Link className="header-link" to="/admin">
                  Admin
                </Link>
              )}
              <button type="button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)}>
              Log in
            </button>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Audience research, untangled</div>
          <h1>See every question your audience is already typing.</h1>
          <p>
            Enter a topic. AskLoom pulls what people are asking on Google and
            YouTube, sorts it into angles, then turns any line into a video hook.
          </p>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. yoruba mythology"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="topic-chips" aria-label="Starter topics">
            {starterTopics.map((topic) => (
              <button key={topic} type="button" onClick={() => setSeed(topic)}>
                {topic}
              </button>
            ))}
          </div>

          <div className="hero-stats" aria-label="Product highlights">
            <span>Google + YouTube</span>
            <span>Question clusters</span>
            <span>Script hooks</span>
          </div>
          {error && <p className="hero-error">{error}</p>}
        </div>

        <div className="hero-visual">
          {grouped ? (
            <SearchCloud seed={submittedSeed} grouped={grouped} />
          ) : (
            <div className="loom-preview" aria-hidden="true">
              <div className="preview-core">AskLoom</div>
              {["who", "how", "vs", "for", "best", "near"].map((label, index) => (
                <span className={`preview-node node-${index + 1}`} key={label}>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {grouped && (
        <section className="results">
          <div className="results-toolbar">
            <h2>Results for "{submittedSeed}"</h2>
            <div className="view-toggle">
              <button
                className={view === "cloud" ? "active" : ""}
                onClick={() => setView("cloud")}
              >
                Cloud
              </button>
              <button
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
              >
                List
              </button>
            </div>
          </div>
          {view === "cloud" ? (
            <div className="cloud-result-panel">
              <SearchCloud seed={submittedSeed} grouped={grouped} />
            </div>
          ) : (
            <ResultsList grouped={grouped} token={token} />
          )}
        </section>
      )}

      <Pricing onAuthRequired={() => setAuthOpen(true)} />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}

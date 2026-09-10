import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { fetchStudioAssets, type StudioAsset } from "../lib/aiStudio";
import "./studioLibrary.css";

export default function StudioLibrary() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("all");
  const [project, setProject] = useState("all");

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }
    setLoading(true);
    fetchStudioAssets(token)
      .then(setAssets)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, token, user]);

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    assets.forEach((asset) => {
      if (asset.project) map.set(asset.project.id, asset.project.name);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [assets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (format !== "all" && asset.format !== format) return false;
      if (project !== "all" && asset.project?.id !== project) return false;
      if (!q) return true;
      return [asset.topic, asset.opportunity?.phrase, asset.project?.name, asset.format, asset.tone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [assets, format, project, query]);

  const groups = useMemo(() => {
    const map = new Map<string, StudioAsset[]>();
    filtered.forEach((asset) => {
      const key = asset.opportunity?.id || `topic:${asset.topic.toLowerCase()}`;
      const current = map.get(key) || [];
      current.push(asset);
      map.set(key, current);
    });
    return Array.from(map.values())
      .map((versions) => versions.sort((a, b) => b.version - a.version))
      .sort((a, b) => new Date(b[0].createdAt).getTime() - new Date(a[0].createdAt).getTime());
  }, [filtered]);

  return (
    <main className="library-page">
      <header className="library-header">
        <Link className="wordmark" to="/">Ask<span>Loom</span></Link>
        <nav>
          <Link to="/">Discover</Link>
          <Link to="/trends">Trends</Link>
          <Link to="/ai-studio">AI Studio</Link>
          <Link className="active" to="/studio-library">Studio Library</Link>
          <Link to="/account">Workspace</Link>
        </nav>
      </header>

      <section className="library-hero">
        <div>
          <span className="eyebrow">VERSIONED CONTENT ASSETS</span>
          <h1>Studio Library</h1>
          <p>Every AI Studio generation stays attached to your workflow so you can revisit ideas, compare versions, and continue production without losing earlier drafts.</p>
        </div>
        <div className="library-summary">
          <strong>{assets.length}</strong><span>saved versions</span>
          <strong>{groups.length}</strong><span>content threads</span>
        </div>
      </section>

      <section className="library-shell">
        <div className="library-filters">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topic, project or tone" />
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="all">All formats</option>
            <option value="youtube">YouTube</option>
            <option value="shorts">Short-form</option>
            <option value="article">Article</option>
          </select>
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="all">All projects</option>
            {projects.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>

        {loading && <div className="library-empty">Loading Studio assets…</div>}
        {error && <div className="library-empty danger">{error}</div>}
        {!loading && !error && groups.length === 0 && (
          <div className="library-empty">
            <strong>No Studio assets yet.</strong>
            <p>Open a ranked opportunity in AI Studio and generate a content package. Its versions will appear here.</p>
            <Link className="library-primary" to="/">Discover opportunities</Link>
          </div>
        )}

        <div className="library-grid">
          {groups.map((versions) => {
            const latest = versions[0];
            return (
              <article className="library-card" key={latest.id}>
                <div className="library-card-top">
                  <div>
                    <span className="library-kicker">{latest.format.toUpperCase()} · {latest.tone}</span>
                    <h2>{latest.topic}</h2>
                  </div>
                  <span className="library-version">v{latest.version}</span>
                </div>
                <div className="library-meta">
                  <span>{latest.project?.name || "No project"}</span>
                  <span>{latest.opportunity ? "Attached opportunity" : "Standalone Studio asset"}</span>
                  <span>{new Date(latest.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="library-brief">{latest.content.contentBrief}</p>
                <div className="library-version-row">
                  {versions.slice(0, 5).map((asset) => (
                    <Link key={asset.id} to={`/ai-studio?assetId=${encodeURIComponent(asset.id)}${asset.opportunity?.id ? `&opportunityId=${encodeURIComponent(asset.opportunity.id)}` : ""}`}>
                      v{asset.version}
                    </Link>
                  ))}
                  {versions.length > 5 && <span>+{versions.length - 5} more</span>}
                </div>
                <Link className="library-primary" to={`/ai-studio?assetId=${encodeURIComponent(latest.id)}${latest.opportunity?.id ? `&opportunityId=${encodeURIComponent(latest.opportunity.id)}` : ""}`}>Open latest version</Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

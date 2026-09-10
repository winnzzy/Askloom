import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  fetchStudioAssets,
  generateStudioPackage,
  regenerateStudioSection,
  type StudioAsset,
  type StudioFormat,
  type StudioPackage,
  type StudioSection,
  type StudioTone,
} from "../lib/aiStudio";
import "./aiStudio.css";

export default function AIStudio() {
  const { user, token } = useAuth();
  const [params] = useSearchParams();
  const opportunityId = params.get("opportunityId");
  const assetId = params.get("assetId");
  const [topic, setTopic] = useState(params.get("topic") || "");
  const [format, setFormat] = useState<StudioFormat>("youtube");
  const [tone, setTone] = useState<StudioTone>("educational");
  const [audience, setAudience] = useState("content creators and curious viewers");
  const [result, setResult] = useState<StudioPackage | null>(null);
  const [currentAsset, setCurrentAsset] = useState<StudioAsset | null>(null);
  const [versions, setVersions] = useState<StudioAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<StudioSection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  function applyAsset(asset: StudioAsset) {
    setCurrentAsset(asset);
    setResult(asset.content);
    setTopic(asset.topic);
    setFormat(asset.format);
    setTone(asset.tone);
    setAudience(asset.audience);
  }

  function toMarkdown(content: StudioPackage) {
    const outline = content.outline.map((item) => `## ${item.section}\n${item.points.map((point) => `- ${point}`).join("\n")}`).join("\n\n");
    const shorts = content.shorts.map((item, index) => `### Short ${index + 1}: ${item.title}\n**Hook:** ${item.hook}\n\n${item.body}\n\n**CTA:** ${item.cta}`).join("\n\n");
    return `# ${topic}\n\n**Format:** ${format}\n**Audience:** ${audience}\n**Tone:** ${tone}\n${currentAsset ? `**Version:** ${currentAsset.version}\n` : ""}\n## Title Options\n${content.titles.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n## Opening Hooks\n${content.hooks.map((item) => `- ${item}`).join("\n")}\n\n## Content Brief\n${content.contentBrief}\n\n## Outline\n${outline}\n\n## Draft Script\n${content.script}\n\n## Short-form Variations\n${shorts}\n\n## Description\n${content.description}\n\n## Next Steps\n${content.nextSteps.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n`;
  }

  async function copyPackage() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(result));
      setExportNotice("Content package copied.");
    } catch {
      setExportNotice("Copy failed. Use Download Markdown instead.");
    }
  }

  function downloadMarkdown() {
    if (!result) return;
    const blob = new Blob([toMarkdown(result)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "askloom-content";
    link.href = url;
    link.download = `${safeTopic}${currentAsset ? `-v${currentAsset.version}` : ""}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setExportNotice("Markdown exported.");
  }

  function downloadJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ topic, format, audience, tone, version: currentAsset?.version ?? null, content: result }, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `askloom-studio${currentAsset ? `-v${currentAsset.version}` : ""}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportNotice("JSON exported.");
  }

  async function reloadVersions(selectPreferred = false) {
    if (!token) return;
    try {
      const assets = await fetchStudioAssets(token, opportunityId);
      setVersions(assets);
      if (selectPreferred) {
        const preferred = (assetId ? assets.find((asset) => asset.id === assetId) : undefined) || assets[0];
        if (preferred) applyAsset(preferred);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Studio history");
    }
  }

  useEffect(() => {
    if (!user || !token) return;
    reloadVersions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token, opportunityId, assetId]);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await generateStudioPackage(token, { topic: topic.trim(), format, audience, tone, opportunityId });
      applyAsset(response.asset);
      await reloadVersions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function regenerate(section: StudioSection) {
    if (!currentAsset) return;
    setRegenerating(section);
    setError(null);
    try {
      const response = await regenerateStudioSection(token, currentAsset.id, section);
      applyAsset(response.asset);
      await reloadVersions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Section regeneration failed");
    } finally {
      setRegenerating(null);
    }
  }

  function viewVersion(asset: StudioAsset) {
    applyAsset(asset);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const regenerateButton = (section: StudioSection) => currentAsset ? (
    <button className="studio-regenerate" disabled={Boolean(regenerating)} onClick={() => regenerate(section)}>
      {regenerating === section ? "Regenerating…" : "Regenerate"}
    </button>
  ) : null;

  return <main className="studio-page">
    <header className="studio-header"><Link className="wordmark" to="/">Ask<span>Loom</span></Link><nav><Link to="/">Discover</Link><Link to="/trends">Trends</Link><Link className="active" to="/ai-studio">AI Studio</Link><Link to="/studio-library">Studio Library</Link><Link to="/account">Workspace</Link></nav></header>
    <section className="studio-hero"><div><span className="eyebrow">FROM AUDIENCE SIGNAL TO CONTENT</span><h1>AI Studio</h1><p>Turn a validated opportunity into a production-ready content package. Every generation is saved as a version so you can improve sections without losing earlier work.</p></div><div className="studio-status"><span>{user ? `Signed in as ${user.email}` : "Sign in required"}</span><strong>{currentAsset ? `Version ${currentAsset.version}` : user?.currentPlan?.name || "Free"}</strong>{currentAsset?.project && <small>{currentAsset.project.name}</small>}</div></section>
    <section className="studio-grid">
      <aside className="studio-controls">
        <label><span>Opportunity / topic</span><textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Paste a ranked opportunity or audience question" /></label>
        <label><span>Primary format</span><select value={format} onChange={e=>setFormat(e.target.value as StudioFormat)}><option value="youtube">YouTube video</option><option value="shorts">Short-form video</option><option value="article">Article / blog</option></select></label>
        <label><span>Audience</span><input value={audience} onChange={e=>setAudience(e.target.value)} /></label>
        <label><span>Tone</span><select value={tone} onChange={e=>setTone(e.target.value as StudioTone)}><option value="educational">Educational</option><option value="conversational">Conversational</option><option value="authoritative">Authoritative</option><option value="storytelling">Storytelling</option></select></label>
        <button className="studio-generate" disabled={loading || !topic.trim() || !user} onClick={generate}>{loading ? "Building package…" : currentAsset ? "Generate new version" : "Generate content package"}</button>
        <Link className="studio-library-link" to="/studio-library">Browse all Studio assets</Link>
        {result && <div className="studio-export"><span>PRODUCTION HANDOFF</span><button type="button" onClick={copyPackage}>Copy package</button><button type="button" onClick={downloadMarkdown}>Download Markdown</button><button type="button" onClick={downloadJson}>Download JSON</button></div>}
        {exportNotice && <p className="studio-export-notice">{exportNotice}</p>}
        {!user && <p className="studio-hint">Log in from the homepage to generate. AI Studio uses your plan's AI generation allowance.</p>}
        {opportunityId && <p className="studio-hint">This Studio is attached to a saved opportunity. New versions inherit its current project.</p>}
        {error && <p className="studio-error">{error}</p>}
        {versions.length > 0 && <div className="studio-history"><div className="studio-history-title"><span>VERSION HISTORY</span><b>{versions.length}</b></div>{versions.map(asset=><button key={asset.id} className={currentAsset?.id===asset.id?"active":""} onClick={()=>viewVersion(asset)}><strong>v{asset.version}</strong><span>{new Date(asset.createdAt).toLocaleString()}</span></button>)}</div>}
      </aside>
      <div className="studio-output">
        {!result ? <div className="studio-empty"><span>✦</span><h2>Your content package will appear here.</h2><p>Start with an opportunity discovered in AskLoom, then choose the audience, format and tone.</p></div> : <>
          <section><div className="studio-section-head"><span className="studio-kicker">TITLE OPTIONS</span>{regenerateButton("titles")}</div>{result.titles.map((x,i)=><h3 key={i}>{i+1}. {x}</h3>)}</section>
          <section><div className="studio-section-head"><span className="studio-kicker">OPENING HOOKS</span>{regenerateButton("hooks")}</div>{result.hooks.map((x,i)=><blockquote key={i}>{x}</blockquote>)}</section>
          <section><div className="studio-section-head"><span className="studio-kicker">CONTENT BRIEF</span>{regenerateButton("contentBrief")}</div><p>{result.contentBrief}</p></section>
          <section><div className="studio-section-head"><span className="studio-kicker">STRUCTURE</span>{regenerateButton("outline")}</div>{result.outline.map((x,i)=><div className="outline-row" key={i}><strong>{x.section}</strong><ul>{x.points.map((p,j)=><li key={j}>{p}</li>)}</ul></div>)}</section>
          <section><div className="studio-section-head"><span className="studio-kicker">DRAFT SCRIPT</span>{regenerateButton("script")}</div><pre className="studio-script">{result.script}</pre></section>
          <section><div className="studio-section-head"><span className="studio-kicker">SHORT-FORM VARIATIONS</span>{regenerateButton("shorts")}</div><div className="short-grid">{result.shorts.map((x,i)=><article key={i}><strong>{x.title}</strong><b>{x.hook}</b><p>{x.body}</p><small>{x.cta}</small></article>)}</div></section>
          <section><div className="studio-section-head"><span className="studio-kicker">DESCRIPTION</span>{regenerateButton("description")}</div><p>{result.description}</p></section>
          <section><div className="studio-section-head"><span className="studio-kicker">NEXT STEPS</span>{regenerateButton("nextSteps")}</div><ol>{result.nextSteps.map((x,i)=><li key={i}>{x}</li>)}</ol></section>
        </>}
      </div>
    </section>
  </main>;
}

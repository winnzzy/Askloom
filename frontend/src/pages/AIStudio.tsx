import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { generateStudioPackage, type StudioFormat, type StudioPackage, type StudioTone } from "../lib/aiStudio";
import "./aiStudio.css";

export default function AIStudio() {
  const { user, token } = useAuth();
  const [params] = useSearchParams();
  const [topic, setTopic] = useState(params.get("topic") || "");
  const [format, setFormat] = useState<StudioFormat>("youtube");
  const [tone, setTone] = useState<StudioTone>("educational");
  const [audience, setAudience] = useState("content creators and curious viewers");
  const [result, setResult] = useState<StudioPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setError(null);
    try { setResult(await generateStudioPackage(token, { topic: topic.trim(), format, audience, tone })); }
    catch (err) { setError(err instanceof Error ? err.message : "Generation failed"); }
    finally { setLoading(false); }
  }

  return <main className="studio-page">
    <header className="studio-header"><Link className="wordmark" to="/">Ask<span>Loom</span></Link><nav><Link to="/">Discover</Link><Link to="/trends">Trends</Link><Link className="active" to="/ai-studio">AI Studio</Link><Link to="/account">Workspace</Link></nav></header>
    <section className="studio-hero"><div><span className="eyebrow">FROM AUDIENCE SIGNAL TO CONTENT</span><h1>AI Studio</h1><p>Turn a validated opportunity into a production-ready content package. AskLoom keeps unsupported facts out of the draft and marks claims that need research.</p></div><div className="studio-status"><span>{user ? `Signed in as ${user.email}` : "Sign in required"}</span><strong>{user?.currentPlan?.name || "Free"}</strong></div></section>
    <section className="studio-grid">
      <aside className="studio-controls">
        <label><span>Opportunity / topic</span><textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Paste a ranked opportunity or audience question" /></label>
        <label><span>Primary format</span><select value={format} onChange={e=>setFormat(e.target.value as StudioFormat)}><option value="youtube">YouTube video</option><option value="shorts">Short-form video</option><option value="article">Article / blog</option></select></label>
        <label><span>Audience</span><input value={audience} onChange={e=>setAudience(e.target.value)} /></label>
        <label><span>Tone</span><select value={tone} onChange={e=>setTone(e.target.value as StudioTone)}><option value="educational">Educational</option><option value="conversational">Conversational</option><option value="authoritative">Authoritative</option><option value="storytelling">Storytelling</option></select></label>
        <button className="studio-generate" disabled={loading || !topic.trim() || !user} onClick={generate}>{loading ? "Building package…" : "Generate content package"}</button>
        {!user && <p className="studio-hint">Log in from the homepage to generate. AI Studio uses your plan's AI generation allowance.</p>}
        {error && <p className="studio-error">{error}</p>}
      </aside>
      <div className="studio-output">
        {!result ? <div className="studio-empty"><span>✦</span><h2>Your content package will appear here.</h2><p>Start with an opportunity discovered in AskLoom, then choose the audience, format and tone.</p></div> : <>
          <section><span className="studio-kicker">TITLE OPTIONS</span>{result.titles.map((x,i)=><h3 key={i}>{i+1}. {x}</h3>)}</section>
          <section><span className="studio-kicker">OPENING HOOKS</span>{result.hooks.map((x,i)=><blockquote key={i}>{x}</blockquote>)}</section>
          <section><span className="studio-kicker">CONTENT BRIEF</span><p>{result.contentBrief}</p></section>
          <section><span className="studio-kicker">STRUCTURE</span>{result.outline.map((x,i)=><div className="outline-row" key={i}><strong>{x.section}</strong><ul>{x.points.map((p,j)=><li key={j}>{p}</li>)}</ul></div>)}</section>
          <section><span className="studio-kicker">DRAFT SCRIPT</span><pre className="studio-script">{result.script}</pre></section>
          <section><span className="studio-kicker">SHORT-FORM VARIATIONS</span><div className="short-grid">{result.shorts.map((x,i)=><article key={i}><strong>{x.title}</strong><b>{x.hook}</b><p>{x.body}</p><small>{x.cta}</small></article>)}</div></section>
          <section><span className="studio-kicker">DESCRIPTION</span><p>{result.description}</p></section>
          <section><span className="studio-kicker">NEXT STEPS</span><ol>{result.nextSteps.map((x,i)=><li key={i}>{x}</li>)}</ol></section>
        </>}
      </div>
    </section>
  </main>;
}

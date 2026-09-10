import { useState } from "react";
import { fetchScriptHooks } from "../lib/api";
import type { Opportunity, ResearchLanguage, ResearchMarket } from "../lib/intelligence";
import { saveOpportunity } from "../lib/workspace";

interface Props {
  opportunities: Opportunity[];
  seed: string;
  language: ResearchLanguage;
  market: ResearchMarket;
  token?: string | null;
  onAuthRequired: () => void;
}

export default function OpportunityPanel({
  opportunities,
  seed,
  language,
  market,
  token,
  onAuthRequired,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hooks, setHooks] = useState<Record<string, string>>({});
  const [loadingPhrase, setLoadingPhrase] = useState<string | null>(null);
  const [savingPhrase, setSavingPhrase] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  async function generateHook(phrase: string) {
    setLoadingPhrase(phrase);
    try {
      const result = await fetchScriptHooks(phrase, token);
      setHooks((current) => ({ ...current, [phrase]: result }));
      setExpanded(phrase);
    } catch (error: any) {
      setHooks((current) => ({ ...current, [phrase]: error.message }));
      setExpanded(phrase);
    } finally {
      setLoadingPhrase(null);
    }
  }

  async function handleSave(item: Opportunity) {
    if (!token) {
      onAuthRequired();
      return;
    }

    setSavingPhrase(item.phrase);
    try {
      await saveOpportunity({ token, seed, opportunity: item, language, market });
      setSaved((current) => ({ ...current, [item.phrase]: true }));
    } finally {
      setSavingPhrase(null);
    }
  }

  if (!opportunities.length) return null;

  return (
    <section className="opportunity-panel" aria-labelledby="opportunity-heading">
      <div className="opportunity-panel-heading">
        <div>
          <span className="result-kicker">ASKLOOM OPPORTUNITY ENGINE · BETA</span>
          <h3 id="opportunity-heading">Best opportunities in this research</h3>
        </div>
        <p>
          Scores currently use query structure, intent, specificity and first-party AskLoom momentum. They do not yet claim search volume or competition data.
        </p>
      </div>

      <div className="opportunity-list">
        {opportunities.slice(0, 8).map((item, index) => (
          <article className="opportunity-card" key={item.phrase}>
            <div className="opportunity-rank">#{index + 1}</div>
            <div className="opportunity-score" aria-label={`Opportunity score ${item.score} out of 100`}>
              <strong>{item.score}</strong><span>/100</span>
            </div>
            <div className="opportunity-content">
              <h4>{item.phrase}</h4>
              <div className="opportunity-badges">
                <span>{item.intent.replace("-", " ")}</span>
                {item.badges.map((badge) => <span key={badge}>{badge}</span>)}
              </div>
              {expanded === item.phrase && (
                <div className="opportunity-details">
                  <div>
                    <strong>Why it ranked</strong>
                    <ul>{item.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                  </div>
                  {hooks[item.phrase] && <pre>{hooks[item.phrase]}</pre>}
                </div>
              )}
            </div>
            <div className="opportunity-actions">
              <button type="button" className="secondary-action" onClick={() => setExpanded(expanded === item.phrase ? null : item.phrase)}>
                {expanded === item.phrase ? "Hide" : "Why?"}
              </button>
              <button type="button" className="secondary-action" disabled={savingPhrase === item.phrase || saved[item.phrase]} onClick={() => handleSave(item)}>
                {saved[item.phrase] ? "Saved" : savingPhrase === item.phrase ? "Saving..." : "Save"}
              </button>
              <button type="button" className="hook-btn opportunity-hook" disabled={loadingPhrase === item.phrase} onClick={() => generateHook(item.phrase)}>
                {loadingPhrase === item.phrase ? "Creating..." : "Create hook"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

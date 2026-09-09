import { useState } from "react";
import type { GroupedResults } from "../lib/api";
import { fetchScriptHooks } from "../lib/api";

interface Props {
  grouped: GroupedResults;
  token?: string | null;
}

export default function ResultsList({ grouped, token }: Props) {
  const [hooks, setHooks] = useState<Record<string, string>>({});
  const [loadingPhrase, setLoadingPhrase] = useState<string | null>(null);

  async function handleHook(phrase: string) {
    setLoadingPhrase(phrase);
    try {
      const result = await fetchScriptHooks(phrase, token);
      setHooks((prev) => ({ ...prev, [phrase]: result }));
    } catch (e: any) {
      setHooks((prev) => ({ ...prev, [phrase]: e.message }));
    } finally {
      setLoadingPhrase(null);
    }
  }

  function handleExport() {
    const rows = [["category", "subgroup", "phrase"]];
    Object.entries(grouped).forEach(([category, subgroups]) => {
      Object.entries(subgroups).forEach(([subgroup, phrases]) => {
        phrases.forEach((phrase) => rows.push([category, subgroup, phrase]));
      });
    });

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "askloom-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="export-row">
        <button type="button" className="secondary-action" onClick={handleExport}>
          Export CSV
        </button>
      </div>
      <div className="category-grid">
        {Object.entries(grouped).map(([category, subgroups]) => (
          <div className="category-card" key={category}>
            <h3>{category}</h3>
            {Object.entries(subgroups).map(([, phrases]) =>
              phrases.slice(0, 6).map((phrase) => (
                <div key={phrase}>
                  <div className="phrase-row">
                    <span>{phrase}</span>
                    <button
                      className="hook-btn"
                      onClick={() => handleHook(phrase)}
                      disabled={loadingPhrase === phrase}
                    >
                      {loadingPhrase === phrase ? "..." : "Hook"}
                    </button>
                  </div>
                  {hooks[phrase] && (
                    <pre
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "0.75rem",
                        whiteSpace: "pre-wrap",
                        margin: "0.25rem 0 0.5rem",
                        color: "#7a86c7",
                      }}
                    >
                      {hooks[phrase]}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </>
  );
}

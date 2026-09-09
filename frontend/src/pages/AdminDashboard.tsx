import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAdminOverview, retryWebhooks } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    fetchAdminOverview(token)
      .then(setOverview)
      .catch((error: Error) => setNotice(error.message));
  }, [navigate, token, user]);

  async function handleRetry() {
    if (!token) return;
    const result = await retryWebhooks(token);
    setNotice(`Retried ${result.attempted} webhook events; processed ${result.processed}.`);
    setOverview(await fetchAdminOverview(token));
  }

  return (
    <main className="settings-page">
      <header className="settings-header">
        <Link className="wordmark" to="/">
          Ask<span>Loom</span>
        </Link>
        <Link className="secondary-action" to="/">
          Back
        </Link>
      </header>

      <section className="settings-panel">
        <h1>Admin</h1>
        {notice && <p className="notice">{notice}</p>}
        <div className="metrics-grid">
          {Object.entries(overview?.counts ?? {}).map(([label, value]) => (
            <div className="metric" key={label}>
              <span>{label}</span>
              <strong>{String(value)}</strong>
            </div>
          ))}
        </div>
        <button className="secondary-action" onClick={handleRetry}>
          Retry webhooks
        </button>
      </section>

      <section className="settings-panel">
        <h2>Latest transactions</h2>
        {(overview?.latestTransactions ?? []).map((transaction: any) => (
          <div className="table-row" key={transaction.id}>
            <span>{transaction.userEmail}</span>
            <span>{transaction.plan?.name}</span>
            <span>{transaction.currency} {transaction.amount}</span>
            <span>{transaction.status}</span>
          </div>
        ))}
      </section>
    </main>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchAdminOverview,
  retryWebhooks,
  type AdminOverview,
  type WebhookRetryResult,
} from "../lib/api";
import { useAuth } from "../lib/auth";

const metricLabels: Record<keyof AdminOverview["counts"], string> = {
  users: "Users",
  activeSubscriptions: "Active plans",
  transactions: "Payments",
  pendingWebhooks: "Pending hooks",
  failedWebhooks: "Failed hooks",
};

function formatDate(value?: string | null) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("success") || normalized.includes("active") || normalized === "processed") {
    return "success";
  }
  if (normalized.includes("fail") || normalized.includes("error")) {
    return "danger";
  }
  return "pending";
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const loadOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setNotice(null);
    try {
      setOverview(await fetchAdminOverview(token));
    } catch (error: any) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    if (user.role !== "ADMIN") {
      setNotice("Admin access required.");
      setLoading(false);
      return;
    }

    void loadOverview();
  }, [loadOverview, navigate, token, user]);

  const health = useMemo(() => {
    const failed = overview?.counts.failedWebhooks ?? 0;
    const pending = overview?.counts.pendingWebhooks ?? 0;
    if (failed > 0) return { label: "Needs attention", tone: "danger" };
    if (pending > 0) return { label: "Processing", tone: "pending" };
    return { label: "Calm", tone: "success" };
  }, [overview]);

  async function handleRetry() {
    if (!token) return;
    setRetrying(true);
    setNotice(null);
    try {
      const result: WebhookRetryResult = await retryWebhooks(token);
      setNotice(`Retried ${result.attempted}; processed ${result.processed}.`);
      setOverview(await fetchAdminOverview(token));
    } catch (error: any) {
      setNotice(error.message);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-shell-header">
        <div>
          <Link className="wordmark" to="/">
            Ask<span>Loom</span>
          </Link>
          <p>Operations console</p>
        </div>
        <div className="admin-actions">
          <span className={`status-badge ${health.tone}`}>{health.label}</span>
          <button className="secondary-action" type="button" onClick={loadOverview} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link className="secondary-action" to="/">
            Back
          </Link>
        </div>
      </header>

      <section className="admin-hero-panel">
        <div>
          <div className="eyebrow">Live SaaS pulse</div>
          <h1>Keep AskLoom humming.</h1>
          <p>
            Watch accounts, subscriptions, payments, and Flutterwave webhook health
            from one quiet cockpit.
          </p>
        </div>
        <button className="admin-primary-action" type="button" onClick={handleRetry} disabled={retrying}>
          {retrying ? "Retrying webhooks..." : "Retry failed webhooks"}
        </button>
      </section>

      {notice && <p className="admin-notice">{notice}</p>}

      <section className="admin-metrics-grid">
        {(Object.entries(overview?.counts ?? {}) as Array<[keyof AdminOverview["counts"], number]>).map(
          ([key, value]) => (
            <div className={`admin-metric-card ${key.includes("failed") ? "danger-card" : ""}`} key={key}>
              <span>{metricLabels[key]}</span>
              <strong>{value}</strong>
            </div>
          )
        )}
        {loading && !overview &&
          ["Users", "Active plans", "Payments", "Pending hooks", "Failed hooks"].map((label) => (
            <div className="admin-metric-card loading-card" key={label}>
              <span>{label}</span>
              <strong>...</strong>
            </div>
          ))}
      </section>

      <section className="admin-grid">
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Recent payments</h2>
            <span>{overview?.latestTransactions.length ?? 0} shown</span>
          </div>
          <div className="admin-table">
            {(overview?.latestTransactions ?? []).map((transaction) => (
              <div className="admin-row" key={transaction.id}>
                <div>
                  <strong>{transaction.userEmail}</strong>
                  <span>{transaction.txRef}</span>
                </div>
                <div>{transaction.plan?.name ?? "Plan"}</div>
                <div>{transaction.currency} {transaction.amount}</div>
                <span className={`status-badge ${statusTone(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            ))}
            {!loading && overview?.latestTransactions.length === 0 && (
              <p className="empty-state">No payments yet.</p>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Webhook events</h2>
            <span>{overview?.latestWebhookEvents.length ?? 0} shown</span>
          </div>
          <div className="admin-table compact">
            {(overview?.latestWebhookEvents ?? []).map((event) => (
              <div className="admin-row" key={event.id}>
                <div>
                  <strong>{event.eventType}</strong>
                  <span>{event.provider} · {formatDate(event.receivedAt)}</span>
                  {event.processingError && <em>{event.processingError}</em>}
                </div>
                <span className={`status-badge ${event.processed ? "success" : "pending"}`}>
                  {event.processed ? "Processed" : "Pending"}
                </span>
              </div>
            ))}
            {!loading && overview?.latestWebhookEvents.length === 0 && (
              <p className="empty-state">No webhook events yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

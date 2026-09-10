import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const token = searchParams.get("token");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setBusy(true);
    setStatus(null);
    try {
      await resetPassword(token, password);
      setStatus("Password updated. You can log in with your new password.");
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="callback-page">
      <section className="callback-card">
        <Link className="wordmark" to="/">
          Ask<span>Loom</span>
        </Link>
        <h1>Reset password</h1>
        {!token ? (
          <p>Reset token is missing.</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />
            <button disabled={busy}>{busy ? "Updating..." : "Update password"}</button>
          </form>
        )}
        {status && <p>{status}</p>}
        <Link className="callback-link" to="/">
          Return home
        </Link>
      </section>
    </main>
  );
}

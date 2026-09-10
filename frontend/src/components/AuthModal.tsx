import { useState } from "react";
import { login as loginRequest, requestPasswordReset, signup } from "../lib/api";
import { useAuth } from "../lib/auth";

interface Props {
  onClose: () => void;
}

type Mode = "signup" | "login";

export default function AuthModal({ onClose }: Props) {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    try {
      const result =
        mode === "signup"
          ? await signup(email, password, firstName || undefined, lastName || undefined)
          : await loginRequest(email, password);

      login(result.token, result.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }

    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const result = await requestPasswordReset(email);
      setNotice(result.resetToken ? `Dev reset token: ${result.resetToken}` : "Password reset email sent.");
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>{mode === "signup" ? "Create account" : "Log in"}</h2>
          <button className="text-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === "signup" ? "active" : ""}
            type="button"
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => setMode("login")}
          >
            Log in
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="auth-name-grid">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
            minLength={mode === "signup" ? 8 : 1}
          />
          {error && <p className="auth-error">{error}</p>}
          {notice && <p className="notice">{notice}</p>}
          <button type="submit" disabled={busy}>
            {busy ? "Working..." : mode === "signup" ? "Create account" : "Log in"}
          </button>
          {mode === "login" && (
            <button className="text-button" type="button" onClick={handleForgotPassword} disabled={busy}>
              Forgot password
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

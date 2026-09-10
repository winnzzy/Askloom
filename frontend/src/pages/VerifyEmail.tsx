import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying your email...");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("Verification token is missing.");
      return;
    }

    verifyEmail(token)
      .then(() => setStatus("Email verified."))
      .catch((error: Error) => setStatus(error.message));
  }, [token]);

  return (
    <main className="callback-page">
      <section className="callback-card">
        <Link className="wordmark" to="/">
          Ask<span>Loom</span>
        </Link>
        <h1>Email verification</h1>
        <p>{status}</p>
        <Link className="callback-link" to="/">
          Return home
        </Link>
      </section>
    </main>
  );
}

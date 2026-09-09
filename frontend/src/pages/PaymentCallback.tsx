import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCurrentAccount, verifyPayment } from "../lib/api";
import { useAuth } from "../lib/auth";

type Status = "loading" | "success" | "failure";

export default function PaymentCallback() {
  const { token, login } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [plan, setPlan] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("transaction_id");
    setTxRef(params.get("tx_ref"));

    if (!transactionId) {
      setStatus("failure");
      setMessage("No transaction reference found.");
      return;
    }

    verifyPayment(transactionId)
      .then(async (result) => {
        setPlan(result.plan ?? null);
        if (token) {
          const account = await fetchCurrentAccount(token);
          login(token, account.user);
        }
        setStatus("success");
        setMessage("Your payment was verified.");
      })
      .catch((err: any) => {
        setStatus("failure");
        setMessage(err.message || "We could not verify this payment.");
      });
  }, [login, token]);

  return (
    <main className="callback-page">
      <section className="callback-card">
        <a className="wordmark" href="/">
          Ask<span>Loom</span>
        </a>
        <h1>
          {status === "loading"
            ? "Verifying your payment..."
            : status === "success"
            ? "Payment verified"
            : "Payment not verified"}
        </h1>
        <p>
          {status === "success" && plan
            ? `${message} Your ${plan} plan is active.`
            : message}
        </p>
        {txRef && <p className="callback-reference">Reference: {txRef}</p>}
        {status !== "loading" && (
          <Link className="callback-link" to="/">
            Return home
          </Link>
        )}
      </section>
    </main>
  );
}

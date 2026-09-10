import { getAuthHeader, refreshSession } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export interface CardPaymentInput {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface PaymentStep {
  chargeId: string;
  txRef?: string;
  status: string;
  verified?: boolean;
  plan?: string;
  nextAction?: string | null;
  checkoutUrl?: string | null;
}

async function paymentFetch(
  url: string,
  init: RequestInit,
  token?: string | null
): Promise<Response> {
  const request = (accessToken?: string | null) =>
    fetch(url, {
      credentials: "include",
      ...init,
      headers: {
        ...(init.headers as Record<string, string>),
        ...getAuthHeader(accessToken),
      },
    });

  let response = await request(token);
  if (response.status !== 401) return response;

  const session = await refreshSession();
  if (!session?.token) return response;
  response = await request(session.token);
  return response;
}

async function parsePaymentResponse(response: Response): Promise<PaymentStep> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Payment request failed");
  }
  return data as PaymentStep;
}

export async function initializeCardPayment(
  plan: string,
  card: CardPaymentInput,
  token?: string | null
): Promise<PaymentStep> {
  const response = await paymentFetch(
    `${API_BASE}/payment/initialize`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, card }),
    },
    token
  );
  return parsePaymentResponse(response);
}

export async function authorizeCardPayment(
  chargeId: string,
  type: "pin" | "otp",
  value: string,
  token?: string | null
): Promise<PaymentStep> {
  const response = await paymentFetch(
    `${API_BASE}/payment/authorize/${encodeURIComponent(chargeId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value }),
    },
    token
  );
  return parsePaymentResponse(response);
}

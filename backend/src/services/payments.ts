import axios from "axios";
import crypto from "crypto";
import {
  PaymentProvider,
  PaymentTransactionStatus,
  Prisma,
  SubscriptionStatus,
} from "@prisma/client";
import { config } from "../config/env";
import prisma from "../lib/prisma";
import { addBillingInterval } from "./subscription";

const FLW_AUTH_URL =
  "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token";
const FLW_SANDBOX_BASE_URL = "https://developersandbox-api.flutterwave.com";
const FLW_PRODUCTION_BASE_URL = "https://f4bexperience.flutterwave.com";

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function flutterwaveBaseUrl(): string {
  return config.flutterwave.environment === "production"
    ? FLW_PRODUCTION_BASE_URL
    : FLW_SANDBOX_BASE_URL;
}

export function hasFlutterwaveConfig(): boolean {
  return Boolean(
    config.flutterwave.clientId &&
      config.flutterwave.clientSecret &&
      config.flutterwave.encryptionKey &&
      config.flutterwave.redirectUrl
  );
}

export function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function providerEventIdFor(event: any): string | null {
  if (event?.id) return String(event.id);
  if (event?.data?.id) return `charge:${event.data.id}:${event?.type ?? "unknown"}`;
  if (event?.data?.reference) {
    return `reference:${event.data.reference}:${event?.type ?? "unknown"}`;
  }
  return null;
}

export async function getFlutterwaveAccessToken(): Promise<string> {
  if (!config.flutterwave.clientId || !config.flutterwave.clientSecret) {
    throw new Error("Flutterwave OAuth credentials are not configured");
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 30_000) {
    return cachedAccessToken.token;
  }

  const body = new URLSearchParams({
    client_id: config.flutterwave.clientId,
    client_secret: config.flutterwave.clientSecret,
    grant_type: "client_credentials",
  });

  const response = await axios.post(FLW_AUTH_URL, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 15_000,
  });

  const token = response.data?.access_token;
  if (!token) {
    throw new Error("Flutterwave did not return an access token");
  }

  const expiresIn = Number(response.data?.expires_in) || 600;
  cachedAccessToken = {
    token,
    expiresAt: Date.now() + Math.max(expiresIn - 30, 30) * 1000,
  };

  return token;
}

async function flutterwaveHeaders(withIdempotency = false) {
  const token = await getFlutterwaveAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Trace-Id": `askloom-${crypto.randomUUID()}`,
  };

  if (withIdempotency) {
    headers["X-Idempotency-Key"] = `askloom-${crypto.randomUUID()}`;
  }

  return headers;
}

function encryptionKey(): Buffer {
  if (!config.flutterwave.encryptionKey) {
    throw new Error("Flutterwave encryption key is not configured");
  }
  const key = Buffer.from(config.flutterwave.encryptionKey, "base64");
  if (key.length !== 32) {
    throw new Error("Flutterwave encryption key must decode to 32 bytes");
  }
  return key;
}

function generateNonce(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(12);
  let nonce = "";
  for (const byte of bytes) nonce += alphabet[byte % alphabet.length];
  return nonce;
}

export function encryptFlutterwaveValue(value: string, nonce: string): string {
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(nonce, "utf8")
  );
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  return encrypted.toString("base64");
}

export interface FlutterwaveCardInput {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export async function createFlutterwaveCardCharge(params: {
  reference: string;
  amount: string;
  currency: string;
  redirectUrl: string;
  customer: { email: string; firstName?: string | null; lastName?: string | null };
  card: FlutterwaveCardInput;
}) {
  const nonce = generateNonce();
  const payload = {
    amount: Number(params.amount),
    currency: params.currency,
    reference: params.reference,
    redirect_url: params.redirectUrl,
    customer: {
      email: params.customer.email,
      name: {
        first: params.customer.firstName || undefined,
        last: params.customer.lastName || undefined,
      },
    },
    payment_method: {
      type: "card",
      card: {
        nonce,
        encrypted_card_number: encryptFlutterwaveValue(params.card.number, nonce),
        encrypted_expiry_month: encryptFlutterwaveValue(params.card.expiryMonth, nonce),
        encrypted_expiry_year: encryptFlutterwaveValue(params.card.expiryYear, nonce),
        encrypted_cvv: encryptFlutterwaveValue(params.card.cvv, nonce),
      },
    },
  };

  const response = await axios.post(
    `${flutterwaveBaseUrl()}/orchestration/direct-charges`,
    payload,
    {
      headers: await flutterwaveHeaders(true),
      timeout: 20_000,
    }
  );

  return response.data?.data;
}

export async function authorizeFlutterwaveCharge(
  chargeId: string,
  authorization:
    | { type: "pin"; pin: string }
    | { type: "otp"; otp: string }
) {
  let body: Record<string, unknown>;

  if (authorization.type === "pin") {
    const nonce = generateNonce();
    body = {
      authorization: {
        type: "pin",
        pin: {
          nonce,
          encrypted_pin: encryptFlutterwaveValue(authorization.pin, nonce),
        },
      },
    };
  } else {
    body = {
      authorization: {
        type: "otp",
        otp: { code: authorization.otp },
      },
    };
  }

  const response = await axios.put(
    `${flutterwaveBaseUrl()}/charges/${encodeURIComponent(chargeId)}`,
    body,
    {
      headers: await flutterwaveHeaders(true),
      timeout: 20_000,
    }
  );

  return response.data?.data;
}

export async function verifyFlutterwaveTransaction(chargeId: string) {
  const response = await axios.get(
    `${flutterwaveBaseUrl()}/charges/${encodeURIComponent(chargeId)}`,
    {
      headers: await flutterwaveHeaders(),
      timeout: 15_000,
    }
  );

  return response.data?.data;
}

export async function activateVerifiedTransaction(data: any) {
  const txRef = data?.reference;
  if (!txRef) {
    return { verified: false as const, reason: "missing_reference" };
  }

  const transaction = await prisma.paymentTransaction.findUnique({
    where: { txRef },
    include: { plan: true },
  });

  if (!transaction) {
    return { verified: false as const, reason: "transaction_not_found" };
  }

  const providerTransactionId = data?.id ? String(data.id) : null;
  const amountMatches = Number(data?.amount) === Number(transaction.amount);
  const currencyMatches = data?.currency === transaction.currency;
  const statusMatches = data?.status === "succeeded";

  if (!amountMatches || !currencyMatches || !statusMatches) {
    if (data?.status && data.status !== "pending") {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: PaymentTransactionStatus.FAILED,
          providerTransactionId,
          rawResponse: toJson(data),
          verifiedAt: new Date(),
        },
      });
    }

    return { verified: false as const, reason: "verification_mismatch" };
  }

  if (transaction.status === PaymentTransactionStatus.SUCCESSFUL) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: transaction.userId,
        planId: transaction.planId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      verified: true as const,
      plan: transaction.plan.code,
      currentPeriodEnd: activeSubscription?.currentPeriodEnd ?? null,
    };
  }

  const now = new Date();
  const currentPeriodEnd = addBillingInterval(now, transaction.plan.billingInterval);

  const activated = await prisma.$transaction(async (tx) => {
    const claimed = await tx.paymentTransaction.updateMany({
      where: {
        id: transaction.id,
        status: { not: PaymentTransactionStatus.SUCCESSFUL },
      },
      data: {
        status: PaymentTransactionStatus.SUCCESSFUL,
        providerTransactionId,
        rawResponse: toJson(data),
        verifiedAt: now,
      },
    });

    if (claimed.count === 0) return false;

    await tx.subscription.updateMany({
      where: {
        userId: transaction.userId,
        status: SubscriptionStatus.ACTIVE,
      },
      data: { status: SubscriptionStatus.EXPIRED },
    });

    await tx.subscription.create({
      data: {
        userId: transaction.userId,
        planId: transaction.planId,
        status: SubscriptionStatus.ACTIVE,
        provider: PaymentProvider.FLUTTERWAVE,
        startsAt: now,
        currentPeriodStart: now,
        currentPeriodEnd,
      },
    });

    return true;
  });

  if (!activated) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: transaction.userId,
        planId: transaction.planId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      verified: true as const,
      plan: transaction.plan.code,
      currentPeriodEnd: activeSubscription?.currentPeriodEnd ?? null,
    };
  }

  return {
    verified: true as const,
    plan: transaction.plan.code,
    currentPeriodEnd,
  };
}

export async function processWebhookEvent(webhookEventId: string) {
  const webhookEvent = await prisma.webhookEvent.findUnique({
    where: { id: webhookEventId },
  });

  if (!webhookEvent) {
    return { processed: false, error: "Webhook event not found" };
  }

  const event = webhookEvent.payload as any;
  if (event?.type !== "charge.completed") {
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: true, processedAt: new Date(), processingError: null },
    });
    return { processed: true, error: null };
  }

  const providerTransactionId = event?.data?.id;
  if (!providerTransactionId || !config.flutterwave.clientId || !config.flutterwave.clientSecret) {
    const error = "Missing charge id or Flutterwave configuration";
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: false, processingError: error },
    });
    return { processed: false, error };
  }

  const data = await verifyFlutterwaveTransaction(String(providerTransactionId));
  const result = await activateVerifiedTransaction(data);
  const error = result.verified ? null : "Transaction verification failed";

  await prisma.webhookEvent.update({
    where: { id: webhookEvent.id },
    data: {
      processed: result.verified,
      processingError: error,
      processedAt: new Date(),
    },
  });

  return { processed: result.verified, error };
}

export async function retryPendingWebhookEvents(limit = 25) {
  const events = await prisma.webhookEvent.findMany({
    where: { processed: false },
    orderBy: { receivedAt: "asc" },
    take: limit,
  });

  let processed = 0;
  const errors: string[] = [];

  for (const event of events) {
    try {
      const result = await processWebhookEvent(event.id);
      if (result.processed) processed += 1;
      if (result.error) errors.push(`${event.id}: ${result.error}`);
    } catch (error) {
      errors.push(`${event.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return { attempted: events.length, processed, errors };
}

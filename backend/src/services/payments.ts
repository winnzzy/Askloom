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
  return Boolean(config.flutterwave.clientId && config.flutterwave.clientSecret);
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
  if (!token) throw new Error("Flutterwave did not return an access token");

  const expiresIn = Number(response.data?.expires_in) || 600;
  cachedAccessToken = {
    token,
    expiresAt: Date.now() + Math.max(expiresIn - 30, 30) * 1000,
  };

  return token;
}

async function flutterwaveHeaders() {
  return {
    Authorization: `Bearer ${await getFlutterwaveAccessToken()}`,
    "Content-Type": "application/json",
    "X-Trace-Id": `askloom-${crypto.randomUUID()}`,
  };
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
  if (!txRef) return { verified: false as const, reason: "missing_reference" };

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
      where: { userId: transaction.userId, status: SubscriptionStatus.ACTIVE },
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

  return { verified: true as const, plan: transaction.plan.code, currentPeriodEnd };
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

  const chargeId = event?.data?.id;
  if (!chargeId || !hasFlutterwaveConfig()) {
    const error = "Missing charge id or Flutterwave configuration";
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: false, processingError: error },
    });
    return { processed: false, error };
  }

  const data = await verifyFlutterwaveTransaction(String(chargeId));
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

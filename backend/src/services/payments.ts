import axios from "axios";
import {
  PaymentProvider,
  PaymentTransactionStatus,
  Prisma,
  SubscriptionStatus,
} from "@prisma/client";
import { config } from "../config/env";
import prisma from "../lib/prisma";
import { addBillingInterval } from "./subscription";

const FLW_BASE_URL = "https://api.flutterwave.com/v3";

export function hasFlutterwaveConfig(): boolean {
  return Boolean(config.flutterwave.secretKey && config.flutterwave.redirectUrl);
}

export function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function providerEventIdFor(event: any): string | null {
  if (event?.id) return String(event.id);
  if (event?.data?.id) return `transaction:${event.data.id}`;
  if (event?.data?.tx_ref) return `tx_ref:${event.data.tx_ref}:${event.event ?? "unknown"}`;
  return null;
}

export async function verifyFlutterwaveTransaction(transactionId: string) {
  const response = await axios.get(
    `${FLW_BASE_URL}/transactions/${transactionId}/verify`,
    {
      headers: { Authorization: `Bearer ${config.flutterwave.secretKey}` },
      timeout: 15000,
    }
  );

  return response.data?.data;
}

export async function activateVerifiedTransaction(data: any) {
  const txRef = data?.tx_ref;
  if (!txRef) {
    return { verified: false as const, reason: "missing_tx_ref" };
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
  const statusMatches = data?.status === "successful";

  if (!amountMatches || !currencyMatches || !statusMatches) {
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: PaymentTransactionStatus.FAILED,
        providerTransactionId,
        rawResponse: toJson(data),
        verifiedAt: new Date(),
      },
    });

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

    if (claimed.count === 0) {
      return false;
    }

    await tx.subscription.updateMany({
      where: {
        userId: transaction.userId,
        status: SubscriptionStatus.ACTIVE,
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
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
  if (event?.event !== "charge.completed") {
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: true, processedAt: new Date(), processingError: null },
    });
    return { processed: true, error: null };
  }

  const providerTransactionId = event?.data?.id;
  if (!providerTransactionId || !config.flutterwave.secretKey) {
    const error = "Missing transaction id or Flutterwave configuration";
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

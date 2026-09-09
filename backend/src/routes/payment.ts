import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { PaymentProvider, PaymentTransactionStatus } from "@prisma/client";
import { config } from "../config/env";
import prisma from "../lib/prisma";
import {
  activateVerifiedTransaction,
  hasFlutterwaveConfig,
  processWebhookEvent,
  providerEventIdFor,
  toJson,
  verifyFlutterwaveTransaction,
} from "../services/payments";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../utils/authMiddleware";

const router = Router();
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

router.post(
  "/payment/initialize",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { plan: planCode } = req.body as { plan?: string };

    if (!planCode) {
      return res.status(400).json({ error: "plan is required" });
    }
    if (!hasFlutterwaveConfig()) {
      return res.status(500).json({ error: "Flutterwave is not configured" });
    }

    const plan = await prisma.plan.findFirst({
      where: { code: planCode, isActive: true },
    });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const txRef = `askloom-${plan.code}-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        planId: plan.id,
        txRef,
        amount: plan.price,
        currency: plan.currency,
        status: PaymentTransactionStatus.PENDING,
        provider: PaymentProvider.FLUTTERWAVE,
      },
    });

    try {
      const response = await axios.post(
        `${FLW_BASE_URL}/payments`,
        {
          tx_ref: txRef,
          amount: plan.price.toString(),
          currency: plan.currency,
          redirect_url: config.flutterwave.redirectUrl,
          customer: {
            email: user.email,
            name:
              [user.firstName, user.lastName].filter(Boolean).join(" ") ||
              user.email,
          },
          customizations: {
            title: "AskLoom",
            description: `${plan.name} subscription`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.flutterwave.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const checkoutUrl = response.data?.data?.link;
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          checkoutUrl,
          rawResponse: toJson(response.data),
        },
      });

      res.json({ checkoutUrl, tx_ref: txRef });
    } catch {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: PaymentTransactionStatus.FAILED },
      });

      res.status(502).json({ error: "Failed to initialize payment" });
    }
  })
);

router.get("/payment/verify/:transactionId", asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  if (!config.flutterwave.secretKey) {
    return res.status(500).json({ error: "Flutterwave is not configured" });
  }

  try {
    const data = await verifyFlutterwaveTransaction(transactionId);
    const result = await activateVerifiedTransaction(data);

    if (!result.verified) {
      return res.status(400).json({ verified: false });
    }

    res.json({
      verified: true,
      plan: result.plan,
      currentPeriodEnd: result.currentPeriodEnd,
    });
  } catch {
    res.status(502).json({ error: "Verification failed" });
  }
}));

router.post("/payment/webhook", asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["verif-hash"];

  if (!signature || signature !== config.flutterwave.secretHash) {
    return res.status(401).end();
  }

  const event = req.body;
  const providerEventId = providerEventIdFor(event);

  try {
    const existing = providerEventId
      ? await prisma.webhookEvent.findUnique({
          where: {
            provider_providerEventId: {
              provider: PaymentProvider.FLUTTERWAVE,
              providerEventId,
            },
          },
        })
      : null;

    if (existing) {
      if (existing.processed) {
        return res.status(200).end();
      }
    }

    const webhookEvent =
      existing ??
      (await prisma.webhookEvent.create({
        data: {
          provider: PaymentProvider.FLUTTERWAVE,
          providerEventId,
          eventType: event?.event ?? "unknown",
          payload: toJson(event),
        },
      }));

    await processWebhookEvent(webhookEvent.id);

    res.status(200).end();
  } catch {
    res.status(200).end();
  }
}));

export default router;

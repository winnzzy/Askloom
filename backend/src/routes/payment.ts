import { Router, Request, Response } from "express";
import crypto from "crypto";
import { PaymentProvider } from "@prisma/client";
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

const router = Router();

function isValidWebhookSignature(rawBody: Buffer, signature: string, secretHash: string): boolean {
  const digest = crypto
    .createHmac("sha256", secretHash)
    .update(rawBody)
    .digest("base64");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

router.post("/payment/initialize", (_req: Request, res: Response) => {
  return res.status(503).json({
    error:
      "Flutterwave V4 hosted checkout is not available in this integration yet. Payment details are never collected by AskLoom.",
  });
});

router.get(
  "/payment/verify/:identifier",
  asyncHandler(async (req: Request, res: Response) => {
    const { identifier } = req.params;
    if (!hasFlutterwaveConfig()) {
      return res.status(500).json({ error: "Flutterwave v4 is not configured" });
    }

    let chargeId = identifier;
    if (!/^chg_[A-Za-z0-9]+$/.test(identifier)) {
      if (!/^askloom-[A-Za-z0-9_-]+$/.test(identifier)) {
        return res.status(400).json({ error: "Invalid payment reference" });
      }
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { txRef: identifier },
      });
      if (!transaction?.providerTransactionId) {
        return res.status(404).json({ error: "Payment transaction not found" });
      }
      chargeId = transaction.providerTransactionId;
    }

    try {
      const data = await verifyFlutterwaveTransaction(chargeId);
      const result = await activateVerifiedTransaction(data);
      if (!result.verified) return res.status(400).json({ verified: false });

      return res.json({
        verified: true,
        plan: result.plan,
        currentPeriodEnd: result.currentPeriodEnd,
      });
    } catch {
      return res.status(502).json({ error: "Verification failed" });
    }
  })
);

router.post(
  "/payment/webhook",
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["flutterwave-signature"];
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

    if (!config.flutterwave.secretHash) return res.status(503).end();
    if (
      typeof signature !== "string" ||
      !rawBody ||
      !isValidWebhookSignature(rawBody, signature, config.flutterwave.secretHash)
    ) {
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

      if (existing?.processed) return res.status(200).end();

      const webhookEvent =
        existing ??
        (await prisma.webhookEvent.create({
          data: {
            provider: PaymentProvider.FLUTTERWAVE,
            providerEventId,
            eventType: event?.type ?? "unknown",
            payload: toJson(event),
          },
        }));

      await processWebhookEvent(webhookEvent.id);
      return res.status(200).end();
    } catch {
      return res.status(200).end();
    }
  })
);

export default router;

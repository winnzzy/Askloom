import { Router, Request, Response } from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { PaymentProvider, PaymentTransactionStatus } from "@prisma/client";
import { z } from "zod";
import { config } from "../config/env";
import prisma from "../lib/prisma";
import {
  activateVerifiedTransaction,
  authorizeFlutterwaveCharge,
  createFlutterwaveCardCharge,
  hasFlutterwaveConfig,
  processWebhookEvent,
  providerEventIdFor,
  toJson,
  verifyFlutterwaveTransaction,
} from "../services/payments";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../utils/authMiddleware";

const router = Router();
const paymentInitializeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const initializeSchema = z.object({
  plan: z.string().trim().min(1).max(40).regex(/^[a-z0-9_-]+$/i),
  card: z.object({
    number: z.string().regex(/^\d{12,19}$/),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expiryYear: z.string().regex(/^\d{2,4}$/),
    cvv: z.string().regex(/^\d{3,4}$/),
  }),
});

const authorizationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("pin"), value: z.string().regex(/^\d{4,6}$/) }),
  z.object({ type: z.literal("otp"), value: z.string().trim().min(4).max(12) }),
]);

function nextActionFrom(data: any) {
  return data?.next_action?.type ?? null;
}

function redirectUrlFrom(data: any): string | null {
  const value = data?.next_action?.redirect_url?.url;
  return typeof value === "string" && value.startsWith("https://") ? value : null;
}

function appendReference(url: string, reference: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("reference", reference);
  return parsed.toString();
}

function isValidWebhookSignature(rawBody: Buffer, signature: string, secretHash: string): boolean {
  const digest = crypto
    .createHmac("sha256", secretHash)
    .update(rawBody)
    .digest("base64");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

router.post(
  "/payment/initialize",
  paymentInitializeLimiter,
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = initializeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payment details" });
    }
    if (!hasFlutterwaveConfig()) {
      return res.status(500).json({ error: "Flutterwave v4 is not configured" });
    }

    const plan = await prisma.plan.findFirst({
      where: { code: parsed.data.plan, isActive: true },
    });
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(401).json({ error: "Authentication required" });

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
      const data = await createFlutterwaveCardCharge({
        reference: txRef,
        amount: plan.price.toString(),
        currency: plan.currency,
        redirectUrl: appendReference(config.flutterwave.redirectUrl!, txRef),
        customer: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        card: parsed.data.card,
      });

      const chargeId = data?.id ? String(data.id) : null;
      if (!chargeId) throw new Error("Flutterwave did not return a charge id");

      const checkoutUrl = redirectUrlFrom(data);
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          providerTransactionId: chargeId,
          checkoutUrl,
          rawResponse: toJson(data),
        },
      });

      if (data?.status === "succeeded") {
        const result = await activateVerifiedTransaction(data);
        return res.json({
          chargeId,
          txRef,
          status: "succeeded",
          verified: result.verified,
          plan: result.verified ? result.plan : undefined,
        });
      }

      return res.json({
        chargeId,
        txRef,
        status: data?.status ?? "pending",
        nextAction: nextActionFrom(data),
        checkoutUrl,
      });
    } catch {
      return res.status(502).json({ error: "Failed to initialize payment" });
    }
  })
);

router.post(
  "/payment/authorize/:chargeId",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = authorizationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid authorization details" });
    }

    const chargeId = req.params.chargeId;
    if (!/^chg_[A-Za-z0-9]+$/.test(chargeId)) {
      return res.status(400).json({ error: "Invalid charge id" });
    }

    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        providerTransactionId: chargeId,
        userId: req.user!.id,
        provider: PaymentProvider.FLUTTERWAVE,
      },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Payment transaction not found" });
    }

    const data = await authorizeFlutterwaveCharge(
      chargeId,
      parsed.data.type === "pin"
        ? { type: "pin", pin: parsed.data.value }
        : { type: "otp", otp: parsed.data.value }
    );

    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { rawResponse: toJson(data) },
    });

    if (data?.status === "succeeded") {
      const result = await activateVerifiedTransaction(data);
      return res.json({
        chargeId,
        status: "succeeded",
        verified: result.verified,
        plan: result.verified ? result.plan : undefined,
      });
    }

    return res.json({
      chargeId,
      status: data?.status ?? "pending",
      nextAction: nextActionFrom(data),
      checkoutUrl: redirectUrlFrom(data),
    });
  })
);

router.get(
  "/payment/verify/:identifier",
  asyncHandler(async (req: Request, res: Response) => {
    const { identifier } = req.params;
    if (!config.flutterwave.clientId || !config.flutterwave.clientSecret) {
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

import { Router, Request, Response, NextFunction } from "express";
import { SubscriptionStatus, UserRole } from "@prisma/client";
import prisma from "../lib/prisma";
import { retryPendingWebhookEvents } from "../services/payments";
import { requireAuth } from "../utils/authMiddleware";

const router = Router();

router.use(requireAuth);
router.use(async (req: Request, res: Response, next: NextFunction) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { role: true },
  });

  if (user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
});

router.get("/admin/overview", async (_req: Request, res: Response) => {
  const [
    users,
    activeSubscriptions,
    transactions,
    pendingWebhooks,
    failedWebhooks,
    latestTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
    prisma.paymentTransaction.count(),
    prisma.webhookEvent.count({ where: { processed: false, processingError: null } }),
    prisma.webhookEvent.count({ where: { processed: false, processingError: { not: null } } }),
    prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { email: true } },
        plan: { select: { code: true, name: true } },
      },
    }),
  ]);

  res.json({
    counts: {
      users,
      activeSubscriptions,
      transactions,
      pendingWebhooks,
      failedWebhooks,
    },
    latestTransactions: latestTransactions.map((transaction) => ({
      id: transaction.id,
      txRef: transaction.txRef,
      userEmail: transaction.user.email,
      plan: transaction.plan,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      status: transaction.status,
      createdAt: transaction.createdAt,
    })),
  });
});

router.post("/admin/webhooks/retry", async (_req: Request, res: Response) => {
  const result = await retryPendingWebhookEvents();
  res.json(result);
});

export default router;

import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/plans", async (_req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    res.json({
      plans: plans.map((plan) => ({
        code: plan.code,
        name: plan.name,
        description: plan.description,
        price: plan.price.toString(),
        currency: plan.currency,
        billingInterval: plan.billingInterval,
        dailySearchLimit: plan.dailySearchLimit,
        scriptHookLimit: plan.scriptHookLimit,
      })),
    });
  } catch {
    res.status(503).json({ error: "Database is unavailable" });
  }
});

export default router;

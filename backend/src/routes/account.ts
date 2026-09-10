import { Router, Request, Response } from "express";
import { SubscriptionStatus, TeamRole } from "@prisma/client";
import { z } from "zod";
import prisma from "../lib/prisma";
import { getActivePlanForUser, getActiveSubscriptionForUser } from "../services/subscription";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../utils/authMiddleware";

const router = Router();

router.use(requireAuth);

const teamSchema = z.object({ name: z.string().trim().min(2).max(80) });
const memberSchema = z.object({ email: z.string().email().transform((email) => email.toLowerCase()) });

function planPayload(plan: Awaited<ReturnType<typeof getActivePlanForUser>>) {
  if (!plan) return null;
  return {
    code: plan.code,
    name: plan.name,
    price: plan.price.toString(),
    currency: plan.currency,
    billingInterval: plan.billingInterval,
    teamSeatLimit: plan.teamSeatLimit,
  };
}

function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function groupedToRows(grouped: unknown) {
  const rows: Array<{ category: string; subgroup: string; phrase: string }> = [];
  if (!grouped || typeof grouped !== "object") return rows;

  for (const [category, subgroups] of Object.entries(grouped as Record<string, unknown>)) {
    if (!subgroups || typeof subgroups !== "object") continue;
    for (const [subgroup, phrases] of Object.entries(subgroups as Record<string, unknown>)) {
      if (!Array.isArray(phrases)) continue;
      for (const phrase of phrases) {
        rows.push({ category, subgroup, phrase: String(phrase) });
      }
    }
  }

  return rows;
}

async function requireAgencyPlan(userId: string, res: Response) {
  const plan = await getActivePlanForUser(userId);
  if (plan?.code !== "agency") {
    res.status(403).json({ error: "Team seats are available on the Agency plan." });
    return null;
  }

  return plan;
}

router.get("/account/billing", asyncHandler(async (req: Request, res: Response) => {
  const [activePlan, subscriptions, transactions] = await Promise.all([
    getActivePlanForUser(req.user!.id),
    prisma.subscription.findMany({
      where: { userId: req.user!.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.paymentTransaction.findMany({
      where: { userId: req.user!.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  res.json({
    currentPlan: planPayload(activePlan),
    subscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      plan: planPayload(subscription.plan),
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      createdAt: subscription.createdAt,
    })),
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      txRef: transaction.txRef,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      status: transaction.status,
      plan: planPayload(transaction.plan),
      verifiedAt: transaction.verifiedAt,
      createdAt: transaction.createdAt,
    })),
  });
}));

router.post("/account/subscription/cancel", asyncHandler(async (req: Request, res: Response) => {
  const subscription = await getActiveSubscriptionForUser(req.user!.id);
  if (!subscription) {
    return res.status(404).json({ error: "No active subscription found" });
  }

  const now = new Date();
  const shouldEndImmediately =
    !subscription.currentPeriodEnd || subscription.currentPeriodEnd <= now;

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: shouldEndImmediately ? SubscriptionStatus.CANCELLED : SubscriptionStatus.ACTIVE,
      cancelledAt: now,
    },
    include: { plan: true },
  });

  res.json({
    ok: true,
    status: updated.status,
    currentPeriodEnd: updated.currentPeriodEnd,
    cancelledAt: updated.cancelledAt,
    accessEndsAt: updated.currentPeriodEnd,
  });
}));

router.post("/account/subscription/downgrade", asyncHandler(async (req: Request, res: Response) => {
  const result = await prisma.subscription.updateMany({
    where: { userId: req.user!.id, status: SubscriptionStatus.ACTIVE },
    data: { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
  });

  res.json({ ok: true, plan: "free", cancelled: result.count });
}));

router.get("/account/searches", asyncHandler(async (req: Request, res: Response) => {
  const searches = await prisma.searchHistory.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json({
    searches: searches.map((search) => ({
      id: search.id,
      seed: search.seed,
      total: search.total,
      sources: search.sources,
      createdAt: search.createdAt,
    })),
  });
}));

router.get("/account/searches/:id/export.csv", asyncHandler(async (req: Request, res: Response) => {
  const search = await prisma.searchHistory.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });

  if (!search) {
    return res.status(404).json({ error: "Search not found" });
  }

  const rows = groupedToRows(search.grouped);
  const lines = [
    ["seed", "category", "subgroup", "phrase"].map(csvEscape).join(","),
    ...rows.map((row) =>
      [search.seed, row.category, row.subgroup, row.phrase].map(csvEscape).join(",")
    ),
  ];

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="askloom-${search.seed.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv"`
  );
  return res.send(lines.join("\n"));
}));

router.delete("/account/searches/:id", asyncHandler(async (req: Request, res: Response) => {
  const result = await prisma.searchHistory.deleteMany({
    where: { id: req.params.id, userId: req.user!.id },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: "Search not found" });
  }

  res.json({ ok: true });
}));

router.get("/account/team", asyncHandler(async (req: Request, res: Response) => {
  const teams = await prisma.team.findMany({
    where: {
      OR: [{ ownerId: req.user!.id }, { memberships: { some: { userId: req.user!.id } } }],
    },
    include: {
      memberships: {
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ teams });
}));

router.post("/account/team", asyncHandler(async (req: Request, res: Response) => {
  const agencyPlan = await requireAgencyPlan(req.user!.id, res);
  if (!agencyPlan) return;

  const parsed = teamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid team name" });

  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      ownerId: req.user!.id,
      memberships: {
        create: { userId: req.user!.id, role: TeamRole.OWNER },
      },
    },
    include: { memberships: true },
  });

  res.status(201).json({ team });
}));

router.post("/account/team/:teamId/members", asyncHandler(async (req: Request, res: Response) => {
  const agencyPlan = await requireAgencyPlan(req.user!.id, res);
  if (!agencyPlan) return;

  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid member email" });

  const team = await prisma.team.findFirst({
    where: { id: req.params.teamId, ownerId: req.user!.id },
  });
  if (!team) return res.status(404).json({ error: "Team not found" });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(404).json({ error: "No user with that email" });

  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: team.id, userId: user.id } },
  });
  if (existingMember) {
    return res.status(200).json({ member: existingMember });
  }

  if (agencyPlan.teamSeatLimit !== null) {
    const seatCount = await prisma.teamMember.count({ where: { teamId: team.id } });
    if (seatCount >= agencyPlan.teamSeatLimit) {
      return res.status(403).json({ error: "Team seat limit reached." });
    }
  }

  const member = await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: user.id } },
    update: {},
    create: { teamId: team.id, userId: user.id, role: TeamRole.MEMBER },
  });

  res.status(201).json({ member });
}));

router.delete("/account/team/:teamId/members/:memberId", asyncHandler(async (req: Request, res: Response) => {
  const team = await prisma.team.findFirst({
    where: { id: req.params.teamId, ownerId: req.user!.id },
  });
  if (!team) return res.status(404).json({ error: "Team not found" });

  const member = await prisma.teamMember.findFirst({
    where: { id: req.params.memberId, teamId: team.id },
  });
  if (!member) return res.status(404).json({ error: "Team member not found" });
  if (member.role === TeamRole.OWNER) {
    return res.status(400).json({ error: "Team owner cannot be removed" });
  }

  await prisma.teamMember.delete({ where: { id: member.id } });
  res.json({ ok: true });
}));

export default router;

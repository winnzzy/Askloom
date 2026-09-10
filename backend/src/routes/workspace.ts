import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../utils/authMiddleware";
import { SUPPORTED_LANGUAGES, SUPPORTED_MARKETS } from "../services/intelligence";

const router = Router();
router.use(requireAuth);

const CONTENT_STATUSES = ["IDEA", "PLANNED", "IN_PROGRESS", "PUBLISHED"] as const;

const projectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  language: z.enum(SUPPORTED_LANGUAGES).default("en"),
  market: z.enum(SUPPORTED_MARKETS).default("NG"),
});

const opportunitySchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  seed: z.string().trim().min(1).max(120),
  phrase: z.string().trim().min(1).max(300),
  score: z.number().int().min(1).max(99),
  intent: z.string().trim().min(1).max(40),
  category: z.string().trim().min(1).max(40),
  language: z.enum(SUPPORTED_LANGUAGES),
  market: z.enum(SUPPORTED_MARKETS),
  reasons: z.array(z.string().trim().min(1).max(160)).max(5).default([]),
});

const assignmentSchema = z.object({
  projectId: z.string().uuid().nullable(),
});

const statusSchema = z.object({
  contentStatus: z.enum(CONTENT_STATUSES),
});

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

router.get("/account/projects", asyncHandler(async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.user!.id },
    include: {
      _count: { select: { opportunities: true } },
      opportunities: { orderBy: { updatedAt: "desc" }, take: 5 },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return res.json({ projects });
}));

router.post("/account/projects", asyncHandler(async (req: Request, res: Response) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid project details" });

  const project = await prisma.project.create({
    data: { userId: req.user!.id, ...parsed.data },
  });

  return res.status(201).json({ project });
}));

router.delete("/account/projects/:id", asyncHandler(async (req: Request, res: Response) => {
  const result = await prisma.project.deleteMany({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (result.count === 0) return res.status(404).json({ error: "Project not found" });
  return res.json({ ok: true });
}));

router.get("/account/opportunities", asyncHandler(async (req: Request, res: Response) => {
  const opportunities = await prisma.savedOpportunity.findMany({
    where: { userId: req.user!.id },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return res.json({ opportunities });
}));

router.post("/account/opportunities", asyncHandler(async (req: Request, res: Response) => {
  const parsed = opportunitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid opportunity" });

  if (parsed.data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: parsed.data.projectId, userId: req.user!.id },
      select: { id: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
  }

  const duplicate = await prisma.savedOpportunity.findFirst({
    where: {
      userId: req.user!.id,
      phrase: parsed.data.phrase,
      language: parsed.data.language,
      market: parsed.data.market,
    },
  });

  if (duplicate) return res.status(200).json({ opportunity: duplicate, duplicate: true });

  const opportunity = await prisma.savedOpportunity.create({
    data: {
      userId: req.user!.id,
      ...parsed.data,
      reasons: toJson(parsed.data.reasons),
    },
  });

  if (opportunity.projectId) {
    await prisma.project.update({
      where: { id: opportunity.projectId },
      data: { updatedAt: new Date() },
    });
  }

  return res.status(201).json({ opportunity, duplicate: false });
}));

router.patch("/account/opportunities/:id/project", asyncHandler(async (req: Request, res: Response) => {
  const parsed = assignmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid project assignment" });

  const opportunity = await prisma.savedOpportunity.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    select: { id: true, projectId: true },
  });
  if (!opportunity) return res.status(404).json({ error: "Saved opportunity not found" });

  if (parsed.data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: parsed.data.projectId, userId: req.user!.id },
      select: { id: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
  }

  const updated = await prisma.savedOpportunity.update({
    where: { id: opportunity.id },
    data: { projectId: parsed.data.projectId },
    include: { project: { select: { id: true, name: true } } },
  });

  const touchedProjectIds = [opportunity.projectId, parsed.data.projectId].filter((id): id is string => Boolean(id));
  if (touchedProjectIds.length > 0) {
    await prisma.project.updateMany({
      where: { id: { in: touchedProjectIds }, userId: req.user!.id },
      data: { updatedAt: new Date() },
    });
  }

  return res.json({ opportunity: updated });
}));

router.patch("/account/opportunities/:id/status", asyncHandler(async (req: Request, res: Response) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid content status" });

  const existing = await prisma.savedOpportunity.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    select: { id: true, projectId: true },
  });
  if (!existing) return res.status(404).json({ error: "Saved opportunity not found" });

  const opportunity = await prisma.savedOpportunity.update({
    where: { id: existing.id },
    data: { contentStatus: parsed.data.contentStatus },
    include: { project: { select: { id: true, name: true } } },
  });

  if (existing.projectId) {
    await prisma.project.update({
      where: { id: existing.projectId },
      data: { updatedAt: new Date() },
    });
  }

  return res.json({ opportunity });
}));

router.delete("/account/opportunities/:id", asyncHandler(async (req: Request, res: Response) => {
  const result = await prisma.savedOpportunity.deleteMany({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (result.count === 0) return res.status(404).json({ error: "Saved opportunity not found" });
  return res.json({ ok: true });
}));

export default router;

import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  PRODUCT_EVENTS,
  recordProductMetric,
  SUPPORTED_LANGUAGES,
  SUPPORTED_MARKETS,
} from "../services/intelligence";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
});

const eventSchema = z.object({
  eventName: z.enum(PRODUCT_EVENTS),
  language: z.enum(SUPPORTED_LANGUAGES).default("en"),
  market: z.enum(SUPPORTED_MARKETS).default("NG"),
  platform: z.string().trim().min(1).max(24).default("web"),
});

router.post(
  "/analytics/event",
  analyticsLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid analytics event" });

    await recordProductMetric(parsed.data);
    return res.status(202).json({ accepted: true });
  })
);

export default router;

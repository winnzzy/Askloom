import { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const excludedPaths = new Set(["/api/payment/webhook"]);

export function sameOriginGuard(req: Request, res: Response, next: NextFunction) {
  if (!unsafeMethods.has(req.method) || excludedPaths.has(req.path)) {
    return next();
  }

  const origin = req.headers.origin;
  if (!origin) {
    return next();
  }

  if (origin !== config.frontendUrl) {
    return res.status(403).json({ error: "Invalid request origin" });
  }

  next();
}

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

interface AuthTokenPayload {
  id: string;
  email: string;
}

// Attaches req.user if a valid token is present. Does NOT block the request
// when absent, so anonymous users still get free-tier access in suggest.ts.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ") && config.jwtSecret) {
    try {
      const token = header.slice(7);
      const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
      if (decoded.id && decoded.email) {
        req.user = { id: decoded.id, email: decoded.email };
      }
    } catch {
      // invalid/expired token: fall through as anonymous
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  next();
}

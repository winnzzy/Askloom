import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../config/env";
import prisma from "../lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email";
import { getActivePlanForUser } from "../services/subscription";
import { addDays, addHours, randomToken, tokenHash } from "../services/tokens";
import { JWT_AUDIENCE, JWT_ISSUER, requireAuth } from "../utils/authMiddleware";

const router = Router();
const PASSWORD_COST = 12;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_COOKIE = "askloom_refresh";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(401).json({ error: "Invalid credentials" });
  },
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const emailActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
});

const signupSchema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase()),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
});

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).nullable().optional(),
  lastName: z.string().trim().min(1).nullable().optional(),
});

function issueAccessToken(user: { id: string; email: string }): string {
  if (!config.jwtSecret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: "HS256",
  });
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = randomToken();
  await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash: tokenHash(token),
      expiresAt: addDays(new Date(), 30),
    },
  });
  return token;
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
    path: "/api/auth",
  });
}

function publicUser(user: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  role?: string;
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    emailVerified: user.emailVerified,
    role: user.role,
  };
}

function publicPlan(plan: Awaited<ReturnType<typeof getActivePlanForUser>>) {
  if (!plan) return null;
  return {
    code: plan.code,
    name: plan.name,
    currency: plan.currency,
    price: plan.price.toString(),
    billingInterval: plan.billingInterval,
    dailySearchLimit: plan.dailySearchLimit,
    scriptHookLimit: plan.scriptHookLimit,
    teamSeatLimit: plan.teamSeatLimit,
  };
}

function isDatabaseConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server"))
  );
}

function handleAuthError(error: unknown, res: Response) {
  if (isDatabaseConnectionError(error)) {
    return res.status(503).json({ error: "Database is unavailable" });
  }
  return res.status(500).json({ error: "Authentication request failed" });
}

async function sendAuthResponse(res: Response, user: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  role?: string;
}) {
  const accessToken = issueAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  const plan = await getActivePlanForUser(user.id);

  return res.json({
    token: accessToken,
    user: { ...publicUser(user), currentPlan: publicPlan(plan) },
  });
}

router.post("/auth/signup", signupLimiter, async (req: Request, res: Response) => {
  if (!config.jwtSecret) {
    return res.status(500).json({ error: "Authentication is not configured" });
  }

  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid signup details" });
  }

  try {
    const { email, password, firstName, lastName } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_COST);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName },
    });

    const verificationToken = randomToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(verificationToken),
        expiresAt: addDays(new Date(), 2),
      },
    });
    await sendVerificationEmail(user.email, verificationToken);

    return sendAuthResponse(res.status(201), user);
  } catch (error) {
    return handleAuthError(error, res);
  }
});

router.post("/auth/login", loginLimiter, async (req: Request, res: Response) => {
  if (!config.jwtSecret) {
    return res.status(500).json({ error: "Authentication is not configured" });
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid login details" });
  }

  try {
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    return handleAuthError(error, res);
  }
});

router.post("/auth/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const session = await prisma.refreshSession.findUnique({
      where: { tokenHash: tokenHash(refreshToken) },
      include: { user: true },
    });

    const now = new Date();
    if (!session || session.revokedAt || session.expiresAt <= now) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Authentication required" });
    }

    // Atomically claim this refresh session. Only one concurrent request can
    // rotate a given refresh token; replay/racing requests are rejected.
    const claimed = await prisma.refreshSession.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    });

    if (claimed.count !== 1) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Authentication required" });
    }

    return sendAuthResponse(res, session.user);
  } catch (error) {
    return handleAuthError(error, res);
  }
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) {
    await prisma.refreshSession
      .updateMany({
        where: { tokenHash: tokenHash(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }
  clearRefreshCookie(res);
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const plan = await getActivePlanForUser(user.id);
    return res.json({ user: publicUser(user), plan: publicPlan(plan) });
  } catch (error) {
    return handleAuthError(error, res);
  }
});

router.patch("/auth/me", requireAuth, async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid profile details" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: parsed.data,
    });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return handleAuthError(error, res);
  }
});

router.post("/auth/password/forgot", emailActionLimiter, async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const response: { ok: true; resetToken?: string } = { ok: true };
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const resetToken = randomToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: tokenHash(resetToken),
          expiresAt: addHours(new Date(), 1),
        },
      });
      await sendPasswordResetEmail(user.email, resetToken);
      if (config.nodeEnv !== "production") response.resetToken = resetToken;
    }
    return res.json(response);
  } catch (error) {
    return handleAuthError(error, res);
  }
});

router.post("/auth/password/reset", emailActionLimiter, async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid reset details" });
  }

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: tokenHash(parsed.data.token) },
    });
    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, PASSWORD_COST);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshSession.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return res.json({ ok: true });
  } catch (error) {
    return handleAuthError(error, res);
  }
});

router.post("/auth/email/verification", emailActionLimiter, requireAuth, async (req: Request, res: Response) => {
  const response: { ok: true; verificationToken?: string } = { ok: true };
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(401).json({ error: "Authentication required" });
    if (user.emailVerified) return res.json(response);

    const verificationToken = randomToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(verificationToken),
        expiresAt: addDays(new Date(), 2),
      },
    });
    await sendVerificationEmail(user.email, verificationToken);
    if (config.nodeEnv !== "production") response.verificationToken = verificationToken;
    return res.json(response);
  } catch (error) {
    return handleAuthError(error, res);
  }
});

router.post("/auth/email/verify", async (req: Request, res: Response) => {
  const parsed = z.object({ token: z.string().min(32) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid verification token" });
  }

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash: tokenHash(parsed.data.token) },
    });
    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
    return res.json({ ok: true });
  } catch (error) {
    return handleAuthError(error, res);
  }
});

export default router;

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(1).optional(),
  FLW_CLIENT_ID: z.string().min(1).optional(),
  FLW_CLIENT_SECRET: z.string().min(1).optional(),
  FLW_ENCRYPTION_KEY: z.string().min(1).optional(),
  FLW_SECRET_HASH: z.string().min(1).optional(),
  FLW_REDIRECT_URL: z.string().url().optional(),
  FLW_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  WEBHOOK_WORKER_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  WEBHOOK_RETRY_INTERVAL_MS: z.coerce.number().int().positive().default(60000),
});

const requiredInProduction = [
  "FRONTEND_URL",
  "DATABASE_URL",
  "JWT_SECRET",
  "FLW_CLIENT_ID",
  "FLW_CLIENT_SECRET",
  "FLW_ENCRYPTION_KEY",
  "FLW_SECRET_HASH",
  "GEMINI_API_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "EMAIL_FROM",
] as const;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const names = parsed.error.issues.map((issue) => issue.path.join("."));
  throw new Error(`Invalid environment configuration: ${names.join(", ")}`);
}

const env = parsed.data;

if (env.NODE_ENV === "production") {
  const missing = requiredInProduction.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment configuration: ${missing.join(", ")}`
    );
  }
}

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  frontendUrl: env.FRONTEND_URL ?? "http://localhost:5173",
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  flutterwave: {
    clientId: env.FLW_CLIENT_ID,
    clientSecret: env.FLW_CLIENT_SECRET,
    encryptionKey: env.FLW_ENCRYPTION_KEY,
    secretHash: env.FLW_SECRET_HASH,
    redirectUrl: env.FLW_REDIRECT_URL,
    environment: env.FLW_ENVIRONMENT,
  },
  geminiApiKey: env.GEMINI_API_KEY,
  email: {
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT ?? 587,
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
  },
  webhookWorker: {
    enabled: env.WEBHOOK_WORKER_ENABLED,
    retryIntervalMs: env.WEBHOOK_RETRY_INTERVAL_MS,
  },
} as const;

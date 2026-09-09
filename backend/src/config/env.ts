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
  FLW_SECRET_KEY: z.string().min(1).optional(),
  FLW_SECRET_HASH: z.string().min(1).optional(),
  FLW_REDIRECT_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
});

const requiredInProduction = [
  "FRONTEND_URL",
  "DATABASE_URL",
  "JWT_SECRET",
  "FLW_SECRET_KEY",
  "FLW_SECRET_HASH",
  "GEMINI_API_KEY",
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
    secretKey: env.FLW_SECRET_KEY,
    secretHash: env.FLW_SECRET_HASH,
    redirectUrl: env.FLW_REDIRECT_URL,
  },
  geminiApiKey: env.GEMINI_API_KEY,
} as const;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config/env";
import authRoute from "./routes/auth";
import healthRoute from "./routes/health";
import plansRoute from "./routes/plans";
import accountRoute from "./routes/account";
import adminRoute from "./routes/admin";
import suggestRoute from "./routes/suggest";
import scriptHookRoute from "./routes/scriptHook";
import paymentRoute from "./routes/payment";
import { errorHandler, notFoundHandler } from "./middleware/errors";
import { requestId } from "./middleware/requestId";
import { sameOriginGuard } from "./middleware/sameOrigin";
import { optionalAuth } from "./utils/authMiddleware";

const app = express();

app.set("trust proxy", 1);
app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
morgan.token("request-id", (_req, res) =>
  String((res as express.Response).locals.requestId ?? "-")
);
app.use(
  morgan(
    config.nodeEnv === "production"
      ? ":method :url :status :res[content-length] - :response-time ms :request-id"
      : "dev"
  )
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(cookieParser());
app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, buffer) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
    },
  })
);
app.use(sameOriginGuard);

app.use(optionalAuth);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", healthRoute);
app.use("/api", authRoute);
app.use("/api", plansRoute);
app.use("/api", accountRoute);
app.use("/api", adminRoute);
app.use("/api", suggestRoute);
app.use("/api", scriptHookRoute);
app.use("/api", paymentRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

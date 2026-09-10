import app from "./app";
import { config } from "./config/env";
import {
  getFlutterwaveAccessToken,
  hasFlutterwaveConfig,
} from "./services/payments";
import { startWebhookRetryWorker } from "./workers/webhookRetryWorker";

function configured(value: unknown): "yes" | "no" {
  return value ? "yes" : "no";
}

app.listen(config.port, () => {
  console.log(`AskLoom backend running on port ${config.port}`);
  console.log(
    [
      `Startup readiness: env=${config.nodeEnv}`,
      `database=${configured(config.databaseUrl)}`,
      `flutterwave=${configured(
        config.flutterwave.clientId &&
          config.flutterwave.clientSecret &&
          config.flutterwave.secretHash
      )}`,
      `gemini=${configured(config.geminiApiKey)}`,
      `smtp=${configured(config.email.smtpHost && config.email.from)}`,
      `webhookWorker=${config.webhookWorker.enabled ? "on" : "off"}`,
    ].join(" ")
  );

  startWebhookRetryWorker();

  if (hasFlutterwaveConfig()) {
    void getFlutterwaveAccessToken()
      .then(() => {
        console.log(
          `Flutterwave v4 OAuth connected (${config.flutterwave.environment})`
        );
      })
      .catch(() => {
        console.error(
          `Flutterwave v4 OAuth connection failed (${config.flutterwave.environment})`
        );
      });
  } else {
    console.warn("Flutterwave v4 OAuth credentials are not configured");
  }
});

import app from "./app";
import { config } from "./config/env";
import {
  getFlutterwaveAccessToken,
  hasFlutterwaveConfig,
} from "./services/payments";
import { startWebhookRetryWorker } from "./workers/webhookRetryWorker";

app.listen(config.port, () => {
  console.log(`AskLoom backend running on port ${config.port}`);
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

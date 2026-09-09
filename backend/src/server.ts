import app from "./app";
import { config } from "./config/env";
import { startWebhookRetryWorker } from "./workers/webhookRetryWorker";

app.listen(config.port, () => {
  console.log(`AskLoom backend running on port ${config.port}`);
  startWebhookRetryWorker();
});

import { config } from "../config/env";
import { retryPendingWebhookEvents } from "../services/payments";

let running = false;
let timer: NodeJS.Timeout | null = null;

export function startWebhookRetryWorker() {
  if (!config.webhookWorker.enabled || timer) return;

  timer = setInterval(async () => {
    if (running) return;
    running = true;

    try {
      const result = await retryPendingWebhookEvents();
      if (result.attempted > 0) {
        console.info(
          JSON.stringify({
            level: "info",
            message: "Webhook retry pass completed",
            ...result,
          })
        );
      }
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Webhook retry pass failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      running = false;
    }
  }, config.webhookWorker.retryIntervalMs);

  timer.unref();
}

export function stopWebhookRetryWorker() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  running = false;
}

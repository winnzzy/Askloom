import crypto from "crypto";
import { describe, expect, it } from "vitest";
import { providerEventIdFor } from "../services/payments";
import { isValidFlutterwaveWebhookSignature } from "../utils/flutterwaveWebhook";

describe("Flutterwave v4 webhook security", () => {
  const secret = "test-webhook-secret";
  const rawBody = Buffer.from(
    JSON.stringify({
      id: "evt_123",
      type: "charge.completed",
      data: { id: "chg_123", reference: "askloom-creator-123" },
    })
  );

  it("accepts the correct HMAC-SHA256 base64 signature", () => {
    const signature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");

    expect(
      isValidFlutterwaveWebhookSignature(rawBody, signature, secret)
    ).toBe(true);
  });

  it("rejects a modified or incorrect signature", () => {
    const signature = crypto
      .createHmac("sha256", "wrong-secret")
      .update(rawBody)
      .digest("base64");

    expect(
      isValidFlutterwaveWebhookSignature(rawBody, signature, secret)
    ).toBe(false);
  });
});

describe("Flutterwave v4 webhook idempotency keys", () => {
  it("uses the provider event id when Flutterwave supplies one", () => {
    expect(providerEventIdFor({ id: "evt_123" })).toBe("evt_123");
  });

  it("falls back to charge id and event type", () => {
    expect(
      providerEventIdFor({
        type: "charge.completed",
        data: { id: "chg_123" },
      })
    ).toBe("charge:chg_123:charge.completed");
  });

  it("falls back to reference and event type when charge id is unavailable", () => {
    expect(
      providerEventIdFor({
        type: "charge.completed",
        data: { reference: "askloom-creator-123" },
      })
    ).toBe("reference:askloom-creator-123:charge.completed");
  });
});

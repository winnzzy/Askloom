import crypto from "crypto";

export function isValidFlutterwaveWebhookSignature(
  rawBody: Buffer,
  signature: string,
  secretHash: string
): boolean {
  const digest = crypto
    .createHmac("sha256", secretHash)
    .update(rawBody)
    .digest("base64");

  const expected = Buffer.from(digest);
  const provided = Buffer.from(signature);

  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
}

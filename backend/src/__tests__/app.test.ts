import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app";

describe("app", () => {
  it("responds to the root health check", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it("returns JSON for missing routes", async () => {
    const response = await request(app).get("/missing-route");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Route not found: GET /missing-route");
  });
});

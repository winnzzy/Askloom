import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { config } from "../config/env";
import { JWT_AUDIENCE, JWT_ISSUER, optionalAuth, requireAuth } from "../utils/authMiddleware";

function mockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as any;
}

describe("auth middleware", () => {
  it("attaches users from valid access tokens", () => {
    const req = { headers: {} } as any;
    req.headers.authorization = `Bearer ${jwt.sign(
      { id: "user-1", email: "user@example.com" },
      config.jwtSecret!,
      { issuer: JWT_ISSUER, audience: JWT_AUDIENCE, algorithm: "HS256" }
    )}`;
    const next = vi.fn();

    optionalAuth(req, mockResponse(), next);

    expect(req.user).toEqual({ id: "user-1", email: "user@example.com" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("ignores tokens with the wrong audience", () => {
    const req = { headers: {} } as any;
    req.headers.authorization = `Bearer ${jwt.sign(
      { id: "user-1", email: "user@example.com" },
      config.jwtSecret!,
      { issuer: JWT_ISSUER, audience: "someone-else", algorithm: "HS256" }
    )}`;
    const next = vi.fn();

    optionalAuth(req, mockResponse(), next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });

  it("blocks protected routes without req.user", () => {
    const req = {} as any;
    const res = mockResponse();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    expect(next).not.toHaveBeenCalled();
  });
});

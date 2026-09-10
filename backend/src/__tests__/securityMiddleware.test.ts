import { describe, expect, it, vi } from "vitest";
import { requestId } from "../middleware/requestId";
import { sameOriginGuard } from "../middleware/sameOrigin";

function mockResponse() {
  const res = {
    locals: {},
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as any;
}

describe("requestId middleware", () => {
  it("uses an incoming request id when present", () => {
    const req = { headers: { "x-request-id": "req-123" } } as any;
    const res = mockResponse();
    const next = vi.fn();

    requestId(req, res, next);

    expect(res.locals.requestId).toBe("req-123");
    expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", "req-123");
    expect(next).toHaveBeenCalledOnce();
  });

  it("generates a request id when none is present", () => {
    const req = { headers: {} } as any;
    const res = mockResponse();
    const next = vi.fn();

    requestId(req, res, next);

    expect(res.locals.requestId).toEqual(expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", res.locals.requestId);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("sameOriginGuard", () => {
  it("blocks unsafe browser requests from unknown origins", () => {
    const req = {
      method: "POST",
      path: "/api/auth/logout",
      headers: { origin: "https://bad.example" },
    } as any;
    const res = mockResponse();
    const next = vi.fn();

    sameOriginGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid request origin" });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows server-to-server webhook requests without an origin", () => {
    const req = { method: "POST", path: "/api/payment/webhook", headers: {} } as any;
    const res = mockResponse();
    const next = vi.fn();

    sameOriginGuard(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});

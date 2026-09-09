import { BillingInterval } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { addBillingInterval } from "../services/subscription";

describe("addBillingInterval", () => {
  const start = new Date("2026-01-15T12:30:00.000Z");

  it("adds day, week, month, and year intervals in UTC", () => {
    expect(addBillingInterval(start, BillingInterval.DAY)?.toISOString()).toBe(
      "2026-01-16T12:30:00.000Z"
    );
    expect(addBillingInterval(start, BillingInterval.WEEK)?.toISOString()).toBe(
      "2026-01-22T12:30:00.000Z"
    );
    expect(addBillingInterval(start, BillingInterval.MONTH)?.toISOString()).toBe(
      "2026-02-15T12:30:00.000Z"
    );
    expect(addBillingInterval(start, BillingInterval.YEAR)?.toISOString()).toBe(
      "2027-01-15T12:30:00.000Z"
    );
  });

  it("returns null for lifetime plans", () => {
    expect(addBillingInterval(start, BillingInterval.LIFETIME)).toBeNull();
  });
});

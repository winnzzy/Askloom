import { BillingInterval, SubscriptionStatus } from "@prisma/client";
import prisma from "../lib/prisma";

export async function getActivePlanForUser(userId: string) {
  const subscription = await getActiveSubscriptionForUser(userId);
  return subscription?.plan ?? null;
}

export async function getActiveSubscriptionForUser(userId: string) {
  const now = new Date();

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return subscription ?? null;
}

export async function isUserPaid(userId: string): Promise<boolean> {
  const plan = await getActivePlanForUser(userId);
  return plan !== null;
}

export function addBillingInterval(
  start: Date,
  interval: BillingInterval
): Date | null {
  const end = new Date(start);

  switch (interval) {
    case BillingInterval.DAY:
      end.setUTCDate(end.getUTCDate() + 1);
      return end;
    case BillingInterval.WEEK:
      end.setUTCDate(end.getUTCDate() + 7);
      return end;
    case BillingInterval.MONTH:
      end.setUTCMonth(end.getUTCMonth() + 1);
      return end;
    case BillingInterval.YEAR:
      end.setUTCFullYear(end.getUTCFullYear() + 1);
      return end;
    case BillingInterval.LIFETIME:
      return null;
    default:
      return null;
  }
}

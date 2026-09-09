import { UsageSubjectType } from "@prisma/client";
import prisma from "../lib/prisma";

type UsageField = "searchCount" | "scriptHookCount";

interface UsageParams {
  userId?: string;
  anonymousKey?: string;
  field: UsageField;
  limit: number | null;
}

function utcDateOnly(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export async function checkAndIncrementUsage({
  userId,
  anonymousKey,
  field,
  limit,
}: UsageParams): Promise<boolean> {
  if (limit === null) return true;

  const subjectType = userId ? UsageSubjectType.USER : UsageSubjectType.ANONYMOUS;
  const subjectKey = userId ?? anonymousKey;

  if (!subjectKey) {
    throw new Error("Usage tracking requires a userId or anonymousKey");
  }

  const usageDate = utcDateOnly();
  const where = {
    subjectType_subjectKey_usageDate: {
      subjectType,
      subjectKey,
      usageDate,
    },
  };

  return prisma.$transaction(async (tx) => {
    await tx.usageCounter.upsert({
      where,
      create: {
        subjectType,
        subjectKey,
        usageDate,
        userId: userId ?? null,
        anonymousKey: userId ? null : subjectKey,
      },
      update: {},
    });

    const countFilter =
      field === "searchCount"
        ? { searchCount: { lt: limit } }
        : { scriptHookCount: { lt: limit } };
    const incrementData =
      field === "searchCount"
        ? { searchCount: { increment: 1 } }
        : { scriptHookCount: { increment: 1 } };

    const updated = await tx.usageCounter.updateMany({
      where: {
        subjectType,
        subjectKey,
        usageDate,
        ...countFilter,
      },
      data: incrementData,
    });

    return updated.count === 1;
  });
}

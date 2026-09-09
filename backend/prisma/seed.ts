import { BillingInterval, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { code: "creator" },
    update: {
      name: "Creator",
      price: "7.00",
      currency: "USD",
      billingInterval: BillingInterval.MONTH,
      dailySearchLimit: null,
      scriptHookLimit: null,
      isActive: true,
    },
    create: {
      code: "creator",
      name: "Creator",
      price: "7.00",
      currency: "USD",
      billingInterval: BillingInterval.MONTH,
      dailySearchLimit: null,
      scriptHookLimit: null,
      isActive: true,
    },
  });

  await prisma.plan.upsert({
    where: { code: "agency" },
    update: {
      name: "Agency",
      price: "29.00",
      currency: "USD",
      billingInterval: BillingInterval.MONTH,
      dailySearchLimit: null,
      scriptHookLimit: null,
      isActive: true,
    },
    create: {
      code: "agency",
      name: "Agency",
      price: "29.00",
      currency: "USD",
      billingInterval: BillingInterval.MONTH,
      dailySearchLimit: null,
      scriptHookLimit: null,
      isActive: true,
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { UserRole } from "@prisma/client";
import prisma from "../src/lib/prisma";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error("Usage: npm run admin:promote -- user@example.com");
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: UserRole.ADMIN },
    select: { id: true, email: true, role: true },
  });

  console.log(`Promoted ${user.email} (${user.id}) to ${user.role}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

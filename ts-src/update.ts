import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const refreshTokenUpdate = await prisma.account.update({
    where: { id: "cm6qb3k9d0002z33578bv12ef" },
    data: {
      refresh_token:
        "1//0eELLtQpq7cqHCgYIARAAGA4SNwF-L9Iraz1-WH_z3mcKztfpRZzp7LZjlJMyjtccJxXtqaSsHqIVr6_JKFqtxAIKqQL-TuD6bLw",
    },
  });
  console.log(refreshTokenUpdate);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

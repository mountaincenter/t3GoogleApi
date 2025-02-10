import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.post.create({
    data: {
      name: "テストポスト",
      createdBy: { connect: { id: "cm6shkobm0007liqxz2s2q6sl" } },
    },
  });

  const allPosts = await prisma.post.findMany();
  console.log(allPosts, { depth: null });
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

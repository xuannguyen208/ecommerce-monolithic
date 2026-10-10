require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const normalRole = await prisma.role.upsert({
    where: { name: "normal" },
    update: {},
    create: { name: "normal" }
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" }
  });

  console.log("Tao Role thanh cong!");

  console.log("Normal:", normalRole);
  console.log("Admin:", adminRole);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
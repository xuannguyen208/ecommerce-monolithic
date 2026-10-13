require("dotenv").config();

const prisma = require("../src/config/prisma");

async function main() {
  await prisma.$transaction(async (tx) => {
    const normalRole = await tx.role.upsert({
      where: { rolename: "normal" },
      update: {},
      create: { rolename: "normal" }
    });

    const adminRole = await tx.role.upsert({
      where: { rolename: "admin" },
      update: {},
      create: { rolename: "admin" }
    });

    let membership = await tx.memberShip.findFirst({
      where: {
        mname: "normal",
        score: 10
      }
    });

    if (!membership) {
      membership = await tx.memberShip.create({
        data: {
          mname: "normal",
          score: 10
        }
      });
    }

    console.log("Role normal:", normalRole);
    console.log("Role admin:", adminRole);
    console.log("MemberShip mac dinh:", membership);
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
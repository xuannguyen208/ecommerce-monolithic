
require("dotenv").config();

const prisma = require("../src/config/prisma");
const bcrypt = require("bcryptjs");

async function main() {
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" }
  });

  if (!adminRole) {
    throw new Error("Chua co role admin. Hay chay seed.js");
  }

  // Kiem tra tai khoan admin da ton tai chua
  const existing = await prisma.user.findUnique({
    where: { username: "admin" }
  });

  // Neu da ton tai thi khong doi mat khau
  if (existing) {
    console.log("Tai khoan admin da ton tai. Khong thay doi mat khau.");
    return;
  }

  // Chi can mat khau khoi tao khi tao admin moi
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error(
      "Hay dat ADMIN_INITIAL_PASSWORD it nhat 12 ky tu trong .env"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      roleId: adminRole.id,
      membership: {
        create: { score: 10 }
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: {
        select: { name: true }
      }
    }
  });

  console.log("Tao tai khoan admin thanh cong:");
  console.log(admin);
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

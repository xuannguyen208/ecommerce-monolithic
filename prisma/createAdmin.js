require("dotenv").config();

const prisma = require("../src/config/prisma");
const bcrypt = require("bcryptjs");

async function main() {
  const existing = await prisma.user.findUnique({
    where: { username: "admin" },
    include: { role: true }
  });

  if (existing) {
    if (existing.role.rolename !== "admin") {
      throw new Error(
        "Username admin da ton tai nhung khong co quyen admin"
      );
    }

    console.log("Tai khoan admin da ton tai. Giu nguyen mat khau.");
    return;
  }

  const adminRole = await prisma.role.findUnique({
    where: { rolename: "admin" }
  });

  const membership = await prisma.memberShip.findFirst({
    where: {
      mname: "normal",
      score: 10
    },
    orderBy: { mid: "asc" }
  });

  if (!adminRole || !membership) {
    throw new Error(
      "Chua co role hoac membership mac dinh. Hay chay seed truoc"
    );
  }

  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error(
      "ADMIN_INITIAL_PASSWORD trong .env phai co it nhat 12 ky tu"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      fullname: "Quan tri vien",
      password: hashedPassword,
      roleid: adminRole.roleid,
      mid: membership.mid
    },
    select: {
      uid: true,
      username: true,
      fullname: true,
      role: {
        select: { rolename: true }
      },
      membership: {
        select: {
          mname: true,
          score: true
        }
      }
    }
  });

  console.log("Tao tai khoan admin thanh cong:");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
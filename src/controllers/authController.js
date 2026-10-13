const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng ký: role normal, membership có score 10
const register = async (req, res) => {
  try {
    const { username, fullname, password } = req.body || {};

    if (
      typeof username !== "string" ||
      !username.trim() ||
      username.trim().length > 50 ||
      typeof fullname !== "string" ||
      !fullname.trim() ||
      fullname.trim().length > 100 ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Username tu 1-50 ky tu, fullname tu 1-100 ky tu, password it nhat 8 ky tu"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username da ton tai"
      });
    }

    const normalRole = await prisma.role.findUnique({
      where: { rolename: "normal" }
    });

    const membership = await prisma.memberShip.findFirst({
      where: {
        mname: "normal",
        score: 10
      },
      orderBy: { mid: "asc" }
    });

    if (!normalRole || !membership) {
      return res.status(500).json({
        message: "Chua co role hoac membership mac dinh. Hay chay seed"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        fullname: fullname.trim(),
        password: hashedPassword,
        roleid: normalRole.roleid,
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

    return res.status(201).json({
      message: "Dang ky thanh cong",
      user
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Username da ton tai"
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      message: "Loi he thong"
    });
  }
};

// Đăng nhập và trả JWT
const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Vui long nhap username va password"
      });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
      include: {
        role: true,
        membership: true
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "Sai tai khoan hoac mat khau"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Sai tai khoan hoac mat khau"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Chua cau hinh JWT_SECRET"
      });
    }

    const token = jwt.sign(
      {
        userId: user.uid,
        role: user.role.rolename
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        algorithm: "HS256"
      }
    );

    return res.status(200).json({
      message: "Dang nhap thanh cong",
      token,
      user: {
        uid: user.uid,
        username: user.username,
        fullname: user.fullname,
        role: user.role.rolename,
        membership: user.membership.mname,
        score: user.membership.score
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Loi he thong"
    });
  }
};

module.exports = { register, login };
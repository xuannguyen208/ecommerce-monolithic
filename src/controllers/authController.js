const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// API đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    // Kiểm tra dữ liệu đầu vào
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Username, email khong duoc rong va password phai co it nhat 8 ky tu"
      });
    }

    // Kiểm tra tài khoản đã tồn tại
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: email.trim().toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username hoac email da ton tai"
      });
    }

    // Lấy quyền normal
    const normalRole = await prisma.role.findUnique({
      where: { name: "normal" }
    });

    if (!normalRole) {
      return res.status(500).json({
        message: "Chua co role normal. Hay chay seed.js"
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo tài khoản và membership trong một transaction
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        roleId: normalRole.id,
        membership: {
          create: {
            score: 10
          }
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        role: {
          select: { name: true }
        },
        membership: {
          select: { score: true }
        }
      }
    });

    return res.status(201).json({
      message: "Dang ky tai khoan thanh cong",
      user: newUser
    });

  } catch (error) {
    console.error("Register error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Username hoac email da ton tai"
      });
    }

    return res.status(500).json({
      message: "Loi he thong"
    });
  }
};

// API đăng nhập tài khoản
const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Vui long nhap username va password"
      });
    }

    // Tìm người dùng
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

    // Kiểm tra mật khẩu đã mã hóa
    const isValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValid) {
      return res.status(401).json({
        message: "Sai tai khoan hoac mat khau"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Chua cau hinh JWT_SECRET"
      });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name
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
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        score: user.membership?.score ?? null
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
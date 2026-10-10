const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    // Lấy token từ Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Chua cung cap JWT token"
      });
    }

    const token = authHeader.split(" ")[1];

    // Kiểm tra token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // Lưu thông tin người dùng vào request
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    next();

  } catch (error) {
    return res.status(401).json({
      message: "JWT token khong hop le hoac da het han"
    });
  }
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Chi admin moi co quyen thuc hien"
    });
  }

  next();
};

module.exports = {
  authenticate,
  requireAdmin
};
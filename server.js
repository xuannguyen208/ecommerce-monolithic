require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./src/config/prisma");

const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const shipmentRoutes = require("./src/routes/shipmentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Trang chủ
app.get("/", (req, res) => {
  res.json({
    message: "Ecommerce Monolithic API is running"
  });
});

// Health Check: Node.js + PostgreSQL
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "OK",
      server: "UP",
      database: "CONNECTED",
      message: "System is healthy"
    });

  } catch (error) {
    console.error("Health check error:", error);

    return res.status(503).json({
      status: "ERROR",
      server: "UP",
      database: "DISCONNECTED",
      message: "Database connection failed"
    });
  }
});

// RESTful API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipments", shipmentRoutes);

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
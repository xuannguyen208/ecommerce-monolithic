const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById
} = require("../controllers/orderController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Tất cả API đơn hàng đều yêu cầu JWT
router.use(authenticate);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

module.exports = router;
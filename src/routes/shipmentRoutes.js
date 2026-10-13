const express = require("express");

const {
  getShipment,
  updateShipment
} = require("../controllers/shipmentController");

const {
  authenticate,
  requireAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

// Xem Shipment theo mã đơn hàng
router.get("/:orderId", getShipment);

// Cập nhật theo mã Shipment, chỉ dành cho admin
router.put("/:shipid", requireAdmin, updateShipment);

module.exports = router;
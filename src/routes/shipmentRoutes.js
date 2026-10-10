const express = require("express");

const {
  getShipment,
  updateShipment
} = require("../controllers/shipmentController");

const {
  authenticate
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/:orderId", getShipment);
router.put("/:orderId", updateShipment);

module.exports = router;
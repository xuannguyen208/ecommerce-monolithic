const prisma = require("../config/prisma");

const validId = (value) =>
  Number.isInteger(value) &&
  value > 0 &&
  value <= 2147483647;

// Xem các Shipment của một đơn hàng thuộc người đăng nhập
const getShipment = async (req, res) => {
  try {
    const oid = Number(req.params.orderId);

    if (!validId(oid)) {
      return res.status(400).json({
        message: "ID don hang khong hop le"
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        oid,
        uid: req.user.id
      },
      select: {
        oid: true,
        createat: true,
        shipments: {
          orderBy: { shipid: "asc" }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Khong tim thay don hang"
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get shipment error:", error);

    return res.status(500).json({
      message: "Loi lay thong tin giao hang"
    });
  }
};

// Admin cập nhật một Shipment cụ thể
const updateShipment = async (req, res) => {
  try {
    const shipid = Number(req.params.shipid);
    const { status } = req.body || {};

    if (!validId(shipid)) {
      return res.status(400).json({
        message: "ID shipment khong hop le"
      });
    }

    const allowedStatuses = [
      "PENDING",
      "SHIPPING",
      "DELIVERED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status phai la PENDING, SHIPPING hoac DELIVERED"
      });
    }

    const shipment = await prisma.shipment.update({
      where: { shipid },
      data: { status }
    });

    return res.status(200).json({
      message: "Cap nhat giao hang thanh cong",
      shipment
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Khong tim thay shipment"
      });
    }

    console.error("Update shipment error:", error);

    return res.status(500).json({
      message: "Loi cap nhat giao hang"
    });
  }
};

module.exports = {
  getShipment,
  updateShipment
};
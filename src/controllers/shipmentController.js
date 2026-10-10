const prisma = require("../config/prisma");

// Xem thông tin giao hàng của đơn hàng
const getShipment = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Order ID khong hop le"
      });
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        orderId,
        order: {
          userId: req.user.id
        }
      },
      include: {
        order: true
      }
    });

    if (!shipment) {
      return res.status(404).json({
        message: "Khong tim thay thong tin giao hang"
      });
    }

    return res.status(200).json(shipment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi lay thong tin giao hang"
    });
  }
};

// Cập nhật trạng thái giao hàng - chỉ admin
const updateShipment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Chi admin duoc cap nhat giao hang"
      });
    }

    const orderId = Number(req.params.orderId);
    const { status } = req.body || {};

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Order ID khong hop le"
      });
    }

    const allowedStatuses = [
      "PENDING",
      "SHIPPING",
      "DELIVERED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Trang thai giao hang khong hop le"
      });
    }

    const shipment = await prisma.shipment.update({
      where: { orderId },
      data: {
        status,
        shipmentDate: status === "DELIVERED"
          ? new Date()
          : null
      }
    });

    return res.status(200).json({
      message: "Cap nhat giao hang thanh cong",
      shipment
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Khong tim thay thong tin giao hang"
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Loi cap nhat giao hang"
    });
  }
};

module.exports = {
  getShipment,
  updateShipment
};
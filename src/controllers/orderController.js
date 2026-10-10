const prisma = require("../config/prisma");
const { Prisma } = require("@prisma/client");

// Tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const { items } = req.body || {};

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.some(
        item =>
          !Number.isInteger(item.productId) ||
          item.productId <= 0 ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      return res.status(400).json({
        message: "Danh sach san pham khong hop le"
      });
    }

    // Không cho phép trùng sản phẩm trong cùng một đơn
    const productIds = items.map(item => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({
        message: "San pham bi trung trong don hang"
      });
    }

    const order = await prisma.$transaction(
      async (tx) => {
        const details = [];
        let total = new Prisma.Decimal(0);

        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            throw new Error(
              `Khong tim thay san pham ${item.productId}`
            );
          }

          // Trừ kho có điều kiện để tránh bán vượt tồn
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              quantity: { gte: item.quantity }
            },
            data: {
              quantity: { decrement: item.quantity }
            }
          });

          if (updated.count !== 1) {
            throw new Error(
              `San pham ${product.name} khong du ton kho`
            );
          }

          const unitPrice = product.price;

          total = total.plus(
            unitPrice.mul(item.quantity)
          );

          details.push({
            productId: product.id,
            quantity: item.quantity,
            price: unitPrice
          });
        }

        return tx.order.create({
          data: {
            userId: req.user.id,
            total,
            status: "PENDING",
            orderDetails: {
              create: details
            },
            shipment: {
              create: {
                status: "PENDING"
              }
            }
          },
          include: {
            orderDetails: {
              include: { product: true }
            },
            shipment: true
          }
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000
      }
    );

    return res.status(201).json({
      message: "Dat hang thanh cong",
      order
    });

  } catch (error) {
    console.error("Create order error:", error.message);

    if (error.code === "P2034") {
      return res.status(409).json({
        message: "He thong dang xu ly don hang khac, vui long thu lai"
      });
    }

    if (
      error.message.startsWith("Khong tim thay san pham") ||
      error.message.includes("khong du ton kho")
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Loi tao don hang"
    });
  }
};

// Xem các đơn hàng của người đăng nhập
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderDetails: {
          include: { product: true }
        },
        shipment: true
      },
      orderBy: { orderDate: "desc" }
    });

    return res.status(200).json(orders);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi lay danh sach don hang"
    });
  }
};

// Xem chi tiết một đơn hàng
const getOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID don hang khong hop le"
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        orderDetails: {
          include: { product: true }
        },
        shipment: true
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Khong tim thay don hang"
      });
    }

    return res.status(200).json(order);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi lay chi tiet don hang"
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
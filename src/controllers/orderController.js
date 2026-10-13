const prisma = require("../config/prisma");
const { Prisma } = require("@prisma/client");

const validPositiveInt = (value) =>
  Number.isInteger(value) &&
  value > 0 &&
  value <= 2147483647;

const orderInclude = {
  orderDetails: {
    include: { product: true }
  },
  shipments: true
};

// Tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const { items } = req.body || {};

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.some(
        (item) =>
          !item ||
          !validPositiveInt(item.pid) ||
          !validPositiveInt(item.qty)
      )
    ) {
      return res.status(400).json({
        message: "Items phai co san pham voi pid va qty la so nguyen duong"
      });
    }

    const productIds = items.map((item) => item.pid);

    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({
        message: "San pham bi trung trong don hang"
      });
    }

    // Sắp xếp để các đơn cùng xử lý sản phẩm theo một thứ tự
    const sortedItems = [...items].sort((a, b) => a.pid - b.pid);

    const order = await prisma.$transaction(
      async (tx) => {
        const details = [];

        for (const item of sortedItems) {
          const product = await tx.product.findUnique({
            where: { pid: item.pid }
          });

          if (!product) {
            const error = new Error(
              `Khong tim thay san pham ${item.pid}`
            );
            error.statusCode = 400;
            throw error;
          }

          // Chỉ trừ kho khi còn đủ số lượng
          const updated = await tx.product.updateMany({
            where: {
              pid: item.pid,
              quantity: { gte: item.qty }
            },
            data: {
              quantity: { decrement: item.qty }
            }
          });

          if (updated.count !== 1) {
            const error = new Error(
              `San pham ${product.pname} khong du ton kho`
            );
            error.statusCode = 400;
            throw error;
          }

          details.push({
            pid: product.pid,
            qty: item.qty,
            unit_price: product.price
          });
        }

        // createat tự lấy thời gian hiện tại theo schema
        return tx.order.create({
          data: {
            uid: req.user.id,
            orderDetails: {
              create: details
            },
            shipments: {
              create: {
                status: "PENDING"
              }
            }
          },
          include: orderInclude
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
    console.error("Create order error:", error);

    if (error.statusCode === 400) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (error.code === "P2034") {
      return res.status(409).json({
        message: "Xung dot khi dat hang, vui long thu lai"
      });
    }

    return res.status(500).json({
      message: "Loi tao don hang"
    });
  }
};

// Xem danh sách đơn hàng của người đăng nhập
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { uid: req.user.id },
      include: orderInclude,
      orderBy: { createat: "desc" }
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi lay danh sach don hang"
    });
  }
};

// Xem chi tiết đơn hàng của người đăng nhập
const getOrderById = async (req, res) => {
  try {
    const oid = Number(req.params.id);

    if (!validPositiveInt(oid)) {
      return res.status(400).json({
        message: "ID don hang khong hop le"
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        oid,
        uid: req.user.id
      },
      include: orderInclude
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
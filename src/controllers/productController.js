const prisma = require("../config/prisma");

// Xem danh sách sản phẩm
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" }
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi lay san pham" });
  }
};

// Xem chi tiết sản phẩm
const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID khong hop le" });
    }

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        message: "Khong tim thay san pham"
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

// Thêm sản phẩm
const createProduct = async (req, res) => {
  try {
    const { name, price, quantity } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        message: "Thong tin san pham khong hop le"
      });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        quantity
      }
    });

    res.status(201).json({
      message: "Them san pham thanh cong",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi them san pham" });
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, quantity } = req.body || {};

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID khong hop le" });
    }

    if (
      (name !== undefined && (typeof name !== "string" || !name.trim())) ||
      (price !== undefined && (!Number.isFinite(price) || price <= 0)) ||
      (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0))
    ) {
      return res.status(400).json({
        message: "Du lieu cap nhat khong hop le"
      });
    }

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (price !== undefined) data.price = price;
    if (quantity !== undefined) data.quantity = quantity;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Chua co du lieu cap nhat"
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data
    });

    res.status(200).json({
      message: "Cap nhat san pham thanh cong",
      product
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Khong tim thay san pham"
      });
    }

    console.error(error);
    res.status(500).json({ message: "Loi cap nhat san pham" });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID khong hop le" });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.status(200).json({
      message: "Xoa san pham thanh cong"
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Khong tim thay san pham"
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        message: "San pham da co trong don hang, khong the xoa"
      });
    }

    console.error(error);
    res.status(500).json({ message: "Loi xoa san pham" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
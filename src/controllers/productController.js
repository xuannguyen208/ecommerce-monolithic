const prisma = require("../config/prisma");

const validId = (value) =>
  Number.isInteger(value) && value > 0 && value <= 2147483647;

const validName = (value) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= 100;

const validPrice = (value) =>
  Number.isFinite(value) &&
  value > 0 &&
  value <= 99999999.99;

const validQuantity = (value) =>
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 2147483647;

// Xem danh sách sản phẩm
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { pid: "asc" }
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi lay danh sach san pham"
    });
  }
};

// Xem chi tiết sản phẩm
const getProductById = async (req, res) => {
  try {
    const pid = Number(req.params.id);

    if (!validId(pid)) {
      return res.status(400).json({
        message: "ID san pham khong hop le"
      });
    }

    const product = await prisma.product.findUnique({
      where: { pid }
    });

    if (!product) {
      return res.status(404).json({
        message: "Khong tim thay san pham"
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi lay chi tiet san pham"
    });
  }
};

// Thêm sản phẩm
const createProduct = async (req, res) => {
  try {
    const { pname, price, quantity } = req.body || {};

    if (
      !validName(pname) ||
      !validPrice(price) ||
      !validQuantity(quantity)
    ) {
      return res.status(400).json({
        message:
          "Ten san pham tu 1-100 ky tu, gia phai duong va khong vuot 99999999.99, so luong la so nguyen khong am trong pham vi INT"
      });
    }

    const product = await prisma.product.create({
      data: {
        pname: pname.trim(),
        price,
        quantity
      }
    });

    return res.status(201).json({
      message: "Them san pham thanh cong",
      product
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi them san pham"
    });
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const pid = Number(req.params.id);
    const { pname, price, quantity } = req.body || {};

    if (!validId(pid)) {
      return res.status(400).json({
        message: "ID san pham khong hop le"
      });
    }

    if (
      (pname !== undefined && !validName(pname)) ||
      (price !== undefined && !validPrice(price)) ||
      (quantity !== undefined && !validQuantity(quantity))
    ) {
      return res.status(400).json({
        message: "Du lieu cap nhat khong hop le"
      });
    }

    const data = {};

    if (pname !== undefined) data.pname = pname.trim();
    if (price !== undefined) data.price = price;
    if (quantity !== undefined) data.quantity = quantity;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Chua co du lieu cap nhat"
      });
    }

    const product = await prisma.product.update({
      where: { pid },
      data
    });

    return res.status(200).json({
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
    return res.status(500).json({
      message: "Loi cap nhat san pham"
    });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const pid = Number(req.params.id);

    if (!validId(pid)) {
      return res.status(400).json({
        message: "ID san pham khong hop le"
      });
    }

    await prisma.product.delete({
      where: { pid }
    });

    return res.status(200).json({
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
    return res.status(500).json({
      message: "Loi xoa san pham"
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
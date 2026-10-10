const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const {
  authenticate,
  requireAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();

// Ai cũng có thể xem sản phẩm
router.get("/", getProducts);
router.get("/:id", getProductById);

// Chỉ admin được thêm, sửa, xóa
router.post("/", authenticate, requireAdmin, createProduct);
router.put("/:id", authenticate, requireAdmin, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

module.exports = router;
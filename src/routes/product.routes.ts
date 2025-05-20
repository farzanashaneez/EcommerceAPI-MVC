import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { asyncHandler } from "../utils/asyncHandler"; // Handles errors in async controllers

const router = express.Router();

// @route   POST /products
// @desc    Create a new product
router.post("/", asyncHandler(createProduct));

// @route   GET /products
// @desc    Get all products with filters, search, sort, and pagination
router.get("/", asyncHandler(getAllProducts));

// @route   GET /products/:id
// @desc    Get a product by ID
router.get("/:id", asyncHandler(getProductById));

// @route   PATCH /products/:id
// @desc    Update a product
router.patch("/:id", asyncHandler(updateProduct));

// @route   DELETE /products/:id
// @desc    Delete a product
router.delete("/:id", asyncHandler(deleteProduct));

export default router;

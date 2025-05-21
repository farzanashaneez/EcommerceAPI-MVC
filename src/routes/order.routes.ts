import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  returnSingleProduct,
} from "../controllers/order.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

// @route   POST /
// @desc    Create a new order
router.post("/", asyncHandler(createOrder));

// @route   GET /
// @desc    Get all orders (admin)
router.get("/", asyncHandler(getAllOrders));

// @route   GET /user/:userId
// @desc    Get all orders for a specific user
router.get("/user/:userId", asyncHandler(getUserOrders));

// @route   GET /:orderId
// @desc    Get order details by ID
router.get("/:orderId", asyncHandler(getOrderDetails));

// @route   PUT /:orderId/status
// @desc    Update the status of an order
router.put("/:orderId/status", asyncHandler(updateOrderStatus));

// @route   POST /:orderId/cancel
// @desc    Cancel an order
router.post("/:orderId/cancel", asyncHandler(cancelOrder));

// @route   POST /:orderId/return
// @desc    Return an order
router.post("/:orderId/return", asyncHandler(returnOrder));

// @route   POST /return-product
// @desc    Return a single product from an order
router.post("/return-product", asyncHandler(returnSingleProduct));

export default router;

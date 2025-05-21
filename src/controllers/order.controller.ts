import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import User from "../models/User";
import WalletTransaction from "../models/Wallet";
import httpStatus from "../utils/httpStatus";


export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, products } = req.body;

    let total = 0;
    let net = 0;

    products.forEach((item: any) => {
      total += item.price * item.quantity;
      net += (item.price - item.discount) * item.quantity;
    });

    const order = await Order.create({
      userId,
      products,
      totalAmount: total,
      netAmount: net,
    });

    res.status(httpStatus.OK).json(order);
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ userId });
    res.status(httpStatus.OK).json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.orderId);
    res.status(httpStatus.OK).json(order);
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find().populate("userId");
    res.status(httpStatus.OK).json(orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    res.status(httpStatus.OK).json(order);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || order.status !== "processing")
      return res.status(400).json({ message: "Cannot cancel this order" });

    order.status = "cancelled";
    await order.save();

    await WalletTransaction.create({
      userId: order.userId,
      type: "credit",
      amount: order.netAmount,
      reason: "Order cancelled refund",
    });

    await User.findByIdAndUpdate(order.userId, {
      $inc: { walletBalance: order.netAmount },
    });

    res.status(httpStatus.OK).json({ message: "Order cancelled and amount refunded to wallet" });
  } catch (err) {
    next(err);
  }
};

export const returnOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || order.status !== "delivered")
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Cannot return this order" });

    order.status = "returned";
    await order.save();

    await WalletTransaction.create({
      userId: order.userId,
      type: "credit",
      amount: order.netAmount,
      reason: "Product returned refund",
    });

    await User.findByIdAndUpdate(order.userId, {
      $inc: { walletBalance: order.netAmount },
    });

    res.status(httpStatus.OK).json({ message: "Order returned and amount credited to wallet" });
  } catch (err) {
    next(err);
  }
};

export const returnSingleProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, productId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const product = order.products.find(
      (p) => p.productId.toString() === productId && p.status === "ordered"
    );
    if (!product)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Product not found or already returned/cancelled" });

    product.status = "returned";
    product.cancelReason = reason || "No reason provided";

    const refundAmount = (product.price - product.discount) * product.quantity;

    order.netAmount -= refundAmount;
    await order.save();

    await WalletTransaction.create({
      userId: order.userId,
      type: "credit",
      amount: refundAmount,
      reason: `Returned product refund: ${reason || "N/A"}`,
    });

    await User.findByIdAndUpdate(order.userId, {
      $inc: { walletBalance: refundAmount },
    });

    res.status(httpStatus.OK).json({
      message: "Product returned and amount refunded to wallet",
      refundAmount,
    });
  } catch (err) {
    next(err);
  }
};

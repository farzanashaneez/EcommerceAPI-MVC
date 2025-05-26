import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order';
import User from '../models/User';
import WalletTransaction from '../models/Wallet';
import httpStatus from "../utils/httpStatus";
import dotenv from 'dotenv';
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion : '2023-10-16', // Or your preferred Stripe API version
});

// -----------------------------
// INITIATE PAYMENT
// -----------------------------
export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, paymentMethod } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(httpStatus.NOT_FOUND).json({ message: 'Order not found' });

    if (paymentMethod === 'wallet') {
      const user = await User.findById(order.userId);
      if (!user || user.walletBalance < order.netAmount)
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Insufficient wallet balance' });

      user.walletBalance -= order.netAmount;
      await user.save();

      await WalletTransaction.create({
        userId: order.userId,
        amount: order.netAmount,
        type: 'debit',
        reason: 'Order payment using wallet',
      });

      order.status = 'paid';
      order.paymentMethod = 'wallet';
      await order.save();

      return res.json({ message: 'Payment completed using wallet' });
    }

    if (paymentMethod === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: order.products.map((item) => ({
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round((item.price - item.discount) * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.DOMAIN}/payment-success?orderId=${order._id}`,
        cancel_url: `${process.env.DOMAIN}/payment-failure?orderId=${order._id}`,
      });

      return res.json({ url: session.url });
    }

    if (paymentMethod === 'cod') {
      order.paymentMethod = 'cod';
      order.status = 'processing';
      await order.save();
      return res.json({ message: 'Order placed with Cash on Delivery' });
    }

    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unsupported payment method' });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// VERIFY PAYMENT (Stripe Webhook)
// -----------------------------
export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const rawBody = (req as any).rawBody;

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret);
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST).send(`Webhook Error: ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = new URL(session.success_url!).searchParams.get('orderId');

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.status = 'paid';
          order.paymentMethod = 'stripe';
          order.stripePaymentIntentId = session.payment_intent?.toString();
          await order.save();
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// HANDLE REFUND
// -----------------------------
export const refundPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.status !== 'paid')
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Refund not possible' });

    if (order.paymentMethod === 'wallet') {
      await WalletTransaction.create({
        userId: order.userId,
        type: 'credit',
        amount: order.netAmount,
        reason: 'Refund for order',
      });

      await User.findByIdAndUpdate(order.userId, {
        $inc: { walletBalance: order.netAmount },
      });

      order.status = 'refunded';
      await order.save();

      return res.json({ message: 'Refunded to wallet' });
    }

    if (order.paymentMethod === 'stripe') {
      if (!order.stripePaymentIntentId) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Stripe payment intent ID not found' });
      }

      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });

      order.status = 'refunded';
      await order.save();

      return res.json({ message: 'Refunded via Stripe', refund });
    }

    res.status(httpStatus.BAD_REQUEST).json({ message: 'Refund method not supported for this order' });
  } catch (err) {
    next(err);
  }
};

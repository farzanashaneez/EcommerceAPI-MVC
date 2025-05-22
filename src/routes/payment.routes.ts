import express from 'express';
import { initiatePayment, handleStripeWebhook, refundPayment } from '../controllers/payment.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// @route   POST /payment/initiate
// @desc    Initiate payment using wallet, Stripe, or COD
router.post('/initiate', asyncHandler(initiatePayment));

// @route   POST /payment/webhook
// @desc    Handle Stripe webhook for payment success
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(handleStripeWebhook));

// @route   POST /payment/refund
// @desc    Refund a payment based on payment method
router.post('/refund', asyncHandler(refundPayment));

export default router;

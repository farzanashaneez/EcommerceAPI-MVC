import { Router } from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} from '../controllers/coupon.controller';

import { adminAuth, authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(asyncHandler(authenticate));


// Admin-only routes
router.post('/', asyncHandler(adminAuth as any), asyncHandler(createCoupon));              // Create coupon
router.get('/', asyncHandler(adminAuth as any), asyncHandler(getAllCoupons));              // Get all coupons
router.get('/:id', asyncHandler(adminAuth as any), asyncHandler(getCouponById));           // Get single coupon by ID
router.patch('/:id', asyncHandler(adminAuth as any), asyncHandler(updateCoupon));          // Update coupon
router.delete('/:id', asyncHandler(adminAuth as any), asyncHandler(deleteCoupon));         // Delete coupon

// Public or user-authenticated route
router.post('/validate', asyncHandler(authenticate), asyncHandler(validateCoupon));             // Validate coupon by code

export default router;

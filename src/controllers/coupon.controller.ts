import { Request, Response, NextFunction } from 'express';
import Coupon from '../models/Coupon';
import Order from '../models/Order';
import httpStatus from '../utils/httpStatus';

// @route   POST /coupons
// @desc    Create a new coupon (Admin Only)
export const createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { code, discountPercentage, validFrom, validTo, isActive } = req.body;

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({ code, discountPercentage, validFrom, validTo, isActive });
    await coupon.save();

    return res.status(httpStatus.CREATED).json({ message: 'Coupon created successfully', coupon });
  } catch (err) {
    next(err);
  }
};

// @route   GET /coupons
// @desc    Get all coupons (Admin Only)
export const getAllCoupons = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(httpStatus.OK).json({ coupons });
  } catch (err) {
    next(err);
  }
};

// @route   GET /coupons/:id
// @desc    Get a coupon by ID (Admin Only)
export const getCouponById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Coupon not found' });
    }

    return res.status(httpStatus.OK).json({ coupon });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /coupons/:id
// @desc    Update a coupon (Admin Only)
export const updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Coupon not found' });
    }

    return res.status(httpStatus.OK).json({ message: 'Coupon updated successfully', coupon });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /coupons/:id
// @desc    Delete a coupon (Admin Only)
export const deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Coupon not found' });
    }

    return res.status(httpStatus.OK).json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @route   get /coupons/:id
// @desc    validate coupon
export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      const userId = req.user?._id; // assuming JWT auth populates req.user
  
      const coupon = await Coupon.findOne({ code });
  
      if (!coupon) {
        return res.status(httpStatus.NOT_FOUND).json({ message: "Coupon not found" });
      }
  
      const now = new Date();
  
      if (coupon.expiresAt && coupon.expiresAt < now) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Coupon has expired" });
      }
  
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Coupon usage limit reached" });
      }
  
      // prevent same user from using the coupon again (if needed)
      const alreadyUsed = await Order.findOne({ user: userId, couponCode: code });
      if (alreadyUsed) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "You have already used this coupon" });
      }
  
      return res.status(httpStatus.OK).json({
        valid: true,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        message: "Coupon is valid",
      });
    } catch (err) {
      next(err);
    }
  };
  
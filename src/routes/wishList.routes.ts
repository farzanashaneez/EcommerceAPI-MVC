import express from 'express';
import {
  addToCart,
  removeFromCart,
  getCart,
  updateCartItemQuantity,
  clearCart
} from '../controllers/cart.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(asyncHandler(authenticate));

// @route   POST /cart/add
// @desc    Add an item to the user's cart
router.post('/add', asyncHandler(addToCart as any));

// @route   DELETE /cart/remove/:productId
// @desc    Remove a product from the user's cart by productId
router.delete('/remove/:productId', asyncHandler(removeFromCart as any));

// @route   GET /cart
// @desc    Get the current user's cart
router.get('/', asyncHandler(getCart as any));

// @route   PATCH /cart/update
// @desc    Update quantity of an item in the user's cart
router.patch('/update', asyncHandler(updateCartItemQuantity as any));

// @route   DELETE /cart/clear
// @desc    Clear all items from the user's cart
router.delete('/clear', asyncHandler(clearCart as any));

export default router;

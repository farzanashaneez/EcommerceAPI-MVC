import express from 'express';
import {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(asyncHandler(authenticate));

// Save a new address
router.post('/', asyncHandler(createAddress as any));

// Get addresses for a user
router.get('/:userId', asyncHandler(getUserAddresses as any));

// Update an address
router.put('/:addressId', asyncHandler(updateAddress as any));

// Delete an address
router.delete('/:addressId', asyncHandler(deleteAddress as any));

export default router;

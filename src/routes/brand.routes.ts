import express from 'express';
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from '../controllers/brand.controller';
import { asyncHandler } from "../utils/asyncHandler"; // Middleware to handle async errors

const router = express.Router();

// @route   POST /brands
// @desc    Create a new brand
router.post('/', asyncHandler(createBrand));

// @route   GET /brands
// @desc    Get all brands
router.get('/', asyncHandler(getBrands));

// @route   GET /brands/:id
// @desc    Get brand by ID
router.get('/:id', asyncHandler(getBrandById));

// @route   PATCH /brands/:id
// @desc    Update brand by ID
router.patch('/:id', asyncHandler(updateBrand));

// @route   DELETE /brands/:id
// @desc    Delete brand by ID
router.delete('/:id', asyncHandler(deleteBrand));

export default router;

import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { asyncHandler } from "../utils/asyncHandler"; // Middleware to handle async errors

const router = express.Router();

// @route   POST /
// @desc    Create a new category
router.post('/', asyncHandler(createCategory));

// @route   GET /
// @desc    Get all categories
router.get('/', asyncHandler(getCategories));

// @route   GET /:id
// @desc    Get category by ID
router.get('/:id', asyncHandler(getCategoryById));

// @route   PATCH /:id
// @desc    Update category by ID
router.patch('/:id', asyncHandler(updateCategory));

// @route   DELETE /:id
// @desc    Delete category by ID
router.delete('/:id', asyncHandler(deleteCategory));

export default router;

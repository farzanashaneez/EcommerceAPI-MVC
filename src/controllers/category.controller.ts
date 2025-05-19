import { Request, Response, NextFunction } from "express";
import Category from "../models/Category";  // your Category model path
import httpStatus from "../utils/httpStatus";

// @route   POST /categories
// @desc    Create a new category
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name, description } = req.body;

    // Check if category already exists by name (optional)
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Category already exists' });
    }

    const category = new Category({ name, description });
    await category.save();

    return res.status(httpStatus.CREATED).json({ message: 'Category created successfully', category });
  } catch (err) {
    next(err);
  }
};

// @route   GET /categories
// @desc    Get all categories
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const categories = await Category.find();
    return res.status(httpStatus.OK).json({ categories });
  } catch (err) {
    next(err);
  }
};

// @route   GET /categories/:id
// @desc    Get category by ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Category not found' });
    }

    return res.status(httpStatus.OK).json({ category });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /categories/:id
// @desc    Update category by ID
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Category not found' });
    }

    return res.status(httpStatus.OK).json({ message: 'Category updated successfully', category });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /categories/:id
// @desc    Delete category by ID
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Category not found' });
    }

    return res.status(httpStatus.OK).json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};


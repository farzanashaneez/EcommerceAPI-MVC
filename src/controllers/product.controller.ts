import { Request, Response, NextFunction } from "express";
import Product from "../models/Product";
import Category from "../models/Category";
import httpStatus from "../utils/httpStatus";

// @route   POST /products
// @desc    Create a new product
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const {
      name,
      brand,
      category,
      description,
      price,
      stock,
      images,
      offer,
      isFeatured
    } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid category ID' });
    }

    const product = new Product({
      name,
      brand,
      category,
      description,
      price,
      stock,
      images,
      offer,
      isFeatured
    });

    await product.save();
    return res.status(httpStatus.CREATED).json({ message: 'Product created successfully', product });
  } catch (err) {
    next(err);
  }
};

// @route   GET /products
// @desc    Get all products
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const products = await Product.find().populate("category", "name");
    return res.status(httpStatus.OK).json({ products });
  } catch (err) {
    next(err);
  }
};

// @route   GET /products/:id
// @desc    Get a product by ID
export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category", "name");

    if (!product) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not found' });
    }

    return res.status(httpStatus.OK).json({ product });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /products/:id
// @desc    Update a product
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not found' });
    }

    return res.status(httpStatus.OK).json({ message: 'Product updated successfully', product });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /products/:id
// @desc    Delete a product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not found' });
    }

    return res.status(httpStatus.OK).json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

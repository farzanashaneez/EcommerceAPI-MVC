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
    const brandExists = await Category.findById(brand);
    if (!brandExists) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid brand ID' });
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
// export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//   try {
//     const products = await Product.find().populate("category", "name");
//     return res.status(httpStatus.OK).json({ products });
//   } catch (err) {
//     next(err);
//   }
// };
// @route   GET /products
// @desc    Get all products with filtering, sorting, searching, and pagination
export const getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const {
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        minRating,
        isFeatured,
        discountedOnly,
        sortBy,
        sortOrder = "asc",
        page = "1",
        limit = "10"
      } = req.query;
  
      const query: any = {};
  
      // 🔍 Search (name or description)
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
  
      // 🏷️ Category filter
      if (category) query.category = category;
  
      // 🏷️ Brand filter
      if (brand) query.brand = brand;
  
      // 💰 Price range filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
      }
  
      // 🌟 Rating filter
      if (minRating) {
        query["ratings.average"] = { $gte: parseFloat(minRating as string) };
      }
  
      // 🔥 Featured products
      if (isFeatured === "true") query.isFeatured = true;
  
      // 🏷️ Discounted products only
      if (discountedOnly === "true") query["offer.discountPercentage"] = { $gt: 0 };
  
      // ↕️ Sorting
      const sortOptions: any = {};
      if (sortBy) {
        sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;
      } else {
        sortOptions.createdAt = -1; // Default: newest first
      }
  
      // 📄 Pagination
      const pageNumber = parseInt(page as string);
      const pageSize = parseInt(limit as string);
      const skip = (pageNumber - 1) * pageSize;
  
      const total = await Product.countDocuments(query);
  
      const products = await Product.find(query)
        .populate("brand category")
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize);
  
      return res.status(200).json({
        total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / pageSize),
        products,
      });
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

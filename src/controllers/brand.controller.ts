import { Request, Response, NextFunction } from "express";
import Brand from "../models/Brand";
import httpStatus from "../utils/httpStatus";

// @route   POST /brands
// @desc    Create a new brand
export const createBrand = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name, description, logo, website } = req.body;

    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Brand already exists" });
    }

    const brand = new Brand({ name, description, logo, website });
    await brand.save();

    return res.status(httpStatus.CREATED).json({ message: "Brand created successfully", brand });
  } catch (error) {
    next(error);
  }
};

// @route   GET /brands
// @desc    Get all brands
export const getBrands = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    return res.status(httpStatus.OK).json({ brands });
  } catch (error) {
    next(error);
  }
};

// @route   GET /brands/:id
// @desc    Get brand by ID
export const getBrandById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Brand not found" });
    }

    return res.status(httpStatus.OK).json({ brand });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /brands/:id
// @desc    Update a brand
export const updateBrand = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, description, logo, website } = req.body;

    const brand = await Brand.findByIdAndUpdate(
      id,
      { name, description, logo, website },
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Brand not found" });
    }

    return res.status(httpStatus.OK).json({ message: "Brand updated successfully", brand });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /brands/:id
// @desc    Delete a brand
export const deleteBrand = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Brand not found" });
    }

    return res.status(httpStatus.OK).json({ message: "Brand deleted successfully" });
  } catch (error) {
    next(error);
  }
};

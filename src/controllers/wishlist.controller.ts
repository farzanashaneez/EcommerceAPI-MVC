import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import httpStatus from "../utils/httpStatus";
import { AuthenticatedRequest } from "../types/express/custom";

// @route   POST /wishlist/add
// @desc    Add an item to user's wishlist
export const addToWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = req.user.id; // assuming user id is available via auth middleware (JWT)
    const { itemId } = req.body; // item to add

    if (!itemId) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Item ID is required" });
    }

    // Find user by id
    const user = await User.findById(userId);
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    // Check if item already in wishlist
    if (user.wishlist.includes(itemId)) {
      return res.status(httpStatus.CONFLICT).json({ message: "Item already in wishlist" });
    }

    // Add item to wishlist array
    user.wishlist.push(itemId);
    await user.save();

    return res.status(httpStatus.OK).json({ message: "Item added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// @route   POST /wishlist/remove
// @desc    Remove an item from user's wishlist
export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Item ID is required" });
    }

    // Find user by id
    const user = await User.findById(userId);
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    // Remove item from wishlist
    const index = user.wishlist.indexOf(itemId);
    if (index === -1) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Item not found in wishlist" });
    }

    user.wishlist.splice(index, 1);
    await user.save();

    return res.status(httpStatus.OK).json({ message: "Item removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// @route   GET /wishlist
// @desc    Get wishlist items for the user
export const getWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    // Find user and populate wishlist if needed (e.g. if wishlist stores references)
    const user = await User.findById(userId).populate('wishlist'); // assuming wishlist stores ObjectId refs
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    return res.status(httpStatus.OK).json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from "express";
import Cart from "../models/Cart";
import httpStatus from "../utils/httpStatus";
import { IUser } from "../models/User";

// Extend Request interface to include optional user property (authenticated user)
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// @route   POST /cart/add
// @desc    Add a new item to cart or update quantity if it already exists
export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?._id; // Get authenticated user's ID

    // Find existing cart for user
    let cart = await Cart.findOne({ user: userId });

    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already exists in cart items
    const itemIndex = cart.items.findIndex((item: any) => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists, increment quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Product does not exist, add new item
      cart.items.push({ product: productId, quantity });
    }

    // Save cart changes to database
    await cart.save();

    // Respond with updated cart
    return res.status(httpStatus.OK).json({ message: 'Item added/updated in cart', cart });
  } catch (err) {
    next(err); // Pass error to error handler middleware
  }
};

// @route   DELETE /cart/remove/:productId
// @desc    Remove a product item from the cart
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id; // Get authenticated user's ID

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Cart not found' });
    }

    // Filter out the product to be removed
    cart.items = cart.items.filter((item: any) => item.product.toString() !== productId);

    // Save updated cart
    await cart.save();

    // Respond with updated cart
    return res.status(httpStatus.OK).json({ message: 'Item removed from cart', cart });
  } catch (err) {
    next(err);
  }
};

// @route   GET /cart
// @desc    Get the current user's cart details
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id; // Get authenticated user's ID

    // Find cart and populate product details in items
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    // If no cart, respond with empty items array
    if (!cart) {
      return res.status(httpStatus.OK).json({ items: [] });
    }

    // Respond with cart details
    return res.status(httpStatus.OK).json({ cart });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /cart/update-quantity
// @desc    Update the quantity of a specific item in the cart
export const updateCartItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?._id; // Get authenticated user's ID

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Cart not found' });
    }

    // Find the item to update
    const item = cart.items.find((item: any) => item.product.toString() === productId);
    if (!item) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not in cart' });
    }

    // Update quantity
    item.quantity = quantity;

    // Save changes
    await cart.save();

    // Respond with updated cart
    return res.status(httpStatus.OK).json({ message: 'Item quantity updated', cart });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /cart/clear
// @desc    Clear all items from the cart
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id; // Get authenticated user's ID

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Cart not found' });
    }

    // Remove all items from cart
    cart.items = [];

    // Save changes
    await cart.save();

    // Respond with cleared cart
    return res.status(httpStatus.OK).json({ message: 'Cart cleared', cart });
  } catch (err) {
    next(err);
  }
};

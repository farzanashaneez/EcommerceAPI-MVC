import { Response, NextFunction } from 'express';
import Address from '../models/Address';
import { IUser } from '../models/User';
import { Request } from 'express';
import httpStatus from "../utils/httpStatus";


// Extend Request to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// @route   POST /address
// @desc    Create/save a new address
export const createAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { fullName, phone, street, city, state, country, postalCode, isDefault } = req.body;

    if (!userId) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });

    // If the new address is default, unset previous defaults
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      fullName,
      phone,
      street,
      city,
      state,
      country,
      postalCode,
      isDefault,
    });

    return res.status(httpStatus.OK).json({ message: 'Address saved', address });
  } catch (err) {
    next(err);
  }
};

// @route   GET /address
// @desc    Get all addresses of the authenticated user
export const getUserAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    if (!userId) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });

    const addresses = await Address.find({ userId });

    return res.status(httpStatus.OK).json({ addresses });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /address/:addressId
// @desc    Update an existing address
export const updateAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { addressId } = req.params;
    const updatedData = req.body;

    const address = await Address.findById(addressId);
    if (!address) return res.status(httpStatus.NOT_FOUND).json({ message: 'Address not found' });

    if (updatedData.isDefault) {
      await Address.updateMany({ userId: address.userId }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(addressId, updatedData, { new: true });

    return res.status(httpStatus.OK).json({ message: 'Address updated', address: updated });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /address/:addressId
// @desc    Delete an address by ID
export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { addressId } = req.params;

    const deleted = await Address.findByIdAndDelete(addressId);
    if (!deleted) return res.status(httpStatus.NOT_FOUND).json({ message: 'Address not found' });

    return res.status(httpStatus.OK).json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};

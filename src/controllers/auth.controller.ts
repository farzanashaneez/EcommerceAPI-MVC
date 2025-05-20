import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Otp from '../models/Otp';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail, generateOTP } from "../utils/otp";
import { OAuth2Client } from "google-auth-library";
import httpStatus from "../utils/httpStatus";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already exists' });

    await Otp.deleteMany({ email });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    await Otp.create({ email, name, password: hashed, otp });
    await sendOTPEmail(email, otp);

    return res.status(httpStatus.CREATED).json({ message: 'OTP sent. Please verify your email.' });
  } catch (err) {
    next(err);
  }
};

// @route   POST /verify-otp
export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord)
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already verified' });

    const user = new User({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password,
      isVerified: true,
    });
    await user.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(httpStatus.OK).json({ message: 'Email verified and user created successfully' });
  } catch (err) {
    next(err);
  }
};

// @route   POST /login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Not verified" });

    if (user.isBlocked)
      return res.status(httpStatus.FORBIDDEN).json({ message: "No access" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return res.json({ token, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

// @route   POST /google-auth
export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { tokenId } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email_verified)
      return res.status(httpStatus.FORBIDDEN).json({ message: "Email not verified" });

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        isVerified: true,
        googleId: payload.sub,
      });

      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    return res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /delete-user/:id
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    return res.status(httpStatus.OK).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /block-user/:id
export const blockUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { block } = req.body;

    const user = await User.findByIdAndUpdate(id, { isBlocked: block }, { new: true });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    return res.status(httpStatus.OK).json({
      message: `User has been ${block ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (err) {
    next(err);
  }
};

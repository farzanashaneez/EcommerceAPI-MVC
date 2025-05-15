import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail, generateOTP } from "../utils/otp";
import { OAuth2Client } from "google-auth-library";
import httpStatus from "../utils/httpStatus";

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /register
// @desc    Register a new user and send OTP to email
export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(httpStatus.BAD_REQUEST).json({ message: "User exists" });

  // Hash the password
  const hashed = await bcrypt.hash(password, 10);

  // Generate OTP and save user
  const otp = generateOTP();
  const user = new User({ name, email, password: hashed, otp });

  // Save user and send OTP email
  await user.save();
  await sendOTPEmail(email, otp);

  // Respond with success
  return res
    .status(httpStatus.CREATED)
    .json({ message: "OTP sent. Please verify email." });
};

// @route   POST /verify-otp
// @desc    Verify OTP sent to user's email
export const verifyOTP = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, otp } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user or OTP is invalid
  if (!user || user.otp !== otp)
    return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid OTP" });

  // Set user as verified and remove OTP
  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  // Respond with success
  return res.status(httpStatus.OK).json({ message: "Email verified successfully" });
};

// @route   POST /login
// @desc    Login with email and password
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  // Find user and check verification
  const user = await User.findOne({ email });
  if (!user || !user.isVerified)
    return res.status(httpStatus.BAD_REQUEST).json({ message: "Not verified" });

  // Compare hashed passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Invalid credentials" });

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  // Exclude password from returned user object
  const { password: _, ...userWithoutPassword } = user.toObject();

  // Respond with token and user data
  return res.json({ token, user: userWithoutPassword });
};

// @route   POST /google-auth
// @desc    Authenticate using Google OAuth
export const googleAuth = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tokenId } = req.body;

  // Verify Google token
  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  // Check if email is verified by Google
  if (!payload?.email_verified)
    return res.status(httpStatus.FORBIDDEN).json({ message: "Email not verified" });

  // Check if user already exists
  let user = await User.findOne({ email: payload.email });

  // If user doesn't exist, create a new one
  if (!user) {
    user = new User({
      name: payload.name,
      email: payload.email,
      isVerified: true,
      googleId: payload.sub,
    });

    await user.save();
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  // Respond with token and user data
  return res.json({ token, user });
};

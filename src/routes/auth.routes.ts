// Import necessary modules
import { Router } from "express";
import {
  register,
  verifyOTP,
  login,
  googleAuth,
  blockUser,
  resendOTP,
  refreshToken,
  resetPassword,
  forgotPassword,
} from "../controllers/auth.controller"; // Import controller functions
import { asyncHandler } from "../utils/asyncHandler"; // Middleware to handle async errors

// Initialize the router
const router = Router();

// @route   POST /register
// @desc    Register new user and send OTP
router.post("/register", asyncHandler(register));

// @route   POST /verify-otp
// @desc    Verify OTP sent to user's email
router.post("/verify-otp", asyncHandler(verifyOTP));

// @route   POST /resend-otp
// @desc    Resend OTP to user's email
router.post("/resend-otp", asyncHandler(resendOTP));

// @route   Post /refresh-token
// @desc    Refresh JWT token
router.post("/refresh-token", asyncHandler(refreshToken));

// @route   post /forgot-password
// @desc    Send OTP to user's email
router.post("/forgot-password", asyncHandler(forgotPassword));

// @ route   POST /reset-password
// @desc    Reset user password
router.post("/reset-password", asyncHandler(resetPassword));

// @route   POST /login
// @desc    Login user with email and password
router.post("/login", asyncHandler(login));

// @route   POST /google-auth
// @desc    Login or register user via Google OAuth
router.post("/google-auth", asyncHandler(googleAuth));

// @route   PATCH /block-user/:id
// @desc    Handle block user functionality
router.patch("/block-user/:id", asyncHandler(blockUser));
// Export the router
export default router;

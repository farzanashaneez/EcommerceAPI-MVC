"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary modules
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller"); // Import controller functions
const asyncHandler_1 = require("../utils/asyncHandler"); // Middleware to handle async errors
// Initialize the router
const router = (0, express_1.Router)();
// @route   POST /register
// @desc    Register new user and send OTP
router.post("/register", (0, asyncHandler_1.asyncHandler)(auth_controller_1.register));
// @route   POST /verify-otp
// @desc    Verify OTP sent to user's email
router.post("/verify-otp", (0, asyncHandler_1.asyncHandler)(auth_controller_1.verifyOTP));
// @route   POST /login
// @desc    Login user with email and password
router.post("/login", (0, asyncHandler_1.asyncHandler)(auth_controller_1.login));
// @route   POST /google-auth
// @desc    Login or register user via Google OAuth
router.post("/google-auth", (0, asyncHandler_1.asyncHandler)(auth_controller_1.googleAuth));
// Export the router
exports.default = router;

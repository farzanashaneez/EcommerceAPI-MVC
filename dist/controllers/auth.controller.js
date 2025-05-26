"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUser = exports.deleteUser = exports.googleAuth = exports.login = exports.verifyOTP = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const Otp_1 = __importDefault(require("../models/Otp"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_1 = require("../utils/otp");
const google_auth_library_1 = require("google-auth-library");
const httpStatus_1 = __importDefault(require("../utils/httpStatus"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// @route   POST /register
// @desc    Register a new user by generating an OTP and sending it to the email
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // Check if user with the same email already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser)
            return res.status(httpStatus_1.default.BAD_REQUEST).json({ message: 'User already exists' });
        // Remove any existing OTPs for the email to avoid duplicates
        await Otp_1.default.deleteMany({ email });
        // Hash the password securely before storing
        const hashed = await bcryptjs_1.default.hash(password, 10);
        // Generate a new OTP code
        const otp = (0, otp_1.generateOTP)();
        // Save OTP and user info temporarily until verification
        await Otp_1.default.create({ email, name, password: hashed, otp });
        // Send OTP email to the user
        await (0, otp_1.sendOTPEmail)(email, otp);
        // Inform client that OTP has been sent
        return res.status(httpStatus_1.default.CREATED).json({ message: 'OTP sent. Please verify your email.' });
    }
    catch (err) {
        // Pass errors to error-handling middleware
        next(err);
    }
};
exports.register = register;
// @route   POST /verify-otp
// @desc    Verify the OTP and create the user account upon success
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        // Find the OTP record matching the email and otp
        const otpRecord = await Otp_1.default.findOne({ email, otp });
        if (!otpRecord)
            return res.status(httpStatus_1.default.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });
        // Check if user already verified to prevent duplicates
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser)
            return res.status(httpStatus_1.default.BAD_REQUEST).json({ message: 'User already verified' });
        // Create a new verified user with saved data
        const user = new User_1.default({
            name: otpRecord.name,
            email: otpRecord.email,
            password: otpRecord.password,
            isVerified: true,
        });
        // Save the user to the database
        await user.save();
        // Remove the OTP record as it is no longer needed
        await Otp_1.default.deleteOne({ _id: otpRecord._id });
        // Return success response
        return res.status(httpStatus_1.default.OK).json({ message: 'Email verified and user created successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyOTP = verifyOTP;
// @route   POST /login
// @desc    Authenticate user and return a JWT token on successful login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find the user by email
        const user = await User_1.default.findOne({ email });
        // User must exist and be verified
        if (!user || !user.isVerified)
            return res.status(httpStatus_1.default.BAD_REQUEST).json({ message: "Not verified" });
        // Blocked users cannot log in
        if (user.isBlocked)
            return res.status(httpStatus_1.default.FORBIDDEN).json({ message: "No access" });
        // Compare provided password with stored hashed password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(httpStatus_1.default.BAD_REQUEST).json({ message: "Invalid credentials" });
        // Generate JWT token valid for 1 day
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        // Exclude password from user object before sending response
        const { password: _, ...userWithoutPassword } = user.toObject();
        // Send token and user details back to client
        return res.json({ token, user: userWithoutPassword });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// @route   POST /google-auth
// @desc    Authenticate or register user via Google OAuth
const googleAuth = async (req, res, next) => {
    try {
        const { tokenId } = req.body;
        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        // Email must be verified by Google
        if (!payload?.email_verified)
            return res.status(httpStatus_1.default.FORBIDDEN).json({ message: "Email not verified" });
        // Find existing user by Google email
        let user = await User_1.default.findOne({ email: payload.email });
        // If user doesn't exist, create new user
        if (!user) {
            user = new User_1.default({
                name: payload.name,
                email: payload.email,
                isVerified: true,
                googleId: payload.sub,
            });
            await user.save();
        }
        // Generate JWT token for user
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        // Send token and user data in response
        return res.json({ token, user });
    }
    catch (err) {
        next(err);
    }
};
exports.googleAuth = googleAuth;
// @route   DELETE /delete-user/:id
// @desc    Delete user by ID
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Find and delete user by id
        const user = await User_1.default.findByIdAndDelete(id);
        // If user not found, send 404 response
        if (!user) {
            return res.status(httpStatus_1.default.NOT_FOUND).json({ message: 'User not found' });
        }
        // Confirm deletion
        return res.status(httpStatus_1.default.OK).json({ message: 'User deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUser = deleteUser;
// @route   PATCH /block-user/:id
// @desc    Block or unblock a user by ID
const blockUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { block } = req.body; // Expected to be a boolean true or false
        // Update user's block status
        const user = await User_1.default.findByIdAndUpdate(id, { isBlocked: block }, { new: true });
        // If user not found, send 404 response
        if (!user) {
            return res.status(httpStatus_1.default.NOT_FOUND).json({ message: 'User not found' });
        }
        // Send success response with updated user info
        return res.status(httpStatus_1.default.OK).json({
            message: `User has been ${block ? 'blocked' : 'unblocked'} successfully`,
            user
        });
    }
    catch (err) {
        next(err);
    }
};
exports.blockUser = blockUser;

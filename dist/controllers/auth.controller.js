"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.login = exports.verifyOTP = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_1 = require("../utils/otp");
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const register = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    const existing = await User_1.default.findOne({ email });
    if (existing)
        return res.status(400).json({ message: 'User exists' });
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const otp = (0, otp_1.generateOTP)();
    const user = new User_1.default({ name, email, password: hashed, otp });
    await user.save();
    await (0, otp_1.sendOTPEmail)(email, otp);
    res.status(201).json({ message: 'OTP sent. Please verify email.' });
};
exports.register = register;
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user || user.otp !== otp)
        return res.status(400).json({ message: 'Invalid OTP' });
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully' });
};
exports.verifyOTP = verifyOTP;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user || !user.isVerified)
        return res.status(400).json({ message: 'Not verified' });
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(400).json({ message: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
};
exports.login = login;
const googleAuth = async (req, res) => {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified)
        return res.status(403).json({ message: 'Email not verified' });
    let user = await User_1.default.findOne({ email: payload.email });
    if (!user) {
        user = new User_1.default({
            name: payload.name,
            email: payload.email,
            isVerified: true,
            googleId: payload.sub
        });
        await user.save();
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
};
exports.googleAuth = googleAuth;

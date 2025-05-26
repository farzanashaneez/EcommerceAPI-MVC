"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = exports.generateOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Generate a 6-digit numeric OTP as a string
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.generateOTP = generateOTP;
// Send an OTP email to the specified email address
const sendOTPEmail = async (email, otp) => {
    // Create a Nodemailer transporter using Gmail service and credentials from env variables
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Gmail address to send from
            pass: process.env.GMAIL_PASS // Gmail app password or OAuth token
        }
    });
    // Define email options
    const mailOptions = {
        from: process.env.GMAIL_USER, // Sender address
        to: email, // Recipient address
        subject: 'Your OTP Code', // Email subject line
        text: `Your OTP is: ${otp}` // Email body text with the OTP
    };
    // Send the email asynchronously
    await transporter.sendMail(mailOptions);
};
exports.sendOTPEmail = sendOTPEmail;

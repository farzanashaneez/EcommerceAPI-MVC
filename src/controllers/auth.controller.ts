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
// @desc    Register a new user by generating an OTP and sending it to the email
export const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already exists' });

    // Remove any existing OTPs for the email to avoid duplicates
    await Otp.deleteMany({ email });

    // Hash the password securely before storing
    const hashed = await bcrypt.hash(password, 10);

    // Generate a new OTP code
    const otp = generateOTP();

    // Save OTP and user info temporarily until verification
    await Otp.create({ email, name, password: hashed, otp });

    // Send OTP email to the user
    await sendOTPEmail(email, otp);

    // Inform client that OTP has been sent
    return res.status(httpStatus.CREATED).json({ message: 'OTP sent. Please verify your email.' });
  } catch (err) {
    // Pass errors to error-handling middleware
    next(err);
  }
};
 
// @route  POST /send-otp
// @desc   Resend OTP to the user's email
export const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email } = req.body;

    // Check if OTP exists for the email
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord)
      return res.status(httpStatus.NOT_FOUND).json({ message: 'No OTP found for this email' });

    // Generate a new OTP code
    const otp = generateOTP();

    // Update the OTP record with the new code
    otpRecord.otp = otp;
    await otpRecord.save();

    // Send the new OTP to the user's email
    await sendOTPEmail(email, otp);

    // Inform client that OTP has been resent
    return res.status(httpStatus.OK).json({ message: 'OTP resent successfully' });
  } catch (err) {
    next(err);
  }
};

// @route   POST /verify-otp
// @desc    Verify the OTP and create the user account upon success
export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, otp } = req.body;

    
    // Check if user already verified to prevent duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already verified' });

      // Find the OTP record matching the email and otp
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord)
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });


    // Create a new verified user with saved data
    const user = new User({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password,
      isVerified: true,
    });

    // Save the user to the database
    await user.save();

    // Remove the OTP record as it is no longer needed
    await Otp.deleteOne({ _id: otpRecord._id });
 
    // Generate JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    //generate refresh token
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);// no expiry

    // Exclude password from user object before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Return success response
    return res.status(httpStatus.OK).json({ message: 'Email verified and user created successfully',user:userWithoutPassword ,token,refreshToken});
  } catch (err) {
    next(err);
  }
};

// @route   POST /login
// @desc    Authenticate user and return a JWT token on successful login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found, return error
    if (!user)
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });

    // Blocked users cannot log in
    if (!user || user.isBlocked)
      return res.status(httpStatus.FORBIDDEN).json({ message: "No access" });

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid credentials" });

    // Generate JWT token valid for 1 day
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

     //generate refresh token
     const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);// no expiry

    // Exclude password from user object before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Send token and user details back to client
    return res.json({ token,refreshToken, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

// @route   POST /forgot-password
// @desc    Send OTP to reset password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });

    // Remove old OTPs
    await Otp.deleteMany({ email });

    // Generate and save new OTP
    const otp = generateOTP();
    await Otp.create({ email, otp });

    await sendOTPEmail(email, otp);

    return res.status(httpStatus.OK).json({ message: 'OTP sent to email for password reset' });
  } catch (err) {
    next(err);
  }
};

// @route   POST /verify-otp-forgot-password
// @desc    Verify OTP for password reset
export const verifyOtpForgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord)
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });

    // Optionally delete OTP now or set a temporary flag
    await Otp.deleteOne({ _id: otpRecord._id });

    // You can store a temporary flag in Redis, DB, or return a token
    return res.status(httpStatus.OK).json({ message: 'OTP verified successfully', verified: true });
  } catch (err) {
    next(err);
  }
};

// @route   POST /reset-password
// @desc    Reset password after OTP verification
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(httpStatus.OK).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};


// // @route   POST /verify-reset-otp
// // @desc    Verify OTP and reset password
// export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     const otpRecord = await Otp.findOne({ email, otp });
//     if (!otpRecord)
//       return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });

//     // Update password
//     const hashed = await bcrypt.hash(newPassword, 10);
//     user.password = hashed;
//     await user.save();

//     // Remove OTP after successful use
//     await Otp.deleteOne({ _id: otpRecord._id });

//     return res.status(httpStatus.OK).json({ message: 'Password reset successfully' });
//   } catch (err) {
//     next(err);
//   }
// };


// // @route   POST /reset-password
// // @desc    Reset user's password
// export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//   try {
//     const { email, newPassword } = req.body;
//     // Find the user by email
//     const user = await User.findOne({ email });
//     // If user not found, return error
//     if (!user)
//       return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
//     // Hash the new password securely before updating
//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     // Update user's password with the new hashed password
//     user.password = hashedNewPassword;
//     await user.save();
//     // Return success response
//     return res.status(httpStatus.OK).json({ message: 'Password reset successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// @route   POST /google-auth
// @desc    Authenticate or register user via Google OAuth
export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
      return res.status(httpStatus.FORBIDDEN).json({ message: "Email not verified" });

    // Find existing user by Google email
    let user = await User.findOne({ email: payload.email });

    // If user doesn't exist, create new user
    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        isVerified: true,
        googleId: payload.sub,
      });

      await user.save();
    }

    // Generate JWT token for user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    // Send token and user data in response
    return res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /delete-user/:id
// @desc    Delete user by ID
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // Find and delete user by id
    const user = await User.findByIdAndDelete(id);

    // If user not found, send 404 response
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    // Confirm deletion
    return res.status(httpStatus.OK).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /block-user/:id
// @desc    Block or unblock a user by ID
export const blockUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { block } = req.body; // Expected to be a boolean true or false

    // Update user's block status
    const user = await User.findByIdAndUpdate(id, { isBlocked: block }, { new: true });

    // If user not found, send 404 response
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    // Send success response with updated user info
    return res.status(httpStatus.OK).json({
      message: `User has been ${block ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (err) {
    next(err);
  }
};
 //@route   POST  /refresh-token
// @desc    Refresh JWT token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'No refreshToken provided' });
    }

    // Verify the existing refreshToken
    jwt.verify(refreshToken, process.env.JWT_SECRET!, (err:any, decoded:any) => {
      if (err) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
      }

      // Generate a new token
      const newToken = jwt.sign({ id: (decoded as any).id }, process.env.JWT_SECRET!, {
        expiresIn: "1d",
      });

      return res.json({ token: newToken });
    });
  } catch (err) {
    next(err);
  }
};
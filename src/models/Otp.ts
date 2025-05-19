import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  name: string;
  password: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, // hashed password
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 1800 } // 30 minutes
});

export default mongoose.model<IOtp>('Otp', otpSchema);

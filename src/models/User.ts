import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  googleId?: string;
   isBlocked: boolean;
}

const userSchema = new Schema<IUser>({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  googleId: String,
  isBlocked:  { type: Boolean, default: false },
});

export default mongoose.model<IUser>('User', userSchema);

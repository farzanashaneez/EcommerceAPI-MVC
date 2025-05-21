import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id:mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  googleId?: string;
   isBlocked: boolean;
   wishlist: mongoose.Types.ObjectId[];
   walletBalance: number;
   walletTransactions?: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  googleId: String,
  isBlocked:  { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  walletBalance: { type: Number, default: 0 },
  walletTransactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction' }],
});

export default mongoose.model<IUser>('User', userSchema);

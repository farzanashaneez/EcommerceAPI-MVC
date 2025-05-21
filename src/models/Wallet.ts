import mongoose, { Document, Schema } from 'mongoose';

export interface IWalletTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  createdAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWalletTransaction>('WalletTransaction', walletTransactionSchema);

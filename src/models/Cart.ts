import mongoose, { Schema, Document } from 'mongoose';

// Cart Item Interface
export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

// Cart Interface extending Document
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Cart Item Schema
const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

// Cart Schema
const cartSchema = new Schema<ICart>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

export default mongoose.model<ICart>('Cart', cartSchema);

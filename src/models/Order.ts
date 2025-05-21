import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  name: string; // Added to support Stripe line items
  quantity: number;
  price: number;
  discount: number;
  status: 'ordered' | 'cancelled' | 'returned';
  cancelReason?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'paid' | 'refunded';
  totalAmount: number;
  netAmount: number;
  createdAt: Date;
  paymentMethod?: 'wallet' | 'stripe' | 'cod';
  stripePaymentIntentId?: string;
}

const orderProductSchema = new Schema<IOrderProduct>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // Added
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  status: { type: String, enum: ['ordered', 'cancelled', 'returned'], default: 'ordered' },
  cancelReason: { type: String }
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [orderProductSchema],
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled', 'returned', 'paid', 'refunded'],
    default: 'processing'
  },
  totalAmount: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'stripe', 'cod']
  },
  stripePaymentIntentId: { type: String }, // Optional for Stripe
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', orderSchema);

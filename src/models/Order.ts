import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  status: 'ordered' | 'cancelled' | 'returned';
  cancelReason?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'paid' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  netAmount: number;
  discountAmount?: number;
  couponCode?: string;
  paymentMethod?: 'wallet' | 'stripe' | 'cod';
  stripePaymentIntentId?: string;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderProductSchema = new Schema<IOrderProduct>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    status: { type: String, enum: ['ordered', 'cancelled', 'returned'], default: 'ordered' },
    cancelReason: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },

    products: [orderProductSchema],

    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled', 'returned', 'paid', 'refunded'],
      default: 'processing',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    totalAmount: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },

    paymentMethod: {
      type: String,
      enum: ['wallet', 'stripe', 'cod'],
    },
    stripePaymentIntentId: { type: String },

    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

export default mongoose.model<IOrder>('Order', orderSchema);

import mongoose, { Document, Schema, Model } from "mongoose";

// 1. Interface for the Product
export interface IProduct extends Document {
  name: string;
  brand: string;
  category: mongoose.Types.ObjectId;
  description: string;
  price: number;
  stock: number;
  images: string[];
  offer: {
    discountPercentage: number;
    offerEndDate?: Date;
  };
  ratings: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema Definition
const productSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    brand:{ type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    images: [{ type: String }],
    offer: {
      discountPercentage: { type: Number, default: 0 },
      offerEndDate: { type: Date }
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 3. Export the model
const Product: Model<IProduct> = mongoose.model<IProduct>("Product", productSchema);
export default Product;

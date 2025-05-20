import mongoose, { Document, Schema, Model } from "mongoose";

// 1. Interface for the Product
export interface IProduct extends Document {
  name: string;
  brand: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  description: string;
  price: number;
  stock: number;
  images: string[];
  offer: {
    discountPercentage: number;
    offerEndDate?: Date;
  };
  variants?: ProductVariant[];
  ratings: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 2. producr variant
export interface ProductVariant {
  color: string;
  size: string;
  stock: number;
  price: number;
  images: string[];
}

// 3. variant Schema
const variantSchema = new Schema<ProductVariant>(
  {
    color: { type: String, required: true },
    size: { type: String, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
  },
  { _id: false } 
);

// 4. Schema Definition
const productSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    images: [{ type: String }],
    variants: [variantSchema],
    offer: {
      discountPercentage: { type: Number, default: 0 },
      offerEndDate: { type: Date },
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 5. Export the model
const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  productSchema
);
export default Product;

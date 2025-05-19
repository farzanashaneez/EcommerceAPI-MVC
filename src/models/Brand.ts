import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Define the Brand interface
export interface IBrand extends Document {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the schema
const brandSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String }, 
    website: { type: String },
  },
  { timestamps: true }
);

// 3. Create and export the model
const Brand: Model<IBrand> = mongoose.model<IBrand>("Brand", brandSchema);
export default Brand;

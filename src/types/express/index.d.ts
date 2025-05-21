import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId | string;
      // Add other user properties you need to access
      // email?: string;
      // role?: string;
      // etc.
    }
  }
}
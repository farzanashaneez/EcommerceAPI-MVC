import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import httpStatus from "../utils/httpStatus";


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized: User not found' });

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized: Invalid token' });
  }
};

// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
}

// Centralized error handler middleware
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
    console.log(err.status)
  const statusCode = err.status || 500;

  // Optional: detailed logging only in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${err.message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

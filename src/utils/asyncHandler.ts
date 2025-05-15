import { Request, Response, NextFunction, RequestHandler } from "express";

// Define a type for async route handlers that return a Promise
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// Wrap async route handler to catch errors and forward them to Express error middleware
export const asyncHandler = (fn: AsyncRouteHandler): RequestHandler => {
  return (req, res, next) => {
    // Call the async function and catch any errors, passing them to next()
    fn(req, res, next).catch(next);
  };
};

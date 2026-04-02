// Error Handler Middleware
import { Request, Response, NextFunction } from 'express';
import { AppError, sendErrorResponse } from '../utils/error.utils';
import { CONSTANTS } from '../config/constants';

/**
 * Global error handler middleware (must be last)
 */
export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    sendErrorResponse(res, err);
  } else {
    // Handle unexpected errors
    const error = new AppError(500, CONSTANTS.ERROR_MESSAGES.SERVER_ERROR, false);
    sendErrorResponse(res, error);
  }
};

/**
 * Async wrapper for route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.path} not found`,
  });
};

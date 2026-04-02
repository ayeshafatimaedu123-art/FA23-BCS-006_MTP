/**
 * Error Handler Middleware
 */

import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Global error handler (must be last middleware)
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.message = err.message || 'Internal Server Error';
  
  // Log error
  console.error('[ERROR]', {
    status: err.statusCode,
    message: err.message,
    type: err.type,
    path: req.path,
    method: req.method
  });
  
  // Handle validation errors
  if (err.statusCode === HTTP_STATUS.BAD_REQUEST) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  
  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    sendError(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
    return;
  }
  
  // Default error response
  sendError(res, err.message, err.statusCode);
};

/**
 * Async handler wrapper - catches errors from async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  sendError(res, 'Route not found', HTTP_STATUS.NOT_FOUND);
};

// Error Handling Utility
import { Response } from 'express';
import { CONSTANTS } from '../config/constants';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Send error response
 */
export const sendErrorResponse = (res: Response, error: AppError | Error): Response => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      isOperational: error.isOperational,
    });
  }

  // Handle unknown errors
  console.error('Unknown error:', error);
  return res.status(500).json({
    success: false,
    error: CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
    isOperational: false,
  });
};

/**
 * Create validation error
 */
export const ValidationError = (message: string): AppError => {
  return new AppError(400, message);
};

/**
 * Create unauthorized error
 */
export const UnauthorizedError = (message: string = CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED): AppError => {
  return new AppError(401, message);
};

/**
 * Create forbidden error
 */
export const ForbiddenError = (message: string = CONSTANTS.ERROR_MESSAGES.FORBIDDEN): AppError => {
  return new AppError(403, message);
};

/**
 * Create not found error
 */
export const NotFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(404, `${resource} not found`);
};

/**
 * Create conflict error
 */
export const ConflictError = (message: string): AppError => {
  return new AppError(409, message);
};

/**
 * Create server error
 */
export const ServerError = (message: string = CONSTANTS.ERROR_MESSAGES.SERVER_ERROR): AppError => {
  return new AppError(500, message);
};

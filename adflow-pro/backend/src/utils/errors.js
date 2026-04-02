/**
 * Error Utilities
 */

import { HTTP_STATUS } from '../config/constants.js';

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createValidationError = (message) => {
  const error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
  error.type = 'ValidationError';
  return error;
};

export const createUnauthorizedError = (message = 'Unauthorized') => {
  const error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  error.type = 'UnauthorizedError';
  return error;
};

export const createForbiddenError = (message = 'Forbidden') => {
  const error = new AppError(message, HTTP_STATUS.FORBIDDEN);
  error.type = 'ForbiddenError';
  return error;
};

export const createNotFoundError = (resource = 'Resource') => {
  const error = new AppError(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
  error.type = 'NotFoundError';
  return error;
};

export const createConflictError = (message) => {
  const error = new AppError(message, HTTP_STATUS.CONFLICT);
  error.type = 'ConflictError';
  return error;
};

export const createServerError = (message = 'Internal server error') => {
  const error = new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  error.type = 'ServerError';
  return error;
};

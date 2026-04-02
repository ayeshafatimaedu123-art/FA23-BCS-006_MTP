/**
 * Response Utilities
 */

import { HTTP_STATUS } from '../config/constants.js';

/**
 * Send success response
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send error response
 */
export const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Send paginated response
 */
export const sendPaginated = (res, items, total, page, limit, message = 'Success') => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
};

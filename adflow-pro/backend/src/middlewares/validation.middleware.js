/**
 * Validation Middleware
 * Uses Zod for schema validation
 */

import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Validate request body against Zod schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedData = validated;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        sendError(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
        return;
      }
      sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }
  };
};

/**
 * Validate request params against Zod schema
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);
      req.validatedParams = validated;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        sendError(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
        return;
      }
      sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }
  };
};

/**
 * Validate request query against Zod schema
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.validatedQuery = validated;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        sendError(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
        return;
      }
      sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }
  };
};

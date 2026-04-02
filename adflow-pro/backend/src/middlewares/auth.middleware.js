/**
 * Authentication Middleware
 */

import { verifyAccessToken, extractToken } from '../utils/jwt.js';
import { createUnauthorizedError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Verify JWT token and extract user info
 */
export const authMiddleware = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      throw createUnauthorizedError('No token provided');
    }
    
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, error.message || 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
  }
};

/**
 * Optional auth - doesn't fail if token missing
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Silently fail - user is optional
    next();
  }
};

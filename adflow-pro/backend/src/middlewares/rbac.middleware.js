/**
 * RBAC (Role-Based Access Control) Middleware
 */

import { ROLE_PERMISSIONS, USER_ROLES } from '../config/constants.js';
import { createForbiddenError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createForbiddenError('User not authenticated');
      }
      
      const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
      
      // Super admin has all permissions
      if (req.user.role === USER_ROLES.SUPER_ADMIN) {
        return next();
      }
      
      if (!userPermissions.includes(permission)) {
        throw createForbiddenError('You do not have permission to perform this action');
      }
      
      next();
    } catch (error) {
      sendError(res, error.message, HTTP_STATUS.FORBIDDEN);
    }
  };
};

/**
 * Check if user has specific role
 */
export const hasRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createForbiddenError('User not authenticated');
      }
      
      if (!roles.includes(req.user.role)) {
        throw createForbiddenError('Insufficient role privileges');
      }
      
      next();
    } catch (error) {
      sendError(res, error.message, HTTP_STATUS.FORBIDDEN);
    }
  };
};

/**
 * Auth-required middleware
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  next();
};

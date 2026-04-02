// RBAC (Role-Based Access Control) Middleware
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { RBAC, CONSTANTS } from '../config/constants';
import { ForbiddenError } from '../utils/error.utils';

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    const userRole = req.user.role as keyof typeof RBAC;
    const rolePermissions = RBAC[userRole] || [];

    const hasPermissionFlag = rolePermissions.includes('*') || rolePermissions.includes(permission);

    if (!hasPermissionFlag) {
      res.status(403).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      });
      return;
    }

    next();
  };
};

/**
 * Check if user has any of multiple permissions
 */
export const hasAnyPermission = (permissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    const userRole = req.user.role as keyof typeof RBAC;
    const rolePermissions = RBAC[userRole] || [];

    const hasAnyPerm =
      rolePermissions.includes('*') || permissions.some((permission) => rolePermissions.includes(permission));

    if (!hasAnyPerm) {
      res.status(403).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      });
      return;
    }

    next();
  };
};

/**
 * Check if user has all permissions
 */
export const hasAllPermissions = (permissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    const userRole = req.user.role as keyof typeof RBAC;
    const rolePermissions = RBAC[userRole] || [];

    const hasAllPerms =
      rolePermissions.includes('*') || permissions.every((permission) => rolePermissions.includes(permission));

    if (!hasAllPerms) {
      res.status(403).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      });
      return;
    }

    next();
  };
};

/**
 * Check if user has specific role
 */
export const hasRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      });
      return;
    }

    next();
  };
};

/**
 * Check if user is owner of resource (validates against userId in route params or body)
 */
export const isOwner = (userIdPath: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    const resourceUserId = req.params[userIdPath] || req.body[userIdPath];

    if (resourceUserId !== req.user.id && req.user.role !== CONSTANTS.ROLES.ADMIN && req.user.role !== CONSTANTS.ROLES.SUPER_ADMIN) {
      res.status(403).json({
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      });
      return;
    }

    next();
  };
};

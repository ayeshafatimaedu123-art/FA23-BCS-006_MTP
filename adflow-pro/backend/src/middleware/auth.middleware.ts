// Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/jwt.utils';
import { AppError, UnauthorizedError } from '../utils/error.utils';

/**
 * Extend Express Request to include authenticated user info
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  token?: string;
}

/**
 * Auth middleware - verifies JWT token
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw UnauthorizedError('No token provided');
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw UnauthorizedError('Invalid or expired token');
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
      });
    }
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
export const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Silently continue even if auth fails
    next();
  }
};

/**
 * Require auth middleware with optional role check
 */
export const requireAuth = (allowedRoles?: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

// Auth Routes
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { loginSchema, registerSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.handler';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register new user
 */
router.post('/register', validateBody(registerSchema), asyncHandler(authController.register));

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', validateBody(loginSchema), asyncHandler(authController.login));

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', validateBody(refreshTokenSchema), asyncHandler(authController.refreshToken));

/**
 * GET /api/v1/auth/profile
 * Get current user profile
 */
router.get('/profile', authMiddleware, asyncHandler(authController.getProfile));

/**
 * PUT /api/v1/auth/profile
 * Update current user profile
 */
router.put('/profile', authMiddleware, asyncHandler(authController.updateProfile));

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

export default router;

/**
 * Auth Routes
 */

import express from 'express';
import { asyncHandler } from '../middlewares/error.handler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * Public routes
 */
router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

/**
 * Protected routes
 */
router.get(
  '/profile',
  authMiddleware,
  asyncHandler(authController.getProfile)
);

router.put(
  '/profile',
  authMiddleware,
  validateBody(updateProfileSchema),
  asyncHandler(authController.updateProfile)
);

router.post(
  '/logout',
  authMiddleware,
  asyncHandler(authController.logout)
);

export default router;

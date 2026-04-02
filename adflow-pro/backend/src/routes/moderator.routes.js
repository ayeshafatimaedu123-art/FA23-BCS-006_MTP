/**
 * Moderator Routes
 */

import express from 'express';
import { asyncHandler } from '../middlewares/error.handler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { hasRole } from '../middlewares/rbac.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { reviewAdSchema } from '../validators/ad.validator.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * Get review queue
 */
router.get(
  '/review-queue',
  authMiddleware,
  hasRole(USER_ROLES.MODERATOR),
  asyncHandler(async (req, res) => {
    // TODO: Implement review queue logic
    res.json({ message: 'Review queue' });
  })
);

/**
 * Review ad
 */
router.patch(
  '/ads/:id/review',
  authMiddleware,
  hasRole(USER_ROLES.MODERATOR),
  validateBody(reviewAdSchema),
  asyncHandler(async (req, res) => {
    // TODO: Implement review logic
    res.json({ message: 'Ad reviewed' });
  })
);

/**
 * Dashboard
 */
router.get(
  '/dashboard',
  authMiddleware,
  hasRole(USER_ROLES.MODERATOR),
  asyncHandler(async (req, res) => {
    // TODO: Implement moderator dashboard
    res.json({ message: 'Moderator dashboard' });
  })
);

export default router;

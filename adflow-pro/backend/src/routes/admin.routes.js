/**
 * Admin Routes
 */

import express from 'express';
import { asyncHandler } from '../middlewares/error.handler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { hasRole } from '../middlewares/rbac.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { verifyPaymentSchema } from '../validators/payment.validator.js';
import * as paymentController from '../controllers/payment.controller.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * Payment Queue
 */
router.get(
  '/payment-queue',
  authMiddleware,
  hasRole(USER_ROLES.ADMIN),
  asyncHandler(paymentController.getPaymentQueue)
);

/**
 * Verify Payment
 */
router.patch(
  '/payments/:id/verify',
  authMiddleware,
  hasRole(USER_ROLES.ADMIN),
  validateBody(verifyPaymentSchema.pick({ status: true, comment: true })),
  asyncHandler(paymentController.verifyPayment)
);

/**
 * Publish Ad
 */
router.patch(
  '/ads/:id/publish',
  authMiddleware,
  hasRole(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    // TODO: Implement publish logic
    res.json({ message: 'Ad published' });
  })
);

/**
 * Dashboard
 */
router.get(
  '/dashboard',
  authMiddleware,
  hasRole(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    // TODO: Implement admin dashboard
    res.json({ message: 'Admin dashboard' });
  })
);

/**
 * Analytics
 */
router.get(
  '/analytics',
  authMiddleware,
  hasRole(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    // TODO: Implement analytics
    res.json({ message: 'Analytics' });
  })
);

export default router;

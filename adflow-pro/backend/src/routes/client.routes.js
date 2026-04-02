/**
 * Client Routes
 */

import express from 'express';
import { asyncHandler } from '../middlewares/error.handler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { hasRole } from '../middlewares/rbac.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { createAdSchema, updateAdSchema } from '../validators/ad.validator.js';
import { createPaymentSchema } from '../validators/payment.validator.js';
import * as adController from '../controllers/ad.controller.js';
import * as paymentController from '../controllers/payment.controller.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

/**
 * Ad Routes (Client)
 */
router.post(
  '/ads',
  authMiddleware,
  hasRole(USER_ROLES.CLIENT),
  validateBody(createAdSchema),
  asyncHandler(adController.createAd)
);

router.patch(
  '/ads/:id',
  authMiddleware,
  hasRole(USER_ROLES.CLIENT),
  validateBody(updateAdSchema.partial()),
  asyncHandler(adController.updateAd)
);

router.delete(
  '/ads/:id',
  authMiddleware,
  hasRole(USER_ROLES.CLIENT),
  asyncHandler(adController.deleteAd)
);

/**
 * Payment Routes (Client)
 */
router.post(
  '/payments',
  authMiddleware,
  hasRole(USER_ROLES.CLIENT),
  validateBody(createPaymentSchema),
  asyncHandler(paymentController.createPayment)
);

router.get(
  '/payments',
  authMiddleware,
  hasRole(USER_ROLES.CLIENT),
  asyncHandler(paymentController.getUserPayments)
);

router.get(
  '/payments/:id',
  authMiddleware,
  hasRole(USER_ROLES.CLIENT),
  asyncHandler(paymentController.getPayment)
);

/**
 * Dashboard
 */
router.get(
  '/dashboard',
  authMiddleware,
  hasRole(USER_ROLES.CLIENT),
  asyncHandler(async (req, res) => {
    // TODO: Implement dashboard logic
    res.json({ message: 'Client dashboard' });
  })
);

export default router;

/**
 * Public Routes
 */

import express from 'express';
import { asyncHandler } from '../middlewares/error.handler.js';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware.js';
import { validateQuery } from '../middlewares/validation.middleware.js';
import { filterAdsSchema } from '../validators/ad.validator.js';
import * as adController from '../controllers/ad.controller.js';

const router = express.Router();

/**
 * Get all ads (public)
 */
router.get(
  '/ads',
  optionalAuthMiddleware,
  validateQuery(filterAdsSchema),
  asyncHandler(adController.searchAds)
);

/**
 * Get ad by slug
 */
router.get(
  '/ads/:slug',
  optionalAuthMiddleware,
  asyncHandler(adController.getAdBySlug)
);

/**
 * Get categories (public)
 */
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    // TODO: Implement categories endpoint
    res.json({ message: 'Categories' });
  })
);

/**
 * Get cities (public)
 */
router.get(
  '/cities',
  asyncHandler(async (req, res) => {
    // TODO: Implement cities endpoint
    res.json({ message: 'Cities' });
  })
);

/**
 * Get packages (public)
 */
router.get(
  '/packages',
  asyncHandler(async (req, res) => {
    // TODO: Implement packages endpoint
    res.json({ message: 'Packages' });
  })
);

export default router;

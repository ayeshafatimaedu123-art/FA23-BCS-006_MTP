/**
 * Ad Controller
 * Handles ad endpoints
 */

import * as adService from '../services/ad.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * POST /api/client/ads
 */
export const createAd = async (req, res, next) => {
  try {
    const ad = await adService.createAd(req.user.userId, req.body);
    sendSuccess(res, ad, 'Ad created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ads/:id
 */
export const getAd = async (req, res, next) => {
  try {
    const ad = await adService.getAdById(req.params.id);
    sendSuccess(res, ad, 'Ad retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ads/:slug
 */
export const getAdBySlug = async (req, res, next) => {
  try {
    const ad = await adService.getAdBySlug(req.params.slug);
    sendSuccess(res, ad, 'Ad retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ads
 */
export const searchAds = async (req, res, next) => {
  try {
    const filters = {
      categoryId: req.query.categoryId,
      cityId: req.query.cityId,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: req.query.sort || 'latest'
    };
    
    const result = await adService.searchAds(filters);
    sendPaginated(res, result.ads, result.total, result.page, result.limit);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/client/ads/:id
 */
export const updateAd = async (req, res, next) => {
  try {
    const ad = await adService.updateAd(req.params.id, req.user.userId, req.body);
    sendSuccess(res, ad, 'Ad updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/client/ads/:id
 */
export const deleteAd = async (req, res, next) => {
  try {
    await adService.deleteAd(req.params.id, req.user.userId);
    sendSuccess(res, {}, 'Ad deleted successfully');
  } catch (error) {
    next(error);
  }
};

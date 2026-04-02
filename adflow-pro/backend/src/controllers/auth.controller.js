/**
 * Auth Controller
 * Handles auth endpoints
 */

import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, result, 'User registered successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getUserProfile(req.user.userId);
    sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateUserProfile(req.user.userId, req.body);
    sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // JWT-based, just return success
    sendSuccess(res, {}, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Payment Controller
 * Handles payment endpoints
 */

import * as paymentService from '../services/payment.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * POST /api/client/payments
 */
export const createPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment(req.user.userId, req.body);
    sendSuccess(res, payment, 'Payment created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/payment-queue
 */
export const getPaymentQueue = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    
    const result = await paymentService.getPaymentQueue(filters);
    sendPaginated(res, result.payments, result.total, result.page, result.limit);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/payments/:id/verify
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const payment = await paymentService.verifyPayment(req.params.id, status, comment);
    sendSuccess(res, payment, 'Payment verified successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/client/payments
 */
export const getUserPayments = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status
    };
    
    const result = await paymentService.getUserPayments(req.user.userId, filters);
    sendPaginated(res, result.payments, result.total, result.page, result.limit);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/client/payments/:id
 */
export const getPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    sendSuccess(res, payment, 'Payment retrieved successfully');
  } catch (error) {
    next(error);
  }
};

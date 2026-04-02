// Payment Controller
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CreatePaymentInput, VerifyPaymentInput } from '../validators/payment.validator';
import { PaymentModel } from '../models/payment.model';
import { AdModel } from '../models/ad.model';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/error.utils';
import { CONSTANTS } from '../config/constants';

export const paymentController = {
  /**
   * Submit payment proof (client)
   */
  async submitPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { adId, packageId, proofUrl, proofType, paymentMethod }: CreatePaymentInput = req.body;

      // Get ad
      const ad = await AdModel.findById(adId);
      if (!ad) {
        throw NotFoundError(CONSTANTS.ERROR_MESSAGES.AD_NOT_FOUND);
      }

      // Check ownership
      if (ad.user_id !== req.user.id) {
        throw ForbiddenError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      // Check ad status
      if (ad.status !== 'payment_pending') {
        throw ValidationError('Ad is not ready for payment');
      }

      // Check if payment already exists
      const existing = await PaymentModel.findByAdId(adId);
      if (existing && existing.status !== 'rejected') {
        throw ValidationError('Payment already submitted for this ad');
      }

      // Create payment
      const payment = await PaymentModel.create({
        ad_id: adId,
        user_id: req.user.id,
        package_id: packageId,
        amount: 0, // Will be fetched from package
        currency: 'USD',
        status: 'submitted',
        proof_url: proofUrl,
        proof_type: proofType as any,
        payment_method: paymentMethod,
      });

      // Update ad status
      await AdModel.update(adId, {
        status: 'payment_submitted',
      });

      res.status(201).json({
        success: true,
        message: 'Payment submitted successfully',
        data: { payment },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment queue (admin only)
   */
  async getQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { payments, total } = await PaymentModel.getQueue(page, limit);

      res.json({
        success: true,
        data: { payments },
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify payment (admin only)
   */
  async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const { status, verificationNotes, rejectionReason }: VerifyPaymentInput = req.body;

      // Get payment
      const payment = await PaymentModel.findById(id);
      if (!payment) {
        throw NotFoundError(CONSTANTS.ERROR_MESSAGES.PAYMENT_NOT_FOUND);
      }

      // Update payment
      const updated = await PaymentModel.update(id, {
        status: status as any,
        verified_by: req.user.id,
        verified_at: new Date(),
        verification_notes: verificationNotes,
        rejection_reason: rejectionReason,
      });

      // Update ad status
      if (status === 'verified') {
        await AdModel.update(payment.ad_id, {
          status: 'verified',
        });
      } else if (status === 'rejected') {
        await AdModel.update(payment.ad_id, {
          status: 'payment_pending',
        });
      }

      res.json({
        success: true,
        message: status === 'verified' ? CONSTANTS.SUCCESS_MESSAGES.PAYMENT_VERIFIED : 'Payment rejected',
        data: { payment: updated },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user payments
   */
  async getUserPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { payments, total } = await PaymentModel.findByUserId(req.user.id, page, limit);

      res.json({
        success: true,
        data: { payments },
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment details
   */
  async getPaymentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const payment = await PaymentModel.findById(id);
      if (!payment) {
        throw NotFoundError(CONSTANTS.ERROR_MESSAGES.PAYMENT_NOT_FOUND);
      }

      // Check if user owns this payment
      if (payment.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        throw ForbiddenError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      res.json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      throw error;
    }
  },
};

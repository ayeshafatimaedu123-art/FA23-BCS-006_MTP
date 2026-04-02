/**
 * Payment Validators
 * Zod schemas for payment endpoints
 */

import { z } from 'zod';

export const createPaymentSchema = z.object({
  adId: z.string().uuid('Invalid ad ID'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['bank_transfer', 'card', 'upi', 'wallet']),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  notes: z.string().optional()
});

export const verifyPaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  status: z.enum(['verified', 'rejected']),
  comment: z.string().optional()
});

export const getPaymentQueueSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  status: z.enum(['pending', 'submitted', 'verified', 'rejected']).optional()
});

export const getUserPaymentsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  status: z.enum(['pending', 'submitted', 'verified', 'rejected']).optional()
});

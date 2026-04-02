// Payment Validation Schemas (Zod)
import { z } from 'zod';

/**
 * Create payment schema
 */
export const createPaymentSchema = z.object({
  adId: z.string().uuid('Invalid ad ID'),
  packageId: z.string().uuid('Invalid package ID'),
  proofUrl: z.string().url('Invalid proof URL'),
  proofType: z.enum(['screenshot', 'invoice', 'receipt']),
  paymentMethod: z.string().min(3, 'Payment method is required'),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

/**
 * Verify payment schema (for admin)
 */
export const verifyPaymentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  verificationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

/**
 * Get payment queue schema
 */
export const getPaymentQueueSchema = z.object({
  status: z.enum(['pending', 'submitted', 'verified', 'rejected']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  sortBy: z.enum(['newest', 'oldest', 'amount_asc', 'amount_desc']).default('newest'),
});

export type GetPaymentQueueInput = z.infer<typeof getPaymentQueueSchema>;

/**
 * Get user payments schema
 */
export const getUserPaymentsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  status: z.enum(['pending', 'submitted', 'verified', 'rejected']).optional(),
});

export type GetUserPaymentsInput = z.infer<typeof getUserPaymentsSchema>;

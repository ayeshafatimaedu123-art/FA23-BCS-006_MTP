/**
 * Ad Validators
 * Zod schemas for ad endpoints
 */

import { z } from 'zod';

const mediaSchema = z.object({
  type: z.enum(['image', 'video', 'youtube']),
  url: z.string().url('Invalid media URL'),
  isPrimary: z.boolean().default(false)
});

export const createAdSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  categoryId: z.string().uuid('Invalid category ID'),
  cityId: z.string().uuid('Invalid city ID'),
  price: z.number().positive('Price must be positive'),
  packageId: z.string().uuid('Invalid package ID'),
  media: z.array(mediaSchema).min(1, 'At least one media is required').max(10),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

export const updateAdSchema = createAdSchema.partial();

export const submitAdSchema = z.object({
  adId: z.string().uuid('Invalid ad ID')
});

export const flagMediaSchema = z.object({
  mediaId: z.string().uuid('Invalid media ID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  description: z.string().optional()
});

export const reviewAdSchema = z.object({
  adId: z.string().uuid('Invalid ad ID'),
  status: z.enum(['approved', 'rejected']),
  comment: z.string().optional()
});

export const filterAdsSchema = z.object({
  categoryId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  sort: z.enum(['latest', 'oldest', 'price_low', 'price_high', 'featured']).default('latest')
});

export const publishAdSchema = z.object({
  adId: z.string().uuid('Invalid ad ID')
});

// Ad Validation Schemas (Zod)
import { z } from 'zod';
import { CONSTANTS } from '../config/constants';

/**
 * Media schema
 */
export const mediaSchema = z.object({
  url: z.string().url('Invalid URL format'),
  mediaType: z.enum(['image', 'video', 'youtube']),
  title: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export type MediaInput = z.infer<typeof mediaSchema>;

/**
 * Create ad validation schema
 */
export const createAdSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(255),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  categoryId: z.string().uuid('Invalid category ID'),
  cityId: z.string().uuid('Invalid city ID'),
  packageId: z.string().uuid('Invalid package ID').optional(),
  price: z.number().positive('Price must be positive').optional(),
  currency: z.string().length(3).default('USD'),
  contactEmail: z.string().email('Invalid contact email'),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url('Invalid website URL').optional(),
  media: z
    .array(mediaSchema)
    .min(1, 'At least one media item is required')
    .max(10, 'Maximum 10 media items allowed'),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;

/**
 * Update ad validation schema
 */
export const updateAdSchema = createAdSchema.partial();

export type UpdateAdInput = z.infer<typeof updateAdSchema>;

/**
 * Review ad schema
 */
export const reviewAdSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});

export type ReviewAdInput = z.infer<typeof reviewAdSchema>;

/**
 * Flag media schema
 */
export const flagMediaSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export type FlagMediaInput = z.infer<typeof flagMediaSchema>;

/**
 * Search/Filter ads schema
 */
export const filterAdsSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  isFeatured: z.boolean().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  sortBy: z.enum(['newest', 'popular', 'price_asc', 'price_desc']).default('newest'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type FilterAdsInput = z.infer<typeof filterAdsSchema>;

/**
 * Publish ad schema (for admin)
 */
export const publishAdSchema = z.object({
  expiresAt: z.string().datetime('Invalid datetime format'),
  isScheduled: z.boolean().default(false),
  scheduledPublishAt: z.string().datetime().optional(),
});

export type PublishAdInput = z.infer<typeof publishAdSchema>;

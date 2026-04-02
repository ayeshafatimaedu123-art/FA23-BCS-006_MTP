// Ad Controller
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CreateAdInput, UpdateAdInput, ReviewAdInput, FilterAdsInput, PublishAdInput } from '../validators/ad.validator';
import { AdModel } from '../models/ad.model';
import { generateUniqueSlug, createSlug } from '../utils/string.utils';
import { validateMediaUrl } from '../utils/media.utils';
import { NotFoundError, ValidationError, ForbiddenError, ServerError } from '../utils/error.utils';
import { CONSTANTS } from '../config/constants';
import { supabase } from '../config/database';

export const adController = {
  /**
   * Create ad
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { title, description, categoryId, cityId, packageId, price, currency, contactEmail, contactPhone, websiteUrl, media }: CreateAdInput =
        req.body;

      // Validate media URLs
      for (const mediaItem of media) {
        const validation = await validateMediaUrl(mediaItem.url);
        if (!validation.valid) {
          throw ValidationError(`Invalid media URL: ${validation.errors.join(', ')}`);
        }
      }

      // Generate slug
      const slug = generateUniqueSlug(title);

      // Create ad
      const ad = await AdModel.create({
        user_id: req.user.id,
        category_id: categoryId,
        city_id: cityId,
        package_id: packageId,
        title,
        slug,
        description,
        price,
        currency,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        website_url: websiteUrl,
        status: 'draft',
      });

      // Add media
      const mediaData = media.map((item, index) => ({
        ad_id: ad.id,
        url: item.url,
        media_type: item.mediaType,
        title: item.title,
        is_primary: item.isPrimary || index === 0,
        sort_order: index,
      }));

      const { error: mediaError } = await supabase.from('ad_media').insert(mediaData);
      if (mediaError) throw new Error(`Failed to add media: ${mediaError.message}`);

      res.status(201).json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.AD_CREATED,
        data: { ad },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get ad details
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ad = await AdModel.findById(id);
      if (!ad) {
        throw NotFoundError(CONSTANTS.ERROR_MESSAGES.AD_NOT_FOUND);
      }

      res.json({
        success: true,
        data: { ad },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get ad by slug (public)
   */
  async getBySlug(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const ad = await AdModel.findBySlug(slug);
      if (!ad) {
        throw NotFoundError(CONSTANTS.ERROR_MESSAGES.AD_NOT_FOUND);
      }

      // Only show published ads to public
      if (!req.user || req.user.role === 'client') {
        if (ad.status !== 'published') {
          throw NotFoundError(CONSTANTS.ERROR_MESSAGES.AD_NOT_FOUND);
        }
      }

      res.json({
        success: true,
        data: { ad },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update ad
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const updateData: UpdateAdInput = req.body;

      // Get ad
      const ad = await AdModel.findById(id);
      if (!ad) {
        throw NotFoundError(CONSTANTS.ERROR_MESSAGES.AD_NOT_FOUND);
      }

      // Check ownership
      if (ad.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        throw ForbiddenError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      // Only allow editing if in draft or rejected status
      if (!['draft', 'rejected'].includes(ad.status)) {
        throw ValidationError('Can only edit ads in draft or rejected status');
      }

      // Update slug if title changed
      const updatedData = {
        ...updateData,
        ...(updateData.title && { slug: generateUniqueSlug(updateData.title) }),
      };

      const updated = await AdModel.update(id, updatedData);

      res.json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.AD_UPDATED,
        data: { ad: updated },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit ad for review
   */
  async submit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const ad = await AdModel.findById(id);
      if (!ad) {
        throw NotFoundError(CONSTANTS.ERROR_MESSAGES.AD_NOT_FOUND);
      }

      if (ad.user_id !== req.user.id) {
        throw ForbiddenError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      if (ad.status !== 'draft') {
        throw ValidationError('Only draft ads can be submitted');
      }

      const updated = await AdModel.update(id, {
        status: 'submitted',
        submitted_at: new Date(),
      });

      res.json({
        success: true,
        message: CONSTANTS.SUCCESS_MESSAGES.AD_SUBMITTED,
        data: { ad: updated },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user ads
   */
  async getUserAds(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { ads, total } = await AdModel.findByUserId(req.user.id, page, limit);

      res.json({
        success: true,
        data: { ads },
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
   * Search/Filter ads (public)
   */
  async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters: FilterAdsInput = {
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        cityId: req.query.cityId as string,
        isFeatured: req.query.isFeatured === 'true',
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sortBy: (req.query.sortBy as any) || 'newest',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const { ads, total } = await AdModel.search(filters);

      res.json({
        success: true,
        data: { ads },
        meta: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit!),
        },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete ad
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const ad = await AdModel.findById(id);
      if (!ad) {
        throw NotFoundError(CONSTANTS.ERROR_MESSAGES.AD_NOT_FOUND);
      }

      if (ad.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        throw ForbiddenError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      await AdModel.delete(id);

      res.json({
        success: true,
        message: 'Ad deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  },
};

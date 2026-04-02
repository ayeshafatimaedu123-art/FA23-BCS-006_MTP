// Ad Model - Database queries
import { supabase } from '../config/database';
import { Ad, AdFilters } from '../../shared/types';

export const AdModel = {
  /**
   * Create ad
   */
  async create(adData: Partial<Ad>): Promise<Ad> {
    const { data, error } = await supabase.from('ads').insert([adData]).select().single();

    if (error) throw new Error(`Failed to create ad: ${error.message}`);
    return data;
  },

  /**
   * Find ad by ID with full details
   */
  async findById(id: string): Promise<Ad | null> {
    const { data, error } = await supabase
      .from('ads')
      .select(
        `
        *,
        category:categories(*),
        city:cities(*),
        package:packages(*),
        user:users(id, email, first_name, last_name, company_name, profile_image_url),
        media:ad_media(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find ad: ${error.message}`);
    return data;
  },

  /**
   * Find ad by slug
   */
  async findBySlug(slug: string): Promise<Ad | null> {
    const { data, error } = await supabase
      .from('ads')
      .select(
        `
        *,
        category:categories(*),
        city:cities(*),
        package:packages(*),
        user:users(id, email, first_name, last_name, company_name, profile_image_url),
        media:ad_media(*)
      `,
      )
      .eq('slug', slug)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find ad: ${error.message}`);
    return data;
  },

  /**
   * Update ad
   */
  async update(id: string, adData: Partial<Ad>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .update(adData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update ad: ${error.message}`);
    return data;
  },

  /**
   * Get ads with filters and pagination
   */
  async search(filters: AdFilters): Promise<{ ads: Ad[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase.from('active_ads_view').select(
      `
      *,
      category:categories(*),
      city:cities(*),
      user:users(*)
    `,
      { count: 'exact' },
    );

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.cityId) {
      query = query.eq('city_id', filters.cityId);
    }
    if (filters.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    // Apply sorting
    const sortOrder = filters.sortBy === 'newest' ? { column: 'published_at', ascending: false } : undefined;
    if (sortOrder) {
      query = query.order(sortOrder.column, { ascending: sortOrder.ascending });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to search ads: ${error.message}`);
    return {
      ads: data || [],
      total: count || 0,
    };
  },

  /**
   * Get ads by user
   */
  async findByUserId(userId: string, page: number = 1, limit: number = 20): Promise<{ ads: Ad[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('ads')
      .select('*, media:ad_media(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch user ads: ${error.message}`);
    return {
      ads: data || [],
      total: count || 0,
    };
  },

  /**
   * Get ads by status
   */
  async findByStatus(status: string, page: number = 1, limit: number = 20): Promise<{ ads: Ad[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('ads')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch ads by status: ${error.message}`);
    return {
      ads: data || [],
      total: count || 0,
    };
  },

  /**
   * Delete ad
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('ads').delete().eq('id', id);

    if (error) throw new Error(`Failed to delete ad: ${error.message}`);
  },
};

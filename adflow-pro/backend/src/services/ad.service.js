/**
 * Ad Service
 * Handles ads business logic
 */

import supabase from '../config/database.js';
import { createSlug } from '../utils/string.js';
import { createNotFoundError, createValidationError } from '../utils/errors.js';
import { AD_STATUS } from '../config/constants.js';

/**
 * Create ad
 */
export const createAd = async (userId, data) => {
  const slug = createSlug(data.title);
  
  const { data: ad, error } = await supabase
    .from('ads')
    .insert([{
      user_id: userId,
      title: data.title,
      description: data.description,
      slug,
      category_id: data.categoryId,
      city_id: data.cityId,
      price: data.price,
      package_id: data.packageId,
      status: AD_STATUS.DRAFT,
      contact: data.contact,
      metadata: data.metadata
    }])
    .select()
    .single();
  
  if (error) {
    throw new Error('Failed to create ad');
  }
  
  // Add media
  if (data.media && data.media.length > 0) {
    const mediaToInsert = data.media.map((m, idx) => ({
      ad_id: ad.id,
      type: m.type,
      url: m.url,
      is_primary: m.isPrimary || idx === 0
    }));
    
    await supabase.from('ad_media').insert(mediaToInsert);
  }
  
  return ad;
};

/**
 * Get ad by ID
 */
export const getAdById = async (adId) => {
  const { data: ad, error } = await supabase
    .from('ads')
    .select(`
      *,
      category:categories(*),
      city:cities(*),
      package:packages(*),
      user:users(id, email, first_name, last_name),
      media:ad_media(*)
    `)
    .eq('id', adId)
    .single();
  
  if (error || !ad) {
    throw createNotFoundError('Ad');
  }
  
  return ad;
};

/**
 * Get ad by slug
 */
export const getAdBySlug = async (slug) => {
  const { data: ad, error } = await supabase
    .from('ads')
    .select(`
      *,
      category:categories(*),
      city:cities(*),
      package:packages(*),
      user:users(id, email, first_name, last_name),
      media:ad_media(*)
    `)
    .eq('slug', slug)
    .eq('status', AD_STATUS.PUBLISHED)
    .single();
  
  if (error || !ad) {
    throw createNotFoundError('Ad');
  }
  
  return ad;
};

/**
 * Search ads with filters
 */
export const searchAds = async (filters) => {
  let query = supabase
    .from('ads')
    .select(`
      *,
      category:categories(name),
      city:cities(name),
      package:packages(name),
      user:users(id, first_name, last_name),
      media:ad_media(is_primary)
    `, { count: 'exact' })
    .eq('status', AD_STATUS.PUBLISHED);
  
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  
  if (filters.cityId) {
    query = query.eq('city_id', filters.cityId);
  }
  
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }
  
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  // Sorting
  if (filters.sort === 'price_low') {
    query = query.order('price', { ascending: true });
  } else if (filters.sort === 'price_high') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: filters.sort === 'oldest' });
  }
  
  // Pagination
  const from = (filters.page - 1) * filters.limit;
  query = query.range(from, from + filters.limit - 1);
  
  const { data: ads, error, count } = await query;
  
  if (error) {
    throw new Error('Failed to search ads');
  }
  
  return {
    ads: ads || [],
    total: count || 0,
    page: filters.page,
    limit: filters.limit
  };
};

/**
 * Update ad
 */
export const updateAd = async (adId, userId, data) => {
  const ad = await getAdById(adId);
  
  if (ad.user_id !== userId) {
    throw new Error('Unauthorized');
  }
  
  const { data: updated, error } = await supabase
    .from('ads')
    .update({
      title: data.title,
      description: data.description,
      price: data.price,
      category_id: data.categoryId,
      city_id: data.cityId,
      package_id: data.packageId
    })
    .eq('id', adId)
    .select()
    .single();
  
  if (error) {
    throw new Error('Failed to update ad');
  }
  
  return updated;
};

/**
 * Delete ad
 */
export const deleteAd = async (adId, userId) => {
  const ad = await getAdById(adId);
  
  if (ad.user_id !== userId) {
    throw new Error('Unauthorized');
  }
  
  const { error } = await supabase
    .from('ads')
    .delete()
    .eq('id', adId);
  
  if (error) {
    throw new Error('Failed to delete ad');
  }
  
  return { success: true };
};

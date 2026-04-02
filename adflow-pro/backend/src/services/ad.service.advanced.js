/**
 * Advanced Ad Service
 * Handles ads business logic with ranking, media, and status workflow
 * Integrates: ranking.service, media.service, workflow.service
 */

const { createSlug } = require('../utils/string');
const { createNotFoundError, createValidationError } = require('../utils/errors');
const { CONSTANTS } = require('../config/constants');

// Import advanced services
const rankingService = require('./ranking.service');
const mediaService = require('./media.service');
const workflowService = require('./workflow.service');

/**
 * Create ad with advanced features
 * - Validates media
 * - Sets initial status to draft
 * - Prepares for workflow
 * 
 * @param {string} userId - User ID
 * @param {Object} data - Ad data {title, description, price, categoryId, cityId, packageType, media}
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} Created ad
 */
const createAdAdvanced = async (userId, data, supabase) => {
  // Validate media first
  const mediaValidation = await mediaService.validateMediaArray(data.media || []);
  if (!mediaValidation.valid) {
    throw createValidationError(mediaValidation.errors.join(', '));
  }

  // Process media items to get thumbnails, validate URLs
  const processedMedia = await mediaService.processMediaBatch(data.media || []);
  
  const slug = createSlug(data.title);

  const adData = {
    user_id: userId,
    title: data.title,
    description: data.description,
    slug,
    category_id: data.categoryId,
    city_id: data.cityId,
    price: data.price,
    package_type: data.packageType || 'standard',
    status: 'draft', // Always start as draft
    is_featured: false,
    admin_boost: 0,
    view_count: 0,
    offer_count: 0,
    flag_count: 0,
    rejection_count: 0,
    media_count: processedMedia.length,
    expires_at: null, // Set when published
    payment_verified: false,
    ranking_score: 0
  };

  const { data: ad, error } = await supabase
    .from('ads')
    .insert([adData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ad: ${error.message}`);
  }

  // Add processed media items
  if (processedMedia.length > 0) {
    const mediaToInsert = processedMedia.map((m, idx) => ({
      ad_id: ad.id,
      type: m.type,
      url: m.originalUrl,
      thumbnail_url: m.thumbnailUrl || m.displayUrl || m.imageUrl,
      is_primary: idx === 0 || m.isPrimary,
      embed_url: m.embedUrl || null,
      video_id: m.videoId || null,
      has_errors: m.errors?.length > 0,
      error_message: m.errors?.join(', ') || null
    }));

    await supabase.from('ad_media').insert(mediaToInsert);
  }

  // Create initial status history entry
  await supabase.from('ad_status_history').insert([{
    ad_id: ad.id,
    from_status: null,
    to_status: 'draft',
    changed_by: userId,
    reason: 'Ad created',
    changed_at: new Date()
  }]);

  return { ...ad, media: processedMedia };
};

/**
 * Get ad with all enriched data
 * Includes ranking score, workflow info, media processing
 * 
 * @param {string} adId - Ad ID
 * @param {Object} supabase - Supabase client
 * @param {Array} allCategoryAds - Optional: all ads in category for ranking
 * @returns {Promise<Object>} Enriched ad object
 */
const getAdByIdAdvanced = async (adId, supabase, allCategoryAds = []) => {
  const { data: ad, error } = await supabase
    .from('ads')
    .select(`
      *,
      user:users(id, email, first_name, last_name, rating),
      category:categories(id, name),
      city:cities(id, name),
      package:packages(id, name, price),
      media:ad_media(*)
    `)
    .eq('id', adId)
    .single();

  if (error || !ad) {
    throw createNotFoundError('Ad');
  }

  // Enrich with advanced features
  return enrichAdData(ad, allCategoryAds);
};

/**
 * Get published ad by slug (for public viewing)
 * Only returns published ads that aren't expired
 * 
 * @param {string} slug - Ad slug
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} Published ad
 */
const getAdBySlugAdvanced = async (slug, supabase) => {
  const { data: ad, error } = await supabase
    .from('ads')
    .select(`
      *,
      user:users(id, email, first_name, last_name, rating, verified),
      category:categories(id, name),
      city:cities(id, name),
      package:packages(id, name, price),
      media:ad_media(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !ad) {
    throw createNotFoundError('Published ad');
  }

  // Check if expired
  if (workflowService.isAdExpired(ad)) {
    throw createNotFoundError('Ad has expired');
  }

  // Increment view count
  await supabase
    .from('ads')
    .update({ view_count: (ad.view_count || 0) + 1 })
    .eq('id', ad.id);

  return enrichAdData(ad);
};

/**
 * Search ads with advanced features
 * Includes ranking, filtering, only shows active published ads
 * 
 * @param {Object} filters - {search, categoryId, cityId, minPrice, maxPrice, sort, page, limit}
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} {ads, total, page, limit}
 */
const searchAdsAdvanced = async (filters, supabase) => {
  let query = supabase
    .from('ads')
    .select(`
      *,
      user:users(id, first_name, last_name),
      category:categories(name),
      city:cities(name),
      package:packages(name, price),
      media:ad_media(*)
    `, { count: 'exact' })
    .eq('status', 'published');

  // Filter: Only show non-expired ads
  query = query.gt('expires_at', new Date().toISOString());

  // Category filter
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  // City filter
  if (filters.cityId) {
    query = query.eq('city_id', filters.cityId);
  }

  // Price range filters
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  // Search filter (title + description)
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Sorting - by ranking/trend/newest/price
  if (filters.sort === 'trending') {
    query = query.order('ranking_score', { ascending: false });
  } else if (filters.sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (filters.sort === 'price_low') {
    query = query.order('price', { ascending: true });
  } else if (filters.sort === 'price_high') {
    query = query.order('price', { ascending: false });
  } else if (filters.sort === 'featured') {
    query = query.eq('is_featured', true)
      .order('ranking_score', { ascending: false });
  } else {
    query = query.order('ranking_score', { ascending: false }); // Default: trending
  }

  // Pagination
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100); // Max 100
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data: ads, error, count } = await query;

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  // Enrich ads with media and workflow info
  const enrichedAds = (ads || []).map(ad => enrichAdData(ad));

  return {
    ads: enrichedAds,
    total: count || 0,
    page,
    limit,
    hasMore: from + limit < (count || 0)
  };
};

/**
 * Submit ad for review
 * Transitions from draft -> submitted
 * 
 * @param {string} adId - Ad ID
 * @param {string} userId - User ID
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} Updated ad
 */
const submitAdForReview = async (adId, userId, supabase) => {
  const { data: ad, error: fetchError } = await supabase
    .from('ads')
    .select('*')
    .eq('id', adId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !ad) {
    throw createNotFoundError('Ad');
  }

  // Check if current status can transition
  if (!workflowService.isValidTransition(ad.status, 'submitted')) {
    throw createValidationError(
      `Cannot submit ad that is in ${ad.status} status`
    );
  }

  // Check requirements
  const requirements = workflowService.getRequirementsForStatus(ad, 'submitted');
  const unmetRequirements = requirements.filter(r => !r.met);
  
  if (unmetRequirements.length > 0) {
    throw createValidationError(
      `Requirements not met: ${unmetRequirements.map(r => r.requirement).join(', ')}`
    );
  }

  // Transition status
  const { data: updated, error: updateError } = await supabase
    .from('ads')
    .update({
      status: 'submitted',
      updated_at: new Date()
    })
    .eq('id', adId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to submit ad: ${updateError.message}`);
  }

  // Record status transition
  await supabase.from('ad_status_history').insert([{
    ad_id: adId,
    from_status: ad.status,
    to_status: 'submitted',
    changed_by: userId,
    reason: 'Ad submitted by user',
    changed_at: new Date()
  }]);

  return updated;
};

/**
 * Publish ad (after payment)
 * Transitions to published and sets expiry
 * 
 * @param {string} adId - Ad ID
 * @param {Object} supabase - Supabase client
 * @param {Object} packageInfo - Package info {duration_days, name}
 * @returns {Promise<Object>} Published ad with expiry
 */
const publishAd = async (adId, supabase, packageInfo) => {
  const { data: ad, error: fetchError } = await supabase
    .from('ads')
    .select('*')
    .eq('id', adId)
    .single();

  if (fetchError || !ad) {
    throw createNotFoundError('Ad');
  }

  // Calculate expiry date based on package (usually 30 days)
  const durationDays = packageInfo?.duration_days || 30;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  // Calculate initial ranking score
  const rankingScore = rankingService.calculateRankingScore(ad);

  const { data: published, error: updateError } = await supabase
    .from('ads')
    .update({
      status: 'published',
      expires_at: expiresAt,
      payment_verified: true,
      ranking_score: rankingScore,
      updated_at: new Date()
    })
    .eq('id', adId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to publish ad: ${updateError.message}`);
  }

  // Record status transition
  await supabase.from('ad_status_history').insert([{
    ad_id: adId,
    from_status: ad.status,
    to_status: 'published',
    reason: `Published after payment (expires ${durationDays} days)`,
    changed_at: new Date()
  }]);

  return published;
};

/**
 * Renew expired ad
 * Extends expiry date for another period
 * 
 * @param {string} adId - Ad ID
 * @param {string} userId - User ID
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} Renewed ad
 */
const renewAd = async (adId, userId, supabase) => {
  const { data: ad, error: fetchError } = await supabase
    .from('ads')
    .select('*')
    .eq('id', adId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !ad) {
    throw createNotFoundError('Ad');
  }

  // Check if expired
  if (!workflowService.isAdExpired(ad)) {
    throw createValidationError('Ad is still active, no need to renew');
  }

  // Calculate new expiry (30 days from now)
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 30);

  const { data: renewed, error: updateError } = await supabase
    .from('ads')
    .update({
      status: 'published',
      expires_at: newExpiresAt,
      updated_at: new Date()
    })
    .eq('id', adId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to renew ad: ${updateError.message}`);
  }

  return renewed;
};

/**
 * Approve ad (moderator action)
 * Transitions from submitted -> approved
 * 
 * @param {string} adId - Ad ID
 * @param {string} moderatorId - Moderator user ID
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} Approved ad
 */
const approveAd = async (adId, moderatorId, supabase) => {
  const { data: ad, error: fetchError } = await supabase
    .from('ads')
    .select('*')
    .eq('id', adId)
    .single();

  if (fetchError || !ad) {
    throw createNotFoundError('Ad');
  }

  if (ad.status !== 'under_review') {
    throw createValidationError('Only ads under review can be approved');
  }

  const { data: approved, error: updateError } = await supabase
    .from('ads')
    .update({
      status: 'awaiting_payment',
      updated_at: new Date()
    })
    .eq('id', adId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to approve ad: ${updateError.message}`);
  }

  // Record status transition
  await supabase.from('ad_status_history').insert([{
    ad_id: adId,
    from_status: ad.status,
    to_status: 'awaiting_payment',
    changed_by: moderatorId,
    reason: 'Approved by moderator',
    changed_at: new Date()
  }]);

  return approved;
};

/**
 * Reject ad (moderator action)
 * 
 * @param {string} adId - Ad ID
 * @param {string} moderatorId - Moderator user ID
 * @param {string} reason - Rejection reason
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} Rejected ad
 */
const rejectAd = async (adId, moderatorId, reason, supabase) => {
  const { data: ad, error: fetchError } = await supabase
    .from('ads')
    .select('*')
    .eq('id', adId)
    .single();

  if (fetchError || !ad) {
    throw createNotFoundError('Ad');
  }

  if (ad.status !== 'under_review') {
    throw createValidationError('Only ads under review can be rejected');
  }

  const { data: rejected, error: updateError } = await supabase
    .from('ads')
    .update({
      status: 'rejected',
      rejection_count: (ad.rejection_count || 0) + 1,
      updated_at: new Date()
    })
    .eq('id', adId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to reject ad: ${updateError.message}`);
  }

  // Record status transition
  await supabase.from('ad_status_history').insert([{
    ad_id: adId,
    from_status: ad.status,
    to_status: 'rejected',
    changed_by: moderatorId,
    reason: `Rejected: ${reason}`,
    changed_at: new Date()
  }]);

  return rejected;
};

/**
 * Update ranking scores for ads (batch operation)
 * Should be run periodically (e.g., hourly cron job)
 * 
 * @param {Object} supabase - Supabase client
 * @param {number} limit - Max ads to update per call
 * @returns {Promise<Object>} {updated: number, errors: Array}
 */
const updateRankingScores = async (supabase, limit = 100) => {
  const { data: ads, error: fetchError } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'published')
    .limit(limit);

  if (fetchError) {
    throw new Error(`Failed to fetch ads for ranking: ${fetchError.message}`);
  }

  const updates = ads.map(ad => ({
    id: ad.id,
    ranking_score: rankingService.calculateRankingScore(ad)
  }));

  let successCount = 0;
  const errors = [];

  for (const update of updates) {
    const { error } = await supabase
      .from('ads')
      .update({ ranking_score: update.ranking_score })
      .eq('id', update.id);

    if (error) {
      errors.push(`Ad ${update.id}: ${error.message}`);
    } else {
      successCount++;
    }
  }

  return { updated: successCount, errors };
};

/**
 * Auto-expire old ads
 * Should be run daily as cron job
 * 
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} {expired: number, errors: Array}
 */
const expireOldAds = async (supabase) => {
  const now = new Date();

  const { data: expiredAds, error: fetchError } = await supabase
    .from('ads')
    .select('id, status, expires_at')
    .eq('status', 'published')
    .lt('expires_at', now.toISOString());

  if (fetchError) {
    throw new Error(`Failed to fetch expired ads: ${fetchError.message}`);
  }

  let expiredCount = 0;
  const errors = [];

  for (const ad of expiredAds) {
    const { error } = await supabase
      .from('ads')
      .update({ status: 'expired' })
      .eq('id', ad.id);

    if (error) {
      errors.push(`Ad ${ad.id}: ${error.message}`);
    } else {
      expiredCount++;

      // Record status transition
      await supabase.from('ad_status_history').insert([{
        ad_id: ad.id,
        from_status: 'published',
        to_status: 'expired',
        reason: 'Auto-expired by system',
        changed_at: new Date()
      }]);
    }
  }

  return { expired: expiredCount, errors };
};

/**
 * Enrich ad data with advanced features
 * Adds ranking, workflow, media info
 * 
 * @param {Object} ad - Raw ad from database
 * @param {Array} categoryAds - Optional: ads in same category
 * @returns {Object} Enriched ad
 */
const enrichAdData = (ad, categoryAds = []) => {
  if (!ad) return null;

  // Calculate ranking insights
  const rankingInsights = rankingService.getRankingInsights(ad, categoryAds);

  // Get media primary thumbnail
  const primaryThumbnail = mediaService.getPrimaryThumbnail(ad.media || []);

  // Get workflow info
  const expiryBadge = workflowService.getExpiryBadge(ad);
  const workflowStep = workflowService.getWorkflowStep(ad.status);
  const validNextStatuses = workflowService.getValidNextStatuses(ad.status);
  const allowedActions = workflowService.getAllowedActions(ad.status);

  return {
    ...ad,
    ranking: rankingInsights,
    primaryThumbnail,
    workflow: {
      step: workflowStep,
      nextStatuses: validNextStatuses,
      allowedActions,
      expiryBadge,
      statusColor: workflowService.getStatusColor(ad.status),
      statusIcon: workflowService.getStatusIcon(ad.status),
      statusExplanation: workflowService.getStatusExplanation(ad.status),
      daysUntilExpiry: workflowService.getDaysUntilExpiry(ad)
    }
  };
};

module.exports = {
  // Create operations
  createAdAdvanced,

  // Read operations
  getAdByIdAdvanced,
  getAdBySlugAdvanced,
  searchAdsAdvanced,

  // Workflow transitions
  submitAdForReview,
  publishAd,
  renewAd,
  approveAd,
  rejectAd,

  // Maintenance operations
  updateRankingScores,
  expireOldAds,

  // Utilities
  enrichAdData
};

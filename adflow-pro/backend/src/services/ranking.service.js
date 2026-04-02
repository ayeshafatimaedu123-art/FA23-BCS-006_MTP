/**
 * Ranking Service - Calculate ad visibility scores
 * Implements sophisticated ranking algorithm for marketplace
 */

const { CONSTANTS } = require('../config/constants');

/**
 * Calculate comprehensive ranking score for an ad
 * Formula: baseScore + packageBoost + freshnessScore + adminBoost + engagementBoost
 * 
 * @param {Object} ad - Ad object with all properties
 * @returns {number} Final ranking score (0-1000)
 */
function calculateRankingScore(ad) {
  let score = 0;

  // 1. Featured Status Bonus (0-50 points)
  if (ad.is_featured) {
    score += 50;
  }

  // 2. Package Weight Bonus (0-30 points)
  const packageWeights = {
    'basic': 5,
    'standard': 15,
    'premium': 25,
    'platinum': 30
  };
  score += packageWeights[ad.package_type] || 0;

  // 3. Freshness Score (0-200 points)
  // Ads created today get max points, decays over time
  const createdDate = new Date(ad.created_at);
  const daysSinceCreation = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const freshnessScore = Math.max(0, 200 - (daysSinceCreation * 10));
  score += freshnessScore;

  // 4. Admin Boost (0-100 points)
  // Set by admin to manually promote ads
  score += (ad.admin_boost || 0);

  // 5. Engagement Boost (0-150 points)
  // Based on views, offers, ratings
  const views = ad.view_count || 0;
  const offers = ad.offer_count || 0;
  const rating = ad.rating || 0;

  const engagementScore = (
    Math.min(views / 100 * 50, 50) +        // Max 50 for views
    Math.min(offers / 10 * 50, 50) +        // Max 50 for offers
    (rating * 10)                            // Max 50 for rating (5.0 * 10)
  );
  score += engagementScore;

  // 6. Category Popularity Boost (0-100 points)
  // Popular categories get slight boost
  const categoryBoosts = {
    'electronics': 20,
    'vehicles': 30,
    'real-estate': 25,
    'services': 15,
    'fashion': 10,
    'other': 5
  };
  score += (categoryBoosts[ad.category_id] || 0);

  // 7. Location Boost (0-50 points)
  // Allow admin to boost popular cities
  const cityBoosts = {
    'karachi': 20,
    'lahore': 20,
    'islamabad': 20,
    'peshwar': 10,
    'quetta': 5
  };
  score += (cityBoosts[ad.city_id?.toLowerCase()] || 0);

  // Penalties (negative points)
  
  // 8. Flagged Content Penalty (-200 points each flag)
  const flagCount = ad.flag_count || 0;
  score -= flagCount * 200;

  // 9. Rejection Penalty (-100 points)
  if (ad.rejection_count > 0) {
    score -= ad.rejection_count * 100;
  }

  // 10. Low Quality Penalty (-50 points)
  // If no images or incomplete description
  if (!ad.media_count || ad.media_count === 0) {
    score -= 50;
  }
  if (!ad.description || ad.description.length < 50) {
    score -= 30;
  }

  // Ensure score stays within valid range
  return Math.max(0, Math.min(score, 1000));
}

/**
 * Batch calculate ranking scores for multiple ads
 * 
 * @param {Array} ads - Array of ad objects
 * @returns {Array} Ads with ranking scores added
 */
function calculateBatchRankingScores(ads) {
  return ads.map(ad => ({
    ...ad,
    ranking_score: calculateRankingScore(ad)
  }));
}

/**
 * Sort ads by ranking (best first)
 * 
 * @param {Array} ads - Array of ads
 * @param {string} sortBy - 'trending', 'newest', 'price-low', 'price-high'
 * @returns {Array} Sorted ads
 */
function sortByRanking(ads, sortBy = 'trending') {
  const sorted = [...ads];

  switch (sortBy) {
    case 'trending':
      // Sort by ranking score descending
      return sorted.sort((a, b) => 
        (b.ranking_score || 0) - (a.ranking_score || 0)
      );

    case 'newest':
      // Sort by created date descending
      return sorted.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

    case 'price-low':
      // Sort by price ascending
      return sorted.sort((a, b) => a.price - b.price);

    case 'price-high':
      // Sort by price descending
      return sorted.sort((a, b) => b.price - a.price);

    default:
      return sorted;
  }
}

/**
 * Get ranking percentile for an ad
 * Shows how it ranks compared to other ads in category
 * 
 * @param {number} score - Ad's ranking score
 * @param {Array} allAds - All ads in category
 * @returns {number} Percentile (0-100)
 */
function getRankingPercentile(score, allAds) {
  const scores = allAds.map(ad => ad.ranking_score || 0).sort((a, b) => a - b);
  const position = scores.filter(s => s < score).length;
  return Math.round((position / scores.length) * 100);
}

/**
 * Calculate freshness score (0-100) for UI display
 * 
 * @param {Date} createdDate - Date ad was created
 * @returns {number} Freshness score (0-100)
 */
function getFreshnessScore(createdDate) {
  const daysSince = Math.floor(
    (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince === 0) return 100;      // Today
  if (daysSince === 1) return 90;       // Yesterday
  if (daysSince <= 7) return 70;        // This week
  if (daysSince <= 30) return 50;       // This month
  if (daysSince <= 90) return 30;       // Last 3 months
  return 10;                             // Older
}

/**
 * Check if ad should be boosted (for featured placement)
 * 
 * @param {Object} ad - Ad object
 * @returns {boolean} Should boost?
 */
function shouldBoost(ad) {
  // Boost conditions:
  // 1. Premium/Platinum packages
  // 2. Not recently flagged
  // 3. High engagement
  // 4. High rating

  const isPremiumPackage = ['premium', 'platinum'].includes(ad.package_type);
  const noRecentFlags = (ad.flag_count || 0) < 2;
  const highEngagement = (ad.view_count || 0) > 50;
  const highRating = (ad.rating || 0) >= 4.0;

  return isPremiumPackage && noRecentFlags && (highEngagement || highRating);
}

/**
 * Get ranking insights for an ad (for dashboard display)
 * 
 * @param {Object} ad - Ad object
 * @param {Array} categoryAds - All ads in same category
 * @returns {Object} Insights object
 */
function getRankingInsights(ad, categoryAds = []) {
  const score = calculateRankingScore(ad);
  const percentile = getRankingPercentile(score, categoryAds);
  const freshness = getFreshnessScore(ad.created_at);
  const shouldBoost = shouldBoost(ad);

  return {
    score,
    percentile,
    freshness,
    shouldBoost,
    recommendations: generateRecommendations(ad),
    insights: {
      views: ad.view_count || 0,
      offers: ad.offer_count || 0,
      rating: ad.rating || 0,
      flags: ad.flag_count || 0,
      featured: ad.is_featured ? 'Yes' : 'No',
      package: ad.package_type,
      daysLive: Math.floor(
        (Date.now() - new Date(ad.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
    }
  };
}

/**
 * Generate optimization recommendations based on performance
 * 
 * @param {Object} ad - Ad object
 * @returns {Array} Array of recommendation strings
 */
function generateRecommendations(ad) {
  const recommendations = [];

  // Low views recommendation
  if ((ad.view_count || 0) < 10 && !ad.is_featured) {
    recommendations.push('💡 Upgrade to Featured to increase visibility');
  }

  // No images recommendation
  if ((ad.media_count || 0) === 0) {
    recommendations.push('📸 Add high-quality images to improve performance');
  }

  // Short description
  if (!ad.description || ad.description.length < 100) {
    recommendations.push('✍️ Write a more detailed description');
  }

  // High flag count
  if ((ad.flag_count || 0) >= 2) {
    recommendations.push('⚠️ Review content for policy violations');
  }

  // Old ad
  const daysSince = Math.floor(
    (Date.now() - new Date(ad.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince > 30) {
    recommendations.push('♻️ Refresh your ad to boost visibility');
  }

  // Good performance
  if ((ad.view_count || 0) > 100 && ad.rating > 4.0) {
    recommendations.push('🌟 Great ad! Keep maintaining this quality');
  }

  return recommendations;
}

module.exports = {
  calculateRankingScore,
  calculateBatchRankingScores,
  sortByRanking,
  getRankingPercentile,
  getFreshnessScore,
  shouldBoost,
  getRankingInsights,
  generateRecommendations
};

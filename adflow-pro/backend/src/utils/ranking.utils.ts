// Ad Ranking Utility
import { CONSTANTS } from '../config/constants';

export interface RankingFactors {
  isFeatured: boolean;
  packageWeight?: number; // 100-150 based on package tier
  adminBoost?: number; // 0-1000 manual boost by admin
  publishedAtDate: Date;
}

/**
 * Calculate ad rank score
 * Formula: (featured * 50) + packageWeight + freshness + adminBoost
 */
export const calculateRankScore = (factors: RankingFactors): number => {
  const { isFeatured, packageWeight = 100, adminBoost = 0, publishedAtDate } = factors;

  // Featured multiplier
  const featuredScore = isFeatured ? CONSTANTS.RANKING.FEATURED_MULTIPLIER : 0;

  // Freshness score (recent ads score higher)
  const daysOld = Math.floor((Date.now() - publishedAtDate.getTime()) / (1000 * 60 * 60 * 24));
  const freshnessScore = Math.max(0, 100 - daysOld * CONSTANTS.RANKING.FRESHNESS_DECAY_RATE);

  // Total rank
  const totalRank = featuredScore + packageWeight + freshnessScore + adminBoost;

  return Math.round(totalRank);
};

/**
 * Get package weight based on package tier
 */
export const getPackageWeight = (packageName: string): number => {
  const weights: Record<string, number> = {
    basic: 100,
    professional: 125,
    premium: 150,
    enterprise: 175,
  };

  return weights[packageName.toLowerCase()] || 100;
};

/**
 * Get boost multiplier based on admin priority
 */
export const getAdminBoostPercentage = (boostLevel: number): number => {
  // boostLevel: 0-10 -> 0-1000
  return Math.min(boostLevel * 100, CONSTANTS.RANKING.ADMIN_BOOST_MAX);
};

/**
 * Sort ads by rank score
 */
export const sortAdsByRank = <T extends { rankScore?: number }>(ads: T[]): T[] => {
  return [...ads].sort((a, b) => {
    const scoreA = a.rankScore || 0;
    const scoreB = b.rankScore || 0;
    return scoreB - scoreA; // Descending order
  });
};

/**
 * Group ads by rank tier
 */
export const groupAdsByRankTier = <T extends { rankScore?: number }>(ads: T[]): Record<string, T[]> => {
  const tiers: Record<string, T[]> = {
    premium: [], // 300+
    high: [], // 200-299
    medium: [], // 100-199
    low: [], // 0-99
  };

  for (const ad of ads) {
    const score = ad.rankScore || 0;
    if (score >= 300) tiers.premium.push(ad);
    else if (score >= 200) tiers.high.push(ad);
    else if (score >= 100) tiers.medium.push(ad);
    else tiers.low.push(ad);
  }

  return tiers;
};

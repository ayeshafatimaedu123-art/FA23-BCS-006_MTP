// String Utility Functions
import { CONSTANTS } from '../config/constants';

/**
 * Convert string to slug
 * Example: "Hello World!" -> "hello-world"
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate unique slug with timestamp
 */
export const generateUniqueSlug = (text: string): string => {
  const slug = createSlug(text);
  const timestamp = Date.now().toString(36);
  return slug ? `${slug}-${timestamp}` : timestamp;
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  return CONSTANTS.EMAIL_REGEX.test(email);
};

/**
 * Validate phone
 */
export const isValidPhone = (phone: string): boolean => {
  return CONSTANTS.PHONE_REGEX.test(phone);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate and extract YouTube video ID
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!CONSTANTS.YOUTUBE_REGEX.test(url)) {
    return null;
  }

  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com.*[?&]v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generate YouTube thumbnail URL
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' = 'high'): string => {
  const qualities = {
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
  return qualities[quality];
};

/**
 * Generate placeholder image
 */
export const getPlaceholderImage = (width: number = 300, height: number = 300, text: string = 'No Image'): string => {
  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/${width}x${height}?text=${encodedText}`;
};

/**
 * Capitalize first letter
 */
export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

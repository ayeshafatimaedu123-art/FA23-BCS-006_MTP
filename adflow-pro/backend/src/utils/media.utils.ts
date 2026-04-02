// Media Utility Functions
import { CONSTANTS } from '../config/constants';
import { extractYouTubeVideoId, getYouTubeThumbnail, isValidUrl } from './string.utils';
import axios from 'axios';

export interface MediaValidation {
  valid: boolean;
  errors: string[];
  mediaType?: 'image' | 'video' | 'youtube';
  thumbnailUrl?: string;
}

/**
 * Validate media URL
 */
export const validateMediaUrl = async (url: string): Promise<MediaValidation> => {
  const errors: string[] = [];

  // Check if URL is valid
  if (!isValidUrl(url)) {
    errors.push('Invalid URL format');
    return { valid: false, errors };
  }

  try {
    // Check if URL is accessible
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
    });

    if (response.status !== 200) {
      errors.push('URL is not accessible');
    }
  } catch (error) {
    errors.push('Cannot reach URL - link may be broken or blocked');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Detect media type
  const mediaType = detectMediaType(url);
  let thumbnailUrl: string | undefined;

  if (mediaType === 'youtube') {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      thumbnailUrl = getYouTubeThumbnail(videoId);
    }
  }

  return {
    valid: true,
    errors: [],
    mediaType: mediaType as any,
    thumbnailUrl,
  };
};

/**
 * Detect media type from URL
 */
export const detectMediaType = (url: string): 'image' | 'video' | 'youtube' | 'unknown' => {
  const lowerUrl = url.toLowerCase();

  // YouTube detection
  if (CONSTANTS.YOUTUBE_REGEX.test(lowerUrl)) {
    return 'youtube';
  }

  // Check URL extension
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  for (const ext of videoExtensions) {
    if (lowerUrl.includes(ext)) return 'video';
  }

  for (const ext of imageExtensions) {
    if (lowerUrl.includes(ext)) return 'image';
  }

  // Check common video hosting sites
  const videoHosts = ['vimeo.com', 'dailymotion.com', 'twitch.tv', 'mixer.com'];
  for (const host of videoHosts) {
    if (lowerUrl.includes(host)) return 'video';
  }

  // Default fallback
  return 'unknown';
};

/**
 * Get media thumbnail or placeholder
 */
export const getMediaThumbnail = (
  url: string,
  mediaType: 'image' | 'video' | 'youtube' = 'image',
): string => {
  if (mediaType === 'youtube') {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return getYouTubeThumbnail(videoId);
    }
  }

  if (mediaType === 'image') {
    return url;
  }

  // For video, return placeholder
  return `https://via.placeholder.com/300x200?text=Video+Thumbnail`;
};

/**
 * Sort media by primary first
 */
export const sortMediaByPrimary = (
  media: Array<{ isPrimary: boolean; sortOrder?: number }>,
): typeof media => {
  return [...media].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) {
      return a.isPrimary ? -1 : 1;
    }
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
};

/**
 * Generate media embed code
 */
export const generateMediaEmbed = (
  url: string,
  mediaType: 'image' | 'video' | 'youtube' = 'image',
  options?: { width?: number; height?: number },
): string => {
  const w = options?.width || 600;
  const h = options?.height || 400;

  if (mediaType === 'youtube') {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `<iframe width="${w}" height="${h}" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }
  }

  if (mediaType === 'video') {
    return `<video width="${w}" height="${h}" controls><source src="${url}" type="video/mp4"></video>`;
  }

  // Image
  return `<img src="${url}" alt="Media" width="${w}" height="${h}" />`;
};

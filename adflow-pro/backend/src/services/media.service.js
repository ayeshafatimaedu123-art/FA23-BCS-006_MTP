/**
 * Media Handling Service - Process images, videos, and media
 * Includes YouTube detection, thumbnail generation, validation
 */

const axios = require('axios');

/**
 * Regex patterns for different media types
 */
const PATTERNS = {
  youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
  vimeo: /vimeo\.com\/(\d+)/,
  imageUrl: /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
  httpUrl: /^https?:\/\//
};

/**
 * Placeholder images for different scenarios
 */
const PLACEHOLDERS = {
  image: 'https://via.placeholder.com/400x300?text=Image%20Not%20Available',
  video: 'https://via.placeholder.com/400x300?text=Video%20Thumbnail',
  broken: 'https://via.placeholder.com/400x300?text=Broken%20Link',
  loading: 'https://via.placeholder.com/400x300?text=Loading...'
};

/**
 * Extract YouTube video ID from URL
 * 
 * @param {string} url - YouTube URL (various formats)
 * @returns {string|null} Video ID or null if not valid
 * 
 * @example
 * extractYouTubeVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ')
 * // Returns: 'dQw4w9WgXcQ'
 */
function extractYouTubeVideoId(url) {
  if (!url) return null;

  const match = url.match(PATTERNS.youtube);
  return match ? match[1] : null;
}

/**
 * Extract Vimeo video ID from URL
 * 
 * @param {string} url - Vimeo URL
 * @returns {string|null} Video ID or null
 */
function extractVimeoVideoId(url) {
  if (!url) return null;

  const match = url.match(PATTERNS.vimeo);
  return match ? match[1] : null;
}

/**
 * Generate YouTube thumbnail URL
 * Tries high-quality first, fallback to lower quality
 * 
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - 'maxres', 'sd', 'hq', 'mq', 'default'
 * @returns {string} Thumbnail URL
 * 
 * @example
 * getYouTubeThumbnail('dQw4w9WgXcQ')
 * // Returns: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
 */
function getYouTubeThumbnail(videoId, quality = 'maxres') {
  if (!videoId) return PLACEHOLDERS.video;

  const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];
  
  if (!qualities.includes(`${quality}default`)) {
    quality = 'maxres';
  }

  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Get Vimeo thumbnail URL
 * 
 * @param {string} videoId - Vimeo video ID
 * @returns {Promise<string>} Thumbnail URL
 */
async function getVimeoThumbnail(videoId) {
  try {
    const response = await axios.get(`https://vimeo.com/api/v2/video/${videoId}.json`);
    return response.data[0].thumbnail_large || PLACEHOLDERS.video;
  } catch (error) {
    console.error('Error fetching Vimeo thumbnail:', error.message);
    return PLACEHOLDERS.video;
  }
}

/**
 * Detect media type from URL
 * 
 * @param {string} url - Media URL
 * @returns {string} Media type: 'youtube', 'vimeo', 'image', or 'unknown'
 */
function detectMediaType(url) {
  if (!url) return 'unknown';

  if (PATTERNS.youtube.test(url)) return 'youtube';
  if (PATTERNS.vimeo.test(url)) return 'vimeo';
  if (PATTERNS.imageUrl.test(url)) return 'image';
  if (PATTERNS.httpUrl.test(url)) return 'unknown';

  return 'unknown';
}

/**
 * Validate if URL is accessible and returns valid media
 * 
 * @param {string} url - Media URL to validate
 * @param {boolean} checkExists - Actually check if URL responds
 * @returns {Promise<Object>} {valid: boolean, error: string|null, statusCode: number}
 */
async function validateMediaUrl(url, checkExists = true) {
  if (!url) {
    return { valid: false, error: 'URL is empty', statusCode: null };
  }

  if (!PATTERNS.httpUrl.test(url)) {
    return { valid: false, error: 'Invalid URL format', statusCode: null };
  }

  // Quick validation - check mime type format
  const type = detectMediaType(url);
  if (type === 'unknown' && !PATTERNS.httpUrl.test(url)) {
    return { valid: false, error: 'URL does not point to media', statusCode: null };
  }

  if (!checkExists) {
    return { valid: true, error: null, statusCode: 200 };
  }

  // Actually check if URL is accessible
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Check content type is media
    const contentType = response.headers['content-type'] || '';
    const isValidMedia = /image|video|octet-stream/.test(contentType);

    if (!isValidMedia) {
      return { 
        valid: false, 
        error: 'URL does not return media content', 
        statusCode: response.status 
      };
    }

    return { valid: true, error: null, statusCode: response.status };
  } catch (error) {
    return {
      valid: false,
      error: error.message || 'Could not validate URL',
      statusCode: error.response?.status || null
    };
  }
}

/**
 * Process media item (image or video)
 * Returns standardized media object with proper URLs and fallbacks
 * 
 * @param {Object} media - Media object {type, url, isPrimary}
 * @param {number} index - Position in media array
 * @returns {Promise<Object>} Processed media object
 */
async function processMediaItem(media, index = 0) {
  const processed = {
    id: media.id || `media-${index}`,
    type: detectMediaType(media.url),
    originalUrl: media.url,
    isPrimary: media.isPrimary || false,
    isProcessed: true,
    errors: []
  };

  try {
    switch (processed.type) {
      case 'youtube': {
        const videoId = extractYouTubeVideoId(media.url);
        if (videoId) {
          processed.videoId = videoId;
          processed.thumbnailUrl = getYouTubeThumbnail(videoId);
          processed.embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else {
          processed.errors.push('Invalid YouTube URL');
          processed.thumbnailUrl = PLACEHOLDERS.video;
        }
        break;
      }

      case 'vimeo': {
        const videoId = extractVimeoVideoId(media.url);
        if (videoId) {
          processed.videoId = videoId;
          processed.thumbnailUrl = await getVimeoThumbnail(videoId);
          processed.embedUrl = `https://player.vimeo.com/video/${videoId}`;
        } else {
          processed.errors.push('Invalid Vimeo URL');
          processed.thumbnailUrl = PLACEHOLDERS.video;
        }
        break;
      }

      case 'image': {
        const validation = await validateMediaUrl(media.url, false);
        if (validation.valid) {
          processed.imageUrl = media.url;
          processed.displayUrl = media.url;
        } else {
          processed.errors.push(validation.error || 'Invalid image URL');
          processed.displayUrl = PLACEHOLDERS.broken;
        }
        break;
      }

      default: {
        processed.errors.push('Unsupported media type');
        processed.displayUrl = PLACEHOLDERS.broken;
      }
    }
  } catch (error) {
    processed.errors.push(error.message);
    processed.displayUrl = PLACEHOLDERS.broken;
  }

  return processed;
}

/**
 * Batch process multiple media items
 * 
 * @param {Array} mediaArray - Array of media objects
 * @returns {Promise<Array>} Array of processed media
 */
async function processMediaBatch(mediaArray) {
  if (!mediaArray || mediaArray.length === 0) {
    return [];
  }

  const processed = await Promise.all(
    mediaArray.map((media, index) => processMediaItem(media, index))
  );

  return processed;
}

/**
 * Get primary image/thumbnail for ad
 * Returns the first valid thumbnail, fallback to placeholder
 * 
 * @param {Array} processedMedia - Array of processed media items
 * @returns {string} URL of thumbnail to display
 */
function getPrimaryThumbnail(processedMedia) {
  if (!processedMedia || processedMedia.length === 0) {
    return PLACEHOLDERS.image;
  }

  // Find primary media or first valid media
  const primary = processedMedia.find(m => m.isPrimary);
  const firstValid = processedMedia.find(m => !m.errors || m.errors.length === 0);
  const media = primary || firstValid || processedMedia[0];

  return media.thumbnailUrl || media.displayUrl || media.imageUrl || PLACEHOLDERS.image;
}

/**
 * Generate responsive image srcset
 * Used for optimized image loading
 * 
 * @param {string} imageUrl - Original image URL
 * @returns {string} Srcset string
 */
function generateImageSrcSet(imageUrl) {
  if (!imageUrl || !PATTERNS.imageUrl.test(imageUrl)) {
    return PLACEHOLDERS.image;
  }

  // For external images, return as-is
  // In production, you'd use image CDN like Cloudinary
  return imageUrl;
}

/**
 * Get backup thumbnails in case primary fails
 * 
 * @param {Array} processedMedia - Array of processed media
 * @returns {Array} Array of backup thumbnail URLs
 */
function getBackupThumbnails(processedMedia) {
  if (!processedMedia) return [];

  return processedMedia
    .filter(m => m.thumbnailUrl || m.displayUrl | m.imageUrl)
    .slice(1, 4)
    .map(m => m.thumbnailUrl || m.displayUrl || m.imageUrl)
    .filter(url => url && url !== PLACEHOLDERS.image);
}

/**
 * Check if media has errors
 * 
 * @param {Object} media - Processed media object
 * @returns {boolean} Has errors?
 */
function hasMediaErrors(media) {
  return media.errors && media.errors.length > 0;
}

/**
 * Get media error message for display
 * 
 * @param {Object} media - Processed media object
 * @returns {string} Error message or empty string
 */
function getMediaErrorMessage(media) {
  if (!media.errors || media.errors.length === 0) {
    return '';
  }
  return media.errors[0];
}

/**
 * Validate entire media array
 * 
 * @param {Array} mediaArray - Array of media objects
 * @returns {Promise<Object>} {valid: boolean, errors: Array}
 */
async function validateMediaArray(mediaArray) {
  if (!mediaArray || mediaArray.length === 0) {
    return { valid: false, errors: ['At least one media item is required'] };
  }

  if (mediaArray.length > 10) {
    return { valid: false, errors: ['Maximum 10 media items allowed'] };
  }

  const errors = [];
  let validCount = 0;

  for (const media of mediaArray) {
    const type = detectMediaType(media.url);
    
    if (type === 'unknown') {
      errors.push(`Invalid media URL: ${media.url}`);
    } else {
      validCount++;
    }
  }

  return {
    valid: validCount > 0 && errors.length === 0,
    errors,
    validCount,
    totalCount: mediaArray.length
  };
}

module.exports = {
  // Detection & Extraction
  extractYouTubeVideoId,
  extractVimeoVideoId,
  detectMediaType,

  // Validation
  validateMediaUrl,
  validateMediaArray,
  hasMediaErrors,
  getMediaErrorMessage,

  // Thumbnails & Processing
  getYouTubeThumbnail,
  getVimeoThumbnail,
  processMediaItem,
  processMediaBatch,
  getPrimaryThumbnail,
  getBackupThumbnails,

  // Image Optimization
  generateImageSrcSet,

  // Constants
  PLACEHOLDERS,
  PATTERNS
};

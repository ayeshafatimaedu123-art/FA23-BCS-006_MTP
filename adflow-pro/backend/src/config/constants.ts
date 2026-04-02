// Application Constants
export const CONSTANTS = {
  // Roles
  ROLES: {
    CLIENT: 'client',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  },

  // User Status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
  },

  // Ad Status
  AD_STATUS: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    REJECTED: 'rejected',
    PAYMENT_PENDING: 'payment_pending',
    PAYMENT_SUBMITTED: 'payment_submitted',
    VERIFIED: 'verified',
    PUBLISHED: 'published',
    EXPIRED: 'expired',
    ARCHIVED: 'archived',
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
    REFUNDED: 'refunded',
  },

  // Media Types
  MEDIA_TYPES: {
    IMAGE: 'image',
    VIDEO: 'video',
    YOUTUBE: 'youtube',
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    AD_APPROVED: 'ad_approved',
    AD_REJECTED: 'ad_rejected',
    PAYMENT_VERIFIED: 'payment_verified',
    PAYMENT_REJECTED: 'payment_rejected',
    AD_PUBLISHED: 'ad_published',
    AD_EXPIRED: 'ad_expired',
    SYSTEM_ALERT: 'system_alert',
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],

  // Token Expiry
  TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',

  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Email
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Phone (Basic international format)
  PHONE_REGEX: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,

  // URL Validation
  URL_REGEX: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,

  // Slug
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // YouTube URL formats
  YOUTUBE_REGEX: /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/.*$/,

  // Sorting options
  SORT_OPTIONS: ['newest', 'popular', 'price_asc', 'price_desc'],

  // Ranking Formula Parameters
  RANKING: {
    FEATURED_MULTIPLIER: 50,
    BASE_PACKAGE_WEIGHT: 100,
    FRESHNESS_DECAY_RATE: 2, // Points lost per day
    ADMIN_BOOST_MAX: 1000,
  },

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    DUPLICATE_EMAIL: 'Email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    SERVER_ERROR: 'Internal server error',
    INVALID_TOKEN: 'Invalid or expired token',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
    INVALID_AD_STATUS: 'Invalid ad status transition',
    AD_NOT_FOUND: 'Ad not found',
    USER_NOT_FOUND: 'User not found',
    PAYMENT_NOT_FOUND: 'Payment not found',
    CATEGORY_NOT_FOUND: 'Category not found',
    CITY_NOT_FOUND: 'City not found',
    PACKAGE_NOT_FOUND: 'Package not found',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    AD_CREATED: 'Ad created successfully',
    AD_UPDATED: 'Ad updated successfully',
    AD_SUBMITTED: 'Ad submitted for review',
    AD_APPROVED: 'Ad approved',
    AD_REJECTED: 'Ad rejected',
    AD_PUBLISHED: 'Ad published successfully',
    PAYMENT_VERIFIED: 'Payment verified successfully',
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
  },
};

// Access Control List (RBAC)
export const RBAC = {
  // Client permissions
  client: ['create_ad', 'edit_own_ad', 'delete_own_ad', 'view_own_ads', 'submit_payment'],

  // Moderator permissions
  moderator: ['review_ads', 'approve_ads', 'reject_ads', 'flag_media', 'view_review_queue'],

  // Admin permissions
  admin: [
    'verify_payments',
    'publish_ads',
    'unpublish_ads',
    'manage_categories',
    'manage_packages',
    'manage_cities',
    'manage_users',
    'view_analytics',
    'view_all_ads',
    'view_all_payments',
  ],

  // Super Admin - has all permissions
  super_admin: ['*'],
};

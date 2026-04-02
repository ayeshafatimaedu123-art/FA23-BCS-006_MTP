/**
 * Application Constants
 */

export const USER_ROLES = {
  CLIENT: 'client',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
  PENDING_VERIFICATION: 'pending_verification'
};

export const AD_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_SUBMITTED: 'payment_submitted',
  VERIFIED: 'verified',
  PUBLISHED: 'published',
  EXPIRED: 'expired'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  YOUTUBE: 'youtube'
};

export const PERMISSIONS = {
  // Client permissions
  CREATE_AD: 'create_ad',
  EDIT_OWN_AD: 'edit_own_ad',
  DELETE_OWN_AD: 'delete_own_ad',
  SUBMIT_AD: 'submit_ad',
  MAKE_PAYMENT: 'make_payment',
  VIEW_OWN_DASHBOARD: 'view_own_dashboard',
  
  // Moderator permissions
  REVIEW_ADS: 'review_ads',
  APPROVE_AD: 'approve_ad',
  REJECT_AD: 'reject_ad',
  FLAG_MEDIA: 'flag_media',
  VIEW_MODERATOR_DASHBOARD: 'view_moderator_dashboard',
  
  // Admin permissions
  VERIFY_PAYMENT: 'verify_payment',
  PUBLISH_AD: 'publish_ad',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  
  // Super Admin permissions
  MANAGE_EVERYTHING: 'manage_everything'
};

// Role-based permission matrix
export const ROLE_PERMISSIONS = {
  [USER_ROLES.CLIENT]: [
    PERMISSIONS.CREATE_AD,
    PERMISSIONS.EDIT_OWN_AD,
    PERMISSIONS.DELETE_OWN_AD,
    PERMISSIONS.SUBMIT_AD,
    PERMISSIONS.MAKE_PAYMENT,
    PERMISSIONS.VIEW_OWN_DASHBOARD
  ],
  [USER_ROLES.MODERATOR]: [
    PERMISSIONS.REVIEW_ADS,
    PERMISSIONS.APPROVE_AD,
    PERMISSIONS.REJECT_AD,
    PERMISSIONS.FLAG_MEDIA,
    PERMISSIONS.VIEW_MODERATOR_DASHBOARD
  ],
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VERIFY_PAYMENT,
    PERMISSIONS.PUBLISH_AD,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ADMIN_DASHBOARD
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    PERMISSIONS.MANAGE_EVERYTHING
  ]
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid token'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true
};

export const RANKING_CONFIG = {
  FEATURED_WEIGHT: 50,
  PACKAGE_WEIGHT: { basic: 1, standard: 5, premium: 10, platinum: 20 },
  FRESHNESS_DECAY: 0.1, // Per day
  ADMIN_BOOST_PERCENTAGE: 0.25 // 25% boost
};

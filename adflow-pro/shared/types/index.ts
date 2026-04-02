// ============================================
// SHARED TYPES & INTERFACES
// ============================================

// User Types
export type UserRole = 'client' | 'moderator' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  profileImageUrl?: string;
  companyName?: string;
  companyWebsite?: string;
  address?: string;
  cityId?: string;
  bio?: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'moderator';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Ad Types
export type AdStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'rejected'
  | 'payment_pending'
  | 'payment_submitted'
  | 'verified'
  | 'published'
  | 'expired'
  | 'archived';

export type MediaType = 'image' | 'video' | 'youtube';

export interface AdMedia {
  id: string;
  adId: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  isPrimary: boolean;
  sortOrder: number;
  isFlagged: boolean;
  flaggedReason?: string;
  flaggedBy?: string;
  flaggedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdRequest {
  title: string;
  description: string;
  categoryId: string;
  cityId: string;
  packageId?: string;
  price?: number;
  currency?: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  media: {
    url: string;
    mediaType: MediaType;
    title?: string;
    isPrimary: boolean;
  }[];
}

export interface Ad {
  id: string;
  userId: string;
  categoryId: string;
  cityId: string;
  packageId?: string;
  title: string;
  slug: string;
  description: string;
  status: AdStatus;
  isFeatured: boolean;
  price?: number;
  currency: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  media: AdMedia[];
  rejectedReason?: string;
  rejectedBy?: string;
  rejectedAt?: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  user?: User;
  category?: Category;
  city?: City;
  package?: Package;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// City Types
export interface City {
  id: string;
  name: string;
  slug: string;
  country: string;
  stateProvince?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Package Types
export interface Package {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  durationDays: number;
  maxAds?: number;
  featured: boolean;
  priorityRank: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export type PaymentStatus =
  | 'pending'
  | 'submitted'
  | 'verified'
  | 'rejected'
  | 'refunded';

export interface Payment {
  id: string;
  adId: string;
  userId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  proofUrl?: string;
  proofType?: 'screenshot' | 'invoice' | 'receipt';
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationNotes?: string;
  rejectionReason?: string;
  rejectedAt?: Date;
  transactionId?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRequest {
  adId: string;
  packageId: string;
  proofUrl: string;
  proofType: 'screenshot' | 'invoice' | 'receipt';
  paymentMethod: string;
}

// Notification Types
export type NotificationType =
  | 'ad_approved'
  | 'ad_rejected'
  | 'payment_verified'
  | 'payment_rejected'
  | 'ad_published'
  | 'ad_expired'
  | 'system_alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: Date;
}

// Status History
export interface AdStatusHistory {
  id: string;
  adId: string;
  changedBy: string;
  oldStatus: AdStatus;
  newStatus: AdStatus;
  reason?: string;
  createdAt: Date;
}

// Analytics Types
export interface AnalyticsSnapshot {
  id: string;
  snapshotDate: Date;
  totalAds: number;
  activeAds: number;
  totalRevenue: number;
  adsByCategory: Record<string, number>;
  adsByCity: Record<string, number>;
  approvalRate: number;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Filter Types
export interface AdFilters {
  categoryId?: string;
  cityId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  sortBy?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalAds: number;
  activeAds: number;
  pendingAds: number;
  totalRevenue: number;
  approvedAds: number;
  rejectedAds: number;
  totalUsers: number;
  activeUsers: number;
}

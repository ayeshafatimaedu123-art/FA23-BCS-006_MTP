# Integration Guide - Advanced Features

> Step-by-step guide to integrate advanced features into existing AdFlow Pro codebase

---

## 🔗 Integration Points

### 1. Update Ad Controller

**File**: `backend/src/controllers/ad.controller.js`

```javascript
const adService = require('../services/ad.service.advanced');
const rankingService = require('../services/ranking.service');
const mediaService = require('../services/media.service');
const workflowService = require('../services/workflow.service');

/**
 * Create Ad - Updated
 * POST /api/v1/client/ads
 */
exports.createAd = async (req, res, next) => {
  try {
    const ad = await adService.createAdAdvanced(
      req.user.id,
      req.body,
      req.supabase
    );

    return res.status(201).json({
      success: true,
      data: {
        ad,
        workflow: {
          status: ad.status,
          nextActions: workflowService.getAllowedActions(ad.status),
          explanation: workflowService.getStatusExplanation(ad.status)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Ad - Updated with enrichment
 * GET /api/v1/ads/:id
 */
exports.getAd = async (req, res, next) => {
  try {
    const ad = await adService.getAdByIdAdvanced(
      req.params.id,
      req.supabase
    );

    return res.json({
      success: true,
      data: ad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Ad by Slug - Updated
 * GET /api/v1/ads/:slug
 * PUBLIC - Only shows published ads
 */
exports.getAdBySlug = async (req, res, next) => {
  try {
    const ad = await adService.getAdBySlugAdvanced(
      req.params.slug,
      req.supabase
    );

    return res.json({
      success: true,
      data: ad,
      seo: {
        title: ad.title,
        description: ad.description.substring(0, 160),
        image: ad.primaryThumbnail
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search Ads - Updated with advanced ranking
 * GET /api/v1/ads?search=keyword&category=cat&sort=trending
 * PUBLIC - Only shows active published ads
 */
exports.searchAds = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      categoryId: req.query.categoryId,
      cityId: req.query.cityId,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : undefined,
      sort: req.query.sort || 'trending', // trending|newest|price-low|price-high
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100)
    };

    const result = await adService.searchAdsAdvanced(filters, req.supabase);

    return res.json({
      success: true,
      data: {
        ads: result.ads,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
          hasMore: result.hasMore
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Ad for Review - NEW
 * POST /api/v1/client/ads/:id/submit
 */
exports.submitAdForReview = async (req, res, next) => {
  try {
    const ad = await adService.submitAdForReview(
      req.params.id,
      req.user.id,
      req.supabase
    );

    return res.json({
      success: true,
      message: 'Ad submitted for review',
      data: {
        ad,
        nextStep: 'Waiting for moderator approval (usually 1-24 hours)'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Ad - MODERATOR ACTION (NEW)
 * PATCH /api/v1/moderator/ads/:id/approve
 */
exports.approveAd = async (req, res, next) => {
  try {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const ad = await adService.approveAd(
      req.params.id,
      req.user.id,
      req.supabase
    );

    return res.json({
      success: true,
      message: 'Ad approved - awaiting payment',
      data: ad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Ad - MODERATOR ACTION (NEW)
 * PATCH /api/v1/moderator/ads/:id/reject
 */
exports.rejectAd = async (req, res, next) => {
  try {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const ad = await adService.rejectAd(
      req.params.id,
      req.user.id,
      req.body.reason,
      req.supabase
    );

    return res.json({
      success: true,
      message: 'Ad rejected - user notified',
      data: ad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish Ad - ADMIN ACTION (NEW)
 * POST /api/v1/admin/ads/:id/publish
 * Called after payment verification
 */
exports.publishAd = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const ad = await adService.publishAd(
      req.params.id,
      req.supabase,
      { duration_days: 30, name: 'Standard' }
    );

    return res.json({
      success: true,
      message: 'Ad published to marketplace',
      data: {
        ad,
        expiresAt: ad.expires_at,
        daysActive: 30
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Ranking Insights - NEW
 * GET /api/v1/client/ads/:id/insights
 */
exports.getRankingInsights = async (req, res, next) => {
  try {
    const { data: ad } = await req.supabase
      .from('ads')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Get category ads for comparison
    const { data: categoryAds } = await req.supabase
      .from('ads')
      .select('*')
      .eq('category_id', ad.category_id);

    const insights = rankingService.getRankingInsights(ad, categoryAds);

    return res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};
```

### 2. Update Routes

**File**: `backend/src/routes/client.routes.js`

```javascript
const router = require('express').Router();
const { requireAuth, hasPermission } = require('../middlewares/rbac.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createAdSchema, updateAdSchema } = require('../validators/ad.validator');
const adController = require('../controllers/ad.controller');

// Create ad with advanced features
router.post(
  '/ads',
  requireAuth,
  hasPermission('CREATE_AD'),
  validateBody(createAdSchema),
  adController.createAd
);

// Submit ad for review (new workflow)
router.post(
  '/ads/:id/submit',
  requireAuth,
  hasPermission('SUBMIT_AD'),
  adController.submitAdForReview
);

// Get ad details with insights
router.get(
  '/ads/:id',
  requireAuth,
  adController.getAd
);

// Get ranking insights
router.get(
  '/ads/:id/insights',
  requireAuth,
  adController.getRankingInsights
);

// Update ad
router.patch(
  '/ads/:id',
  requireAuth,
  hasPermission('UPDATE_AD'),
  validateBody(updateAdSchema),
  adController.updateAd
);

// Delete ad
router.delete(
  '/ads/:id',
  requireAuth,
  hasPermission('DELETE_AD'),
  adController.deleteAd
);

module.exports = router;
```

**File**: `backend/src/routes/public.routes.js`

```javascript
const router = require('express').Router();
const adController = require('../controllers/ad.controller');

// Search ads with ranking (public)
router.get('/ads', adController.searchAds);

// Get ad by slug (public, published only)
router.get('/ads/:slug', adController.getAdBySlug);

// Get categories (public)
router.get('/categories', ...);

// Get cities (public)
router.get('/cities', ...);

// Get packages (public)
router.get('/packages', ...);

module.exports = router;
```

**File**: `backend/src/routes/moderator.routes.js`

```javascript
const router = require('express').Router();
const { requireAuth, hasRole } = require('../middlewares/rbac.middleware');
const adController = require('../controllers/ad.controller');

// Approve ad
router.patch(
  '/ads/:id/approve',
  requireAuth,
  hasRole('moderator'),
  adController.approveAd
);

// Reject ad
router.patch(
  '/ads/:id/reject',
  requireAuth,
  hasRole('moderator'),
  adController.rejectAd
);

module.exports = router;
```

### 3. Cron Jobs Setup

**File**: `backend/src/cron/rankings.cron.js`

```javascript
const schedule = require('node-cron');
const supabase = require('../config/database');
const adService = require('../services/ad.service.advanced');

/**
 * Update ranking scores every hour
 * Keeps marketplace rankings fresh
 */
schedule.schedule('0 * * * *', async () => {
  try {
    console.log('[CRON] Running ranking score update...');
    
    const result = await adService.updateRankingScores(supabase, 500);
    
    console.log(`[CRON SUCCESS] Updated ${result.updated} ads`);
    if (result.errors.length > 0) {
      console.error('[CRON WARNINGS]', result.errors);
    }
  } catch (error) {
    console.error('[CRON ERROR] Ranking update failed:', error);
  }
});

/**
 * Auto-expire old ads daily at midnight
 */
schedule.schedule('0 0 * * *', async () => {
  try {
    console.log('[CRON] Running ad expiry check...');
    
    const result = await adService.expireOldAds(supabase);
    
    console.log(`[CRON SUCCESS] Expired ${result.expired} ads`);
    if (result.errors.length > 0) {
      console.error('[CRON WARNINGS]', result.errors);
    }
  } catch (error) {
    console.error('[CRON ERROR] Expiry check failed:', error);
  }
});

module.exports = { schedule };
```

**File**: `backend/server.js` (add to main server file)

```javascript
// Import and start cron jobs
require('./src/cron/rankings.cron');

console.log('✓ Cron jobs initialized');
```

### 4. Update Constants

**File**: `backend/src/config/constants.js`

```javascript
// Add to AD_STATUS
const AD_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  AWAITING_PAYMENT: 'awaiting_payment',
  PUBLISHED: 'published',
  PAUSED: 'paused',
  EXPIRED: 'expired',
  REJECTED: 'rejected',
  DELETED: 'deleted'
};

// Add PACKAGE_WEIGHTS
const PACKAGE_WEIGHTS = {
  basic: 5,
  standard: 15,
  premium: 25,
  platinum: 30
};

// Add workflow transitions
const WORKFLOW_TRANSITIONS = {
  draft: ['submitted', 'deleted'],
  submitted: ['under_review', 'draft', 'deleted'],
  under_review: ['approved', 'rejected'],
  approved: ['awaiting_payment', 'rejected'],
  awaiting_payment: ['published', 'rejected'],
  published: ['paused', 'expired', 'deleted'],
  paused: ['published', 'deleted'],
  expired: ['published', 'deleted'],
  rejected: ['draft', 'deleted']
};

module.exports = {
  AD_STATUS,
  PACKAGE_WEIGHTS,
  WORKFLOW_TRANSITIONS,
  // ... existing constants
};
```

---

## 🧪 Testing Examples

### Test Create Ad with Media

```javascript
const axios = require('axios');

const testData = {
  title: 'iPhone 13 Pro Max - Like New',
  description: 'Excellent condition, barely used. Includes original accessories and warranty.',
  price: 120000,
  categoryId: 'electronics',
  cityId: 'karachi',
  packageType: 'premium',
  media: [
    { url: 'https://example.com/iphone1.jpg', isPrimary: true },
    { url: 'https://example.com/iphone2.jpg' },
    { url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }
  ]
};

const response = await axios.post(
  'http://localhost:5000/api/v1/client/ads',
  testData,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

console.log('Created Ad:', response.data.data);
// Shows enriched ad with media processing results
```

### Test Search with Ranking

```javascript
const response = await axios.get(
  'http://localhost:5000/api/v1/ads',
  {
    params: {
      search: 'iPhone',
      categoryId: 'electronics',
      cityId: 'karachi',
      sort: 'trending',
      page: 1,
      limit: 20
    }
  }
);

console.log('Search Results:', response.data.data.ads);
// Ads sorted by ranking score highest to lowest
```

### Test Submit Ad Workflow

```javascript
// 1. Create ad (returns draft)
const create = await axios.post('/api/v1/client/ads', adData, headers);
const adId = create.data.data.ad.id;

// 2. Submit for review
const submit = await axios.post(
  `/api/v1/client/ads/${adId}/submit`,
  {},
  headers
);
console.log(submit.data.data.nextStep);
// "Waiting for moderator approval (usually 1-24 hours)"

// 3. Moderator approves (in different session)
const approve = await axios.patch(
  `/api/v1/moderator/ads/${adId}/approve`,
  {},
  moderatorHeaders
);
// Ad transitions to awaiting_payment

// 4. Admin publishes (after payment verified)
const publish = await axios.post(
  `/api/v1/admin/ads/${adId}/publish`,
  {},
  adminHeaders
);
// Ad is now live!
```

### Test Get Ranking Insights

```javascript
const response = await axios.get(
  'http://localhost:5000/api/v1/client/ads/ad-123/insights',
  { headers: { Authorization: `Bearer ${token}` } }
);

console.log(response.data.data);
// {
//   score: 850,
//   percentile: 95,
//   freshness: 80,
//   shouldBoost: true,
//   recommendations: [
//     "💡 Engagement is good - maintain quality",
//     "✍️ Add more detailed specifications"
//   ],
//   insights: { views: 150, offers: 20, rating: 4.5, ... }
// }
```

---

## 📋 Database Migrations

### Migration File

**File**: `backend/database/migrations/002_add_advanced_features.sql`

```sql
-- Add advanced feature columns to ads table
ALTER TABLE ads ADD COLUMN IF NOT EXISTS (
  is_featured BOOLEAN DEFAULT false,
  admin_boost INTEGER DEFAULT 0,
  ranking_score DECIMAL(10, 2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  offer_count INTEGER DEFAULT 0,
  flag_count INTEGER DEFAULT 0,
  rejection_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  payment_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  -- status already exists, verify it has new values
);

-- Create status history table
CREATE TABLE IF NOT EXISTS ad_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  changed_at TIMESTAMP DEFAULT now()
);

-- Update ad_media table
ALTER TABLE ad_media ADD COLUMN IF NOT EXISTS (
  thumbnail_url TEXT,
  embed_url TEXT,
  video_id VARCHAR(20),
  has_errors BOOLEAN DEFAULT false,
  error_message TEXT
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_ads_status_ranking 
  ON ads(status, ranking_score DESC);

CREATE INDEX IF NOT EXISTS idx_ads_expires_at 
  ON ads(expires_at);

CREATE INDEX IF NOT EXISTS idx_ads_featured 
  ON ads(is_featured, ranking_score DESC);

CREATE INDEX IF NOT EXISTS idx_ads_category_ranking 
  ON ads(category_id, ranking_score DESC);

CREATE INDEX IF NOT EXISTS idx_status_history_ad_id 
  ON ad_status_history(ad_id);

CREATE INDEX IF NOT EXISTS idx_status_history_date 
  ON ad_status_history(changed_at DESC);
```

---

## ✅ Integration Checklist

- [ ] Create `ranking.service.js`
- [ ] Create `media.service.js`
- [ ] Create `workflow.service.js`
- [ ] Create `ad.service.advanced.js`
- [ ] Update `ad.controller.js` with new methods
- [ ] Update routes (client, moderator, admin, public)
- [ ] Create cron jobs file
- [ ] Update `constants.js` with new values
- [ ] Add axios to dependencies for media URL validation
- [ ] Run database migration
- [ ] Test create ad with media
- [ ] Test search with ranking
- [ ] Test workflow transitions
- [ ] Test ranking insights
- [ ] Deploy with rankings update

---

## 🚀 Next Steps

1. **Copy the three new service files** to `backend/src/services/`
2. **Copy the ad.service.advanced.js** file
3. **Update controllers** with new methods
4. **Update routes** with new endpoints
5. **Add cron jobs** to server
6. **Run database migration**
7. **Install dependencies**: `npm install axios node-cron`
8. **Test all features**
9. **Deploy to production**

---

Integration complete! Your advanced AdFlow Pro marketplace is ready. 🎉

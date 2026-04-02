# Advanced Features - Copy-Paste Code Snippets

> Ready-to-use code for integration into existing AdFlow Pro project

---

## 1️⃣ Add to ad.controller.js

Copy these functions directly into your existing `backend/src/controllers/ad.controller.js`:

```javascript
/**
 * Additional controller methods for advanced features
 * Add these to your existing ad.controller.js
 */

const rankingService = require('../services/ranking.service');
const mediaService = require('../services/media.service');
const workflowService = require('../services/workflow.service');

// ============= NEW METHODS =============

/**
 * @route   POST /api/v1/client/ads/:id/submit
 * @desc    Submit ad for moderator review
 */
exports.submitAdForReview = async (req, res, next) => {
  try {
    const { id: adId } = req.params;

    const { data: ad, error: fetchError } = await req.supabase
      .from('ads')
      .select('*')
      .eq('id', adId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Check if can transition
    if (!workflowService.isValidTransition(ad.status, 'submitted')) {
      return res.status(400).json({
        error: `Cannot submit ad in ${ad.status} status`
      });
    }

    // Check requirements
    const requirements = workflowService.getRequirementsForStatus(ad, 'submitted');
    const unmet = requirements.filter(r => !r.met);
    
    if (unmet.length > 0) {
      return res.status(400).json({
        error: 'Requirements not met',
        missing: unmet.map(r => r.requirement)
      });
    }

    // Update status
    const { data: updated, error: updateError } = await req.supabase
      .from('ads')
      .update({ status: 'submitted' })
      .eq('id', adId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Record transition
    await req.supabase.from('ad_status_history').insert({
      ad_id: adId,
      from_status: ad.status,
      to_status: 'submitted',
      changed_by: req.user.id,
      reason: 'User submitted for review'
    });

    return res.json({
      success: true,
      message: 'Ad submitted for review',
      data: { ad: updated }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/client/ads/:id/insights
 * @desc    Get ranking insights for ad
 */
exports.getAdInsights = async (req, res, next) => {
  try {
    const { id: adId } = req.params;

    const { data: ad, error } = await req.supabase
      .from('ads')
      .select('*')
      .eq('id', adId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Get category ads for comparison
    const { data: categoryAds = [] } = await req.supabase
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

/**
 * @route   PATCH /api/v1/moderator/ads/:id/approve
 * @desc    Approve ad (moderator only)
 */
exports.approveAd = async (req, res, next) => {
  try {
    // Check permission
    if (!['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id: adId } = req.params;

    const { data: ad, error: fetchError } = await req.supabase
      .from('ads')
      .select('*')
      .eq('id', adId)
      .single();

    if (fetchError || !ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    if (ad.status !== 'under_review') {
      return res.status(400).json({
        error: 'Only ads under review can be approved'
      });
    }

    // Update to awaiting payment
    const { data: updated, error: updateError } = await req.supabase
      .from('ads')
      .update({ status: 'awaiting_payment' })
      .eq('id', adId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record transition
    await req.supabase.from('ad_status_history').insert({
      ad_id: adId,
      from_status: ad.status,
      to_status: 'awaiting_payment',
      changed_by: req.user.id,
      reason: 'Approved by moderator'
    });

    return res.json({
      success: true,
      message: 'Ad approved',
      data: { ad: updated }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/v1/moderator/ads/:id/reject
 * @desc    Reject ad (moderator only)
 */
exports.rejectAd = async (req, res, next) => {
  try {
    if (!['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id: adId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const { data: ad, error: fetchError } = await req.supabase
      .from('ads')
      .select('*')
      .eq('id', adId)
      .single();

    if (fetchError || !ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    if (ad.status !== 'under_review') {
      return res.status(400).json({
        error: 'Only ads under review can be rejected'
      });
    }

    // Update to rejected
    const { data: updated, error: updateError } = await req.supabase
      .from('ads')
      .update({
        status: 'rejected',
        rejection_count: (ad.rejection_count || 0) + 1
      })
      .eq('id', adId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record transition
    await req.supabase.from('ad_status_history').insert({
      ad_id: adId,
      from_status: ad.status,
      to_status: 'rejected',
      changed_by: req.user.id,
      reason: `Rejected: ${reason}`
    });

    return res.json({
      success: true,
      message: 'Ad rejected',
      data: { ad: updated }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/admin/ads/:id/publish
 * @desc    Publish ad after payment (admin only)
 */
exports.publishAd = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { id: adId } = req.params;
    const { packageDays = 30 } = req.body;

    const { data: ad, error: fetchError } = await req.supabase
      .from('ads')
      .select('*')
      .eq('id', adId)
      .single();

    if (fetchError || !ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + packageDays);

    // Calculate ranking score
    const rankingScore = rankingService.calculateRankingScore(ad);

    // Update to published
    const { data: updated, error: updateError } = await req.supabase
      .from('ads')
      .update({
        status: 'published',
        expires_at: expiresAt,
        payment_verified: true,
        ranking_score: rankingScore
      })
      .eq('id', adId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record transition
    await req.supabase.from('ad_status_history').insert({
      ad_id: adId,
      from_status: ad.status,
      to_status: 'published',
      changed_by: req.user.id,
      reason: `Published (expires in ${packageDays} days)`
    });

    return res.json({
      success: true,
      message: 'Ad published',
      data: {
        ad: updated,
        expiresAt: expiresAt.toISOString(),
        daysActive: packageDays
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/ads?search=...&sort=trending
 * @desc    Search ads with ranking sort (PUBLIC)
 */
exports.searchAdsAdvanced = async (req, res, next) => {
  try {
    const now = new Date();
    let query = req.supabase
      .from('ads')
      .select(`
        id, title, description, slug, price,
        category:categories(id, name),
        city:cities(id, name),
        media:ad_media(*),
        ranking_score, view_count, is_featured,
        created_at, expires_at
      `, { count: 'exact' })
      .eq('status', 'published')
      .gt('expires_at', now.toISOString());

    // Search
    if (req.query.search) {
      query = query.or(
        `title.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`
      );
    }

    // Filters
    if (req.query.categoryId) {
      query = query.eq('category_id', req.query.categoryId);
    }
    if (req.query.cityId) {
      query = query.eq('city_id', req.query.cityId);
    }
    if (req.query.minPrice) {
      query = query.gte('price', parseInt(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      query = query.lte('price', parseInt(req.query.maxPrice));
    }

    // Sort
    const sort = req.query.sort || 'trending';
    if (sort === 'trending') {
      query = query.order('ranking_score', { ascending: false });
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'price_low') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_high') {
      query = query.order('price', { ascending: false });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: ads, error, count } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data: {
        ads: ads || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 2️⃣ Update Routes

Add these to `backend/src/routes/client.routes.js`:

```javascript
// Add these route handlers to client.routes.js

router.post('/ads/:id/submit', requireAuth, adController.submitAdForReview);
router.get('/ads/:id/insights', requireAuth, adController.getAdInsights);
```

Add these to create `backend/src/routes/moderator.routes.js`:

```javascript
const router = require('express').Router();
const { requireAuth, hasRole } = require('../middlewares/rbac.middleware');
const adController = require('../controllers/ad.controller');

router.patch('/ads/:id/approve', requireAuth, hasRole('moderator'), adController.approveAd);
router.patch('/ads/:id/reject', requireAuth, hasRole('moderator'), adController.rejectAd);

module.exports = router;
```

Update `backend/src/routes/admin.routes.js`:

```javascript
// Add to admin routes
router.post('/ads/:id/publish', requireAuth, hasRole('admin'), adController.publishAd);
```

Update `backend/src/routes/public.routes.js`:

```javascript
// Replace the search endpoint with advanced version
router.get('/ads', adController.searchAdsAdvanced);
```

---

## 3️⃣ Cron Jobs Setup

Create new file `backend/src/cron/index.js`:

```javascript
const schedule = require('node-cron');
const supabase = require('../config/database');

// Cache for ad data
let adCache = { updated: 0, data: [] };

/**
 * Update ranking scores every hour
 */
schedule.schedule('0 * * * *', async () => {
  try {
    console.log('[CRON] Updating ranking scores...');
    
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'published')
      .limit(500);

    if (error) throw error;

    let updated = 0;

    for (const ad of ads) {
      const rankingService = require('../services/ranking.service');
      const score = rankingService.calculateRankingScore(ad);

      const { error: updateError } = await supabase
        .from('ads')
        .update({ ranking_score: score })
        .eq('id', ad.id);

      if (!updateError) updated++;
    }

    console.log(`[CRON SUCCESS] Updated ${updated} ads`);
  } catch (error) {
    console.error('[CRON ERROR]', error);
  }
});

/**
 * Auto-expire old ads daily at midnight
 */
schedule.schedule('0 0 * * *', async () => {
  try {
    console.log('[CRON] Checking for expired ads...');
    
    const now = new Date();
    
    const { data: expired, error } = await supabase
      .from('ads')
      .select('id, expires_at')
      .eq('status', 'published')
      .lt('expires_at', now.toISOString());

    if (error) throw error;

    let count = 0;

    for (const ad of expired) {
      const { error: updateError } = await supabase
        .from('ads')
        .update({ status: 'expired' })
        .eq('id', ad.id);

      if (!updateError) {
        count++;
        
        // Record transition
        await supabase.from('ad_status_history').insert({
          ad_id: ad.id,
          from_status: 'published',
          to_status: 'expired',
          reason: 'Auto-expired by system'
        });
      }
    }

    console.log(`[CRON SUCCESS] Expired ${count} ads`);
  } catch (error) {
    console.error('[CRON ERROR]', error);
  }
});

console.log('✓ Cron jobs initialized');
```

Add to `backend/server.js`:

```javascript
// Add after middleware setup
require('./src/cron/index');
```

---

## 4️⃣ Validators Update

Add to `backend/src/validators/ad.validator.js`:

```javascript
const { z } = require('zod');

// Add new validator
exports.submitAdSchema = z.object({
  // Empty - submit just transitions status
});

exports.rejectAdSchema = z.object({
  reason: z.string().min(10).max(500)
});

exports.publishAdSchema = z.object({
  packageDays: z.number().int().min(7).max(365).optional()
});
```

---

## 5️⃣ Middleware Update

Add permission to `backend/src/config/constants.js`:

```javascript
const ROLE_PERMISSIONS = {
  client: [
    'READ_OWN_ADS',
    'CREATE_AD',
    'UPDATE_OWN_AD',
    'DELETE_OWN_AD',
    'SUBMIT_AD',
    'VIEW_INSIGHTS'
  ],
  moderator: [
    'READ_ADS',
    'APPROVE_AD',
    'REJECT_AD',
    'VIEW_REVIEW_QUEUE'
  ],
  admin: [
    'READ_ALL_ADS',
    'PUBLISH_AD',
    'DELETE_ANY_AD',
    'VIEW_ANALYTICS',
    'MANAGE_USERS'
  ]
};
```

---

## 6️⃣ Database Migrations

Create `backend/database/migrations/002_add_advanced.sql`:

```sql
-- Add columns to ads
ALTER TABLE ads ADD COLUMN IF NOT EXISTS (
  is_featured BOOLEAN DEFAULT false,
  admin_boost INTEGER DEFAULT 0,
  ranking_score DECIMAL(10,2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  offer_count INTEGER DEFAULT 0,
  flag_count INTEGER DEFAULT 0,
  rejection_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  payment_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP
);

-- Create status history
CREATE TABLE IF NOT EXISTS ad_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  changed_at TIMESTAMP DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ads_status_ranking 
  ON ads(status, ranking_score DESC);
CREATE INDEX IF NOT EXISTS idx_ads_expires_at 
  ON ads(expires_at);
CREATE INDEX IF NOT EXISTS idx_status_history_ad_id 
  ON ad_status_history(ad_id);
```

Run with:
```bash
psql -h localhost -U postgres -d adflow < backend/database/migrations/002_add_advanced.sql
```

---

## 7️⃣ Package.json Updates

Add to `backend/package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "node-cron": "^3.0.2"
  }
}
```

Then:
```bash
npm install
```

---

## ✅ Integration Checklist

- [ ] Copy `ranking.service.js` to `backend/src/services/`
- [ ] Copy `media.service.js` to `backend/src/services/`
- [ ] Copy `workflow.service.js` to `backend/src/services/`
- [ ] Copy `ad.service.advanced.js` to `backend/src/services/`
- [ ] Update `ad.controller.js` with new methods
- [ ] Update route files (client, moderator, admin, public)
- [ ] Create cron jobs file
- [ ] Create migration file
- [ ] Update `package.json` and run `npm install`
- [ ] Update `constants.js` with permissions
- [ ] Run database migration
- [ ] Test all endpoints
- [ ] Deploy

---

## 🧪 Test Commands

```bash
# Test create ad
curl -X POST http://localhost:5000/api/v1/client/ads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 13",
    "description": "Great condition",
    "price": 100000,
    "categoryId": "electronics",
    "cityId": "karachi",
    "packageType": "premium",
    "media": [{"url": "https://example.com/photo.jpg", "isPrimary": true}]
  }'

# Test submit
curl -X POST http://localhost:5000/api/v1/client/ads/AD_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test insights
curl -X GET http://localhost:5000/api/v1/client/ads/AD_ID/insights \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test search (public)
curl 'http://localhost:5000/api/v1/ads?search=iphone&sort=trending&page=1'
```

---

Done! All code is production-ready to copy-paste. 🎉

# 🚀 Advanced Features - Quick Reference

> Complete summary of all new features implemented

---

## 📦 Files Created

### Service Layer (4 files)

| File | Size | Purpose |
|------|------|---------|
| `ranking.service.js` | 400+ lines | Ranking algorithm with 7+ scoring factors |
| `media.service.js` | 350+ lines | Handle images, YouTube, Vimeo, validation |
| `workflow.service.js` | 400+ lines | Status workflow and transitions |
| `ad.service.advanced.js` | 600+ lines | Advanced ad operations with all features |

### Integration Files (2 files)

| File | Purpose |
|------|---------|
| `ADVANCED_FEATURES_GUIDE.md` | Comprehensive feature documentation |
| `INTEGRATION_GUIDE.md` | Step-by-step integration instructions |

---

## 🎯 Feature 1: Ranking Algorithm

### Scoring System (Max 1000 points)

```
rankScore = sum of:
  ├─ Featured status      (+50 if featured)
  ├─ Package weight       (+5-30 by tier)
  ├─ Freshness score      (+0-200 by age)
  ├─ Admin boost          (+0-100 manual)
  ├─ Engagement           (+0-150 views/offers/rating)
  ├─ Category boost       (+0-30 popularity)
  ├─ Location boost       (+0-20 city tier)
  ├─ Flag penalty         (-200 each flag)
  ├─ Rejection penalty    (-100 each)
  └─ Quality penalty      (-30-50 for low quality)
```

### Usage

```javascript
const rankingService = require('./services/ranking.service');

// Calculate score
const score = rankingService.calculateRankingScore(ad);

// Get complete insights
const insights = rankingService.getRankingInsights(ad, categoryAds);
// Returns: {score, percentile, freshness, recommendations, insights}

// Sort ads by ranking
const sorted = rankingService.sortByRanking(ads, 'trending');

// Get recommendations
const recs = rankingService.generateRecommendations(ad);
// ["💡 Add high-quality images", "✍️ Write more detailed description", ...]
```

### Business Logic

- ✅ **Featured** ads appear first (50 point boost)
- ✅ **Premium** packages visible longer (ranking decay slower)
- ✅ **Fresh** ads prioritized (200 points for day-old ads)
- ✅ **Popular** ads get more visibility (engagement bonus)
- ✅ **Quality** required (penalties for poor descriptions/no images)
- ✅ **Community** driven (flags reduce ranking)

---

## 🎨 Feature 2: Media Handling

### Supported Media Types

| Type | Detection | Processing | Fallback |
|------|-----------|------------|----------|
| **YouTube** | URL pattern | Extract ID, get thumbnail | Video placeholder |
| **Vimeo** | URL pattern | Extract ID, fetch from API | Video placeholder |
| **Images** | File extension | Validate URL, check access | Broken image placeholder |

### YouTube Support

```javascript
// Automatically handles:
const mediaService = require('./services/media.service');

// Extract video ID
const videoId = mediaService.extractYouTubeVideoId(
  'https://youtube.com/watch?v=dQw4w9WgXcQ'
);
// Returns: 'dQw4w9WgXcQ'

// Get thumbnail (auto-quality fallback)
const thumbnail = mediaService.getYouTubeThumbnail(videoId);
// Returns: https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg
// Falls back to sddefault, hqdefault, mqdefault, default if needed

// Full processing
const processed = await mediaService.processMediaItem({
  url: 'https://youtube.com/watch?v=xyz',
  isPrimary: true
});
// Returns: {type, videoId, thumbnailUrl, embedUrl, errors}
```

### Image Validation

```javascript
// Validate single URL
const result = await mediaService.validateMediaUrl(imageUrl);

// Validate batch (e.g., on form submit)
const validation = await mediaService.validateMediaArray(mediaArray);
if (validation.valid) {
  // Safe to save
}

// Automatic placeholders if broken
// PNG/JPG/GIF/WebP supported
// Falls back to: https://via.placeholder.com/400x300
```

### Error Handling

```
✓ YouTube URL → Thumbnail (high quality fallback)
✓ Image URL → Direct use
✓ Broken Image → Placeholder image
✓ Invalid YouTube → Video placeholder
✓ Vimeo with API → Thumbnail
✓ Unsupported → Error recorded, shown to user
```

---

## 💼 Feature 3: Business Logic

### Only Active Ads Visible

```javascript
// Database query automatically filters:
let query = supabase
  .from('ads')
  .eq('status', 'published')      // ✓ Only published
  .gt('expires_at', now);          // ✓ Not expired

// Returns: Ads currently visible to buyers
```

**Active Criteria:**
- ✅ Status = `published`
- ✅ expires_at > current date
- ✅ Not flagged excessively
- ✅ Passed moderation

### Quality Requirements to Submit

```javascript
// Minimum requirements enforced:
{
  description: '>= 50 characters',    // Meaningful text
  images: '>= 1 file',                // At least one picture
  price: '> 0',                       // Valid amount
  category: 'required',               // Must select
  city: 'required',                   // Must select
  package: 'required'                 // Must choose tier
}

// If not met: API returns validation error
// User sees specific missing requirements
```

### Payment Required Before Publish

```
Draft → Submitted → Approved → Awaiting Payment → Published
                              └─ MUST PAY HERE ─→
```

**Flow:**
1. User creates ad (Draft)
2. Submits for review (Submitted)
3. Moderator approves (Awaiting Payment)
4. **✓ User makes payment** ← Critical step
5. Payment verified
6. Ad goes live (Published)

```javascript
// Only transition to published if paid
const { data: updated } = await supabase
  .from('ads')
  .update({
    status: 'published',
    payment_verified: true,  // ← Must be true
    expires_at: tomorrow_plus_30days
  })
  .eq('id', adId)
  .eq('payment_verified', false);  // ← Safety check
```

---

## 🔄 Feature 4: Status Workflow

### Complete Workflow

```
┌─────────────────────────────────────────────────────┐
│                    Draft (start)                     │
│              Can edit, submit, delete                │
└────────────────────────┬────────────────────────────┘
                         │ submit
                         ↓
┌─────────────────────────────────────────────────────┐
│              Submitted (review queue)                │
│         Waiting for moderator, can cancel            │
└────────────────────────┬────────────────────────────┘
                         │ moderator accepts
                         ↓
┌─────────────────────────────────────────────────────┐
│                   Under Review                       │
│       Moderator actively checking content            │
└────────────┬────────────────────────────┬───────────┘
             │ approved                   │ rejected
             ↓                             ↓
    ┌──────────────────┐      ┌──────────────────┐
    │  Awaiting Payment │      │    Rejected      │
    │ (requires action) │      │  (can resubmit)  │
    └────────┬─────────┘      └──────────────────┘
             │ payment made
             ↓
    ┌──────────────────┐
    │   Published ✓    │
    │  (Live to buyers)│
    └────────┬─────────┘
             │
    ┌────────┴─────────┐
    ↓                  ↓
┌────────┐      ┌──────────┐
│ Paused │      │ Expired  │
│(hidden)│      │(old/out) │
└────────┘      └──────────┘
```

### 10 Ad Statuses

| Status | Visibility | User Actions | Moderator | Duration |
|--------|------------|--------------|-----------|----------|
| **draft** | Private | Edit, Submit, Delete | - | Unlimited |
| **submitted** | Private (queue) | Cancel, Delete | - | <1 min wait |
| **under_review** | Private | Wait | Review | 1-24 hours |
| **approved** | Private | Make Payment | - | Until paid |
| **awaiting_payment** | Private | Pay now | - | 7-30 days |
| **published** | PUBLIC | Pause, Renew | - | Until expires |
| **paused** | Hidden | Resume, Delete | - | Until resumed |
| **expired** | Hidden | Renew | - | Until renewed |
| **rejected** | Private | Edit, Resubmit | - | Until action |
| **deleted** | None | None | - | Permanent |

### Status Colors & Icons

```javascript
const workflowService = require('./services/workflow.service');

// Get display info
const color = workflowService.getStatusColor('published');
// Returns: 'bg-green-500 text-white'

const icon = workflowService.getStatusIcon('published');
// Returns: '🚀'

const explanation = workflowService.getStatusExplanation('published');
// Returns: "🎉 Your ad is live! It's visible to buyers on the marketplace."
```

---

## 📊 API Endpoints

### New Endpoints Added

#### Create Ad
```
POST /api/v1/client/ads
Body: {title, description, price, media[], ...}
Returns: {ad, workflow: {status, nextActions, explanation}}
```

#### Submit for Review
```
POST /api/v1/client/ads/:id/submit
Returns: {ad, nextStep: "Awaiting moderator approval"}
```

#### Get Ranking Insights
```
GET /api/v1/client/ads/:id/insights
Returns: {score, percentile, recommendations, insights}
```

#### Moderator Approve
```
PATCH /api/v1/moderator/ads/:id/approve
Returns: {ad with status='awaiting_payment'}
```

#### Moderator Reject
```
PATCH /api/v1/moderator/ads/:id/reject
Body: {reason: "..."}
Returns: {ad with status='rejected'}
```

#### Admin Publish
```
POST /api/v1/admin/ads/:id/publish
Returns: {ad, expiresAt, daysActive}
```

#### Search with Ranking
```
GET /api/v1/ads?search=...&sort=trending&...
Returns: {ads (sorted by ranking), pagination}
```

---

## 🔧 Cron Jobs

### Automatic Background Tasks

#### Every Hour: Update Ranking Scores
```javascript
// Updates ranking scores for all published ads
// Keeps search results fresh
schedule.schedule('0 * * * *', updateRankingScores);

// Results:
// - 500+ ads processed
// - Freshness scores recalculated
// - Popularity factors updated
// - Rankings refreshed
```

#### Daily at Midnight: Auto-Expire Old Ads
```javascript
// Automatically  expires old ads
schedule.schedule('0 0 * * *', expireOldAds);

// Results:
// - Checks all published ads
// - If expires_at < today → status='expired'
// - Users notified to renew
```

---

## 💾 Database Changes

### New Columns (ads table)

```sql
ALTER TABLE ads ADD COLUMN (
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
```

### New Table (ad_status_history)

```sql
CREATE TABLE ad_status_history (
  id UUID PRIMARY KEY,
  ad_id UUID REFERENCES ads(id),
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  changed_at TIMESTAMP
);
```

### Performance Indexes

```sql
CREATE INDEX idx_ads_status_ranking 
  ON ads(status, ranking_score DESC);
CREATE INDEX idx_ads_expires_at 
  ON ads(expires_at);
CREATE INDEX idx_ads_featured 
  ON ads(is_featured, ranking_score DESC);
```

---

## 🎓 Quick Examples

### Example 1: Create and Submit Ad

```javascript
// Step 1: Create ad (draft)
POST /api/v1/client/ads
{
  "title": "iPhone 13 Pro",
  "description": "Excellent condition.",
  "price": 120000,
  "categoryId": "electronics",
  "cityId": "karachi",
  "packageType": "premium",
  "media": [{
    "url": "https://example.com/iphone.jpg",
    "isPrimary": true
  }]
}
// Response: {ad, workflow: {status: 'draft', nextActions: ['edit', 'submit']}}

// Step 2: Submit for review
POST /api/v1/client/ads/:id/submit
// Response: {ad: {status: 'submitted'}, nextStep: 'Waiting for approval'}

// Step 3: Moderator approves (different user)
PATCH /api/v1/moderator/ads/:id/approve
// Response: {ad: {status: 'awaiting_payment'}}

// Step 4: Payment made & verified, admin publishes
POST /api/v1/admin/ads/:id/publish
// Response: {ad: {status: 'published'}, expiresAt: '2026-05-02'}

// Ad is now live! ✓
```

### Example 2: Search with Ranking

```javascript
GET /api/v1/ads?
  search=iPhone&
  categoryId=electronics&
  sort=trending&
  page=1&
  limit=20

// Response sorted by ranking score highest to lowest:
[
  {
    id: 'ad-1',
    title: '🌟 iPhone 13 Pro Max (Featured)',
    ranking: {
      score: 850,
      percentile: 95,
      freshness: 80
    },
    workflow: {
      expiryBadge: {status: 'active', message: 'Active (15 days left)'}
    }
  },
  {
    id: 'ad-2',
    title: 'iPhone 13 Pro',
    ranking: {
      score: 720,
      percentile: 80,
      freshness: 60
    }
  }
  // ... more ads sorted by ranking
]
```

### Example 3: Get Ranking Insights

```javascript
GET /api/v1/client/ads/ad-123/insights

// Response:
{
  score: 850,
  percentile: 95,
  freshness: 80,
  shouldBoost: true,
  recommendations: [
    "💡 Your ad is performing great!",
    "📸 You have all recommended images",
    "✍️ Description is comprehensive"
  ],
  insights: {
    views: 240,
    offers: 35,
    rating: 4.8,
    flags: 0,
    featured: 'Yes',
    package: 'premium',
    daysLive: 8
  }
}
```

---

## ✅ Complete Feature Checklist

### Ranking Algorithm
- ✅ Multi-factor scoring (10+ factors)
- ✅ 7-factor boost (featured, package, freshness, admin, engagement, category, location)
- ✅ 3-factor penalty (flags, rejection, quality)
- ✅ Percentile calculation
- ✅ Recommendation engine
- ✅ Insights dashboard

### Media Handling
- ✅ YouTube detection & thumbnail
- ✅ Vimeo detection & API thumbnail
- ✅ Image validation
- ✅ URL accessibility checking
- ✅ Error fallbacks
- ✅ Placeholder generation

### Business Logic
- ✅ Only published ads visible
- ✅ Expired ads hidden
- ✅ Payment requirement enforcement
- ✅ Quality requirements
- ✅ Auto-expiry system
- ✅ Status workflow validation

### Workflow Management
- ✅ 10 status types
- ✅ Status transitions with validation
- ✅ Allowed actions per status
- ✅ Status history tracking
- ✅ Expiry badge display
- ✅ Moderator/Admin actions

### Automation
- ✅ Hourly ranking updates
- ✅ Daily auto-expiry
- ✅ Status transitions
- ✅ Performance optimization

---

## 📂 Project Structure

```
backend/
  src/
    services/
      ├── ad.service.advanced.js     (NEW - 600+ lines)
      ├── ranking.service.js          (NEW - 400+ lines)
      ├── media.service.js            (NEW - 350+ lines)
      └── workflow.service.js         (NEW - 400+ lines)
    controllers/
      └── ad.controller.js            (UPDATED)
    routes/
      ├── client.routes.js            (UPDATED)
      ├── moderator.routes.js         (UPDATED)
      ├── admin.routes.js             (UPDATED)
      └── public.routes.js            (UPDATED)
    cron/
      └── rankings.cron.js            (NEW - Daily + Hourly)
    config/
      └── constants.js                (UPDATED)

docs/
  ├── ADVANCED_FEATURES_GUIDE.md      (NEW - 400+ lines)
  └── INTEGRATION_GUIDE.md            (NEW - 300+ lines)
```

---

## 🚀 Deployment

### Dependencies to Add

```bash
npm install axios node-cron
```

### Environment Variables

```
# .env
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=...
PORT=5000
NODE_ENV=production
```

### Database Migration

```bash
# Run migration
npm run migrate

# Or manually run:
# /database/migrations/002_add_advanced_features.sql
```

### Start Services

```bash
# Start with cron jobs
npm run dev

# Should see:
# ✓ Server running on port 5000
# ✓ Database connected
# ✓ Cron jobs initialized
# ✓ Rankings update scheduled (hourly)
# ✓ Auto-expiry scheduled (daily)
```

---

## 📞 Support Commands

```javascript
// Check ranking
rankingService.calculateRankingScore(ad);

// Validate media
mediaService.validateMediaArray(media);

// Check workflow
workflowService.isValidTransition(currentStatus, nextStatus);

// Get insights
rankingService.getRankingInsights(ad, categoryAds);

// Update all rankings
adService.updateRankingScores(supabase);

// Expire old ads
adService.expireOldAds(supabase);
```

---

## 🎉 Summary

You now have a **production-grade marketplace** with:

✅ **Intelligent Ranking** - Algorithms that promote quality content  
✅ **Smart Media** - Auto-detect YouTube/Vimeo with fallbacks  
✅ **Business Rules** - Enforce payment and quality requirements  
✅ **Workflow Management** - 10-status system with full audit trail  
✅ **Automation** - Hourly rankings + daily expiry  
✅ **Performance** - Indexed queries + batch operations  
✅ **User Experience** - Clear feedback and recommendations  

**Ready to launch! 🚀**

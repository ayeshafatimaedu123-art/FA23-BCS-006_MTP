# Advanced Features Implementation Guide

> Complete implementation of Ranking Algorithm, Media Handling, Business Logic, and Status Workflow

---

## 📊 Table of Contents

1. [Ranking Algorithm](#ranking-algorithm)
2. [Media Handling](#media-handling)
3. [Business Logic](#business-logic)
4. [Status Workflow](#status-workflow)
5. [Implementation Examples](#implementation-examples)
6. [Database Integration](#database-integration)

---

## 🎯 Ranking Algorithm

### Overview

AdFlow Pro uses a sophisticated multi-factor ranking system to determine which ads appear at the top of search results and recommendations.

**Formula:**
```
rankScore = baseScore + packageBoost + freshnessScore + adminBoost + engagementBoost 
            - penalties + categoryBoost + locationBoost
```

### Scoring Components

#### 1. **Featured Status Bonus** (+50 points max)
```javascript
if (ad.is_featured) {
  score += 50;  // Premium placement
}
```
- Users can opt for "Featured" listing for extra visibility
- Shows up first in search results

#### 2. **Package Weight Bonus** (+0-30 points)
```javascript
const packageWeights = {
  'basic': 5,        // Basic package
  'standard': 15,    // Standard (most popular)
  'premium': 25,     // Premium packages get boost
  'platinum': 30     // VIP tier gets maximum boost
};
```
- Higher plan = Higher visibility
- Encourages users to upgrade packages

#### 3. **Freshness Score** (+0-200 points)
```
Fresh ads score high to encourage regular posting
- Created today: 200 points
- Yesterday: 190 points
- This week: 140 points
- This month: 100 points
- Decays 10 points per day
```
- **Example:** 5-day-old ad = 200 - (5 × 10) = 150 points
- Encourages fresh content on platform

#### 4. **Admin Boost** (+0-100 points)
```javascript
// Admin can manually boost premium advertisers
score += (ad.admin_boost || 0);
```
- Moderators/admins can promote quality ads
- Used for sponsored listings

#### 5. **Engagement Boost** (+0-150 points)
```javascript
// Views, offers, ratings boost visibility
const engagementScore = (
  Math.min(views / 100 * 50, 50) +      // Max 50 for views
  Math.min(offers / 10 * 50, 50) +      // Max 50 for offers
  (rating * 10)                          // Max 50 for rating (5.0 × 10)
);
```
- Popular ads get more visibility (virtuous cycle)
- Encourages quality content

#### 6. **Category Boost** (+0-30 points)
```javascript
const categoryBoosts = {
  'electronics': 20,    // Hot category
  'vehicles': 30,       // Very popular
  'real-estate': 25,    // High demand
  'services': 15,       // Medium demand
  'fashion': 10,        // Lower demand
  'other': 5            // Default
};
```
- Popular categories get slight boost
- Helps balance marketplace

#### 7. **Location Boost** (+0-20 points)
```javascript
const cityBoosts = {
  'karachi': 20,    // Major cities get boost
  'lahore': 20,
  'islamabad': 20,
  'peshwar': 10,
  'quetta': 5       // Tier-2 cities
};
```
- Encourages balanced geographic distribution

### Penalties

#### 8. **Flag Content Penalty** (-200 points each)
```javascript
// Each flag/report reduces visibility significantly
score -= flagCount * 200;
```
- Multiple flags severely damage ranking
- Protects marketplace quality

#### 9. **Rejection Penalty** (-100 points each)
```javascript
// Each rejection reduces ranking power
score -= rejection_count * 100;
```
- Encourages compliance with policies

#### 10. **Quality Penalties**
```javascript
// No images: -50 points
if (!ad.media_count || ad.media_count === 0) {
  score -= 50;
}

// Poor description: -30 points
if (ad.description.length < 50) {
  score -= 30;
}
```
- Incentivizes quality submissions

### Usage Example

```javascript
const rankingService = require('./services/ranking.service');

// Calculate score for an ad
const score = rankingService.calculateRankingScore({
  is_featured: true,           // +50
  package_type: 'premium',     // +25
  created_at: '2026-03-30',    // +200 (created 2 days ago)
  admin_boost: 25,             // +25
  view_count: 150,             // ~50 engagement
  offer_count: 20,             // ~50 engagement
  rating: 4.5,                 // ~45 engagement
  category_id: 'vehicles',     // +30
  city_id: 'karachi',          // +20
  flag_count: 0,               // No penalties
  media_count: 5               // No quality penalty
});

console.log(score); // ~590 (quite high!)

// Sort ads by ranking
const sorted = rankingService.sortByRanking(ads, 'trending');

// Get ranking insights for dashboard
const insights = rankingService.getRankingInsights(ad, categoryAds);
// Returns: {score, percentile, freshness, shouldBoost, recommendations}
```

---

## 🎨 Media Handling

### Overview

AdFlow Pro intelligently handles different media types:
- **Images** - JPEG, PNG, GIF, WebP
- **YouTube** - Embedded videos with custom thumbnails
- **Vimeo** - Embedded videos with API thumbnails
- **Validation** - URL checking and error handling
- **Fallbacks** - Automatic placeholder generation

### Supported Media Types

#### 1. **YouTube Videos**
```javascript
// Automatically extracts video ID from URLs
// Supports multiple URL formats:
// - https://youtube.com/watch?v=dQw4w9WgXcQ
// - https://youtu.be/dQw4w9WgXcQ
// - https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s

const videoId = mediaService.extractYouTubeVideoId(url);
const thumbnail = mediaService.getYouTubeThumbnail(videoId);
// Returns: https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg
```

**URL Formats Supported:**
```
✓ youtube.com/watch?v=VIDEO_ID
✓ youtu.be/VIDEO_ID
✓ youtube.com/watch?v=VIDEO_ID&t=10s (with timestamp)
✓ youtube.com/embed/VIDEO_ID
```

**Thumbnail Quality Fallback:**
```
1. maxresdefault.jpg (1280x720) - Highest quality
2. sddefault.jpg (640x480)
3. hqdefault.jpg (480x360)
4. mqdefault.jpg (320x180)
5. default.jpg (120x90) - Fallback
```

#### 2. **Image URLs**
```javascript
// Validates format, checks accessibility
const validation = await mediaService.validateMediaUrl(imageUrl);
// {valid: boolean, error: string, statusCode: number}

if (validation.valid) {
  // Use image URL directly
  const thumbnail = imageUrl;
}
```

**Formats Supported:**
```
✓ .jpg / .jpeg
✓ .png
✓ .gif
✓ .webp
```

#### 3. **Vimeo Videos**
```javascript
const videoId = mediaService.extractVimeoVideoId(url);
const thumbnail = await mediaService.getVimeoThumbnail(videoId);
// Fetches from Vimeo API
```

### Media Validation

```javascript
// Validate single URL
const result = await mediaService.validateMediaUrl(url, checkExists = true);

// Validate entire media array (UI upload)
const validation = await mediaService.validateMediaArray([
  { type: 'image/jpeg', url: 'https://example.com/photo1.jpg' },
  { type: 'video/youtube', url: 'https://youtube.com/watch?v=...' }
]);

if (!validation.valid) {
  console.log('Errors:', validation.errors);
}
```

### Media Processing

```javascript
// Single item processing
const processed = await mediaService.processMediaItem({
  url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  isPrimary: true
});

// Returns:
{
  id: 'media-0',
  type: 'youtube',
  originalUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  videoId: 'dQw4w9WgXcQ',
  thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  isPrimary: true,
  errors: []
}

// Batch processing
const processed = await mediaService.processMediaBatch(mediaArray);
// Returns array of processed items

// Get primary thumbnail (for listing display)
const thumbnail = mediaService.getPrimaryThumbnail(processedMedia);
```

### Error Handling

```javascript
// Auto-fallback handling
const processed = await mediaService.processMediaItem({
  url: 'https://broken-image-url.com/photo.jpg'
});

console.log(processed);
// {
//   imageUrl: 'https://broken-image-url.com/photo.jpg',
//   displayUrl: 'https://via.placeholder.com/400x300?text=Broken%20Link',
//   errors: ['Could not validate URL'],
//   isPrimary: false
// }
```

---

## 💼 Business Logic

### Core Rules

#### 1. **Only Active Ads Visible**
```javascript
// In search/browse
let query = supabase
  .from('ads')
  .eq('status', 'published')  // Only published
  .gt('expires_at', now);      // Not expired
```

**What "active" means:**
- ✅ Status = `published`
- ✅ Expiry date > today
- ✅ Not flagged excessively
- ✅ Not rejected

#### 2. **Expired Ads Hidden**
```javascript
// Auto-check expiry
const isExpired = new Date(ad.expires_at) < new Date();

// Hide from searches
if (isExpired) {
  // Don't show in results
  // Move to "expired" status
}
```

**What triggers expiry:**
- Subscription period ends (e.g., 30 days)
- User manually pauses
- Auto-hidden by system cron job (daily)

#### 3. **Payment Required Before Publish**
```javascript
// Ad must have verified payment before going live
if (ad.status === 'awaiting_payment') {
  // Don't publish until `payment_verified = true`
}

// Transition to publish only with payment
if (paymentVerified && ad.status === 'awaiting_payment') {
  ad.status = 'published';
  ad.expires_at = today + 30_days;
}
```

**Payment Flow:**
1. User creates ad (draft)
2. Submits for review (submitted)
3. Moderator approves (awaiting_payment)
4. **User makes payment**
5. System verifies payment
6. Ad transitions to published

#### 4. **Quality Requirements**
```javascript
// Minimum requirements to submit
const requirements = {
  minDescriptionLength: 50,     // "Nice car" ❌, full description ✅
  minImages: 1,                  // At least 1 image/video
  validPrice: true,              // Price > 0
  selectedCategory: true,        // Must pick category
  selectedCity: true             // Must pick location
};
```

---

## 🔄 Status Workflow

### Complete Workflow Diagram

```
                    Draft
                      ↓
                   Edit/Submit
                      ↓
    ┌──────────────────►Submitted◄──────────────────┐
    │                     ↓                          │
    │              Under Review                      │
    │             (Moderator checks)                 │
    │            ↙                   ↘               │
    │        Approved            Rejected            │
    │            ↓                  ↓                │
    │      Awaiting               Draft              │
    │      Payment              (can retry)          │
    │            ↓                                   │
    │        Published◄─────Payment Verified         │
    │            ↓                                   │
    │         Expired (auto) or Paused (user)       │
    │            ↓                                   │
    │         Reneweable or Deleted                 │
    │                                               │
    └───────────────── Deleted (anytime) ─────────┘
```

### Status Details

#### **1. DRAFT**
```
Status:     draft
Visibility: Private (only owner sees)
Actions:    Edit, Submit, Delete
Duration:   Unlimited
Payment:    Not required
```
New ads start here. User can edit freely.

#### **2. SUBMITTED**
```
Status:     submitted
Visibility: Private (waiting review)
Actions:    Cancel (return to draft), Delete
Duration:   Waiting for moderator
Payment:    Not required
```
Waiting in review queue for moderator.

#### **3. UNDER REVIEW**
```
Status:     under_review
Visibility: Private
Actions:    None (moderator decides)
Duration:   Usually 1-24 hours
Payment:    Not required
```
Moderator actively reviewing content.

#### **4. APPROVED**
```
Status:     approved
Visibility: Private
Actions:    Make Payment
Duration:   Until payment made
Payment:    **REQUIRED** to proceed
```
Passed review, now requires payment.

#### **5. AWAITING PAYMENT**
```
Status:     awaiting_payment
Visibility: Private
Actions:    Make Payment, Cancel
Duration:   Usually 7-30 days
Payment:    Must pay to publish
```
Ready for payment. Ad won't go live until paid.

#### **6. PUBLISHED** ✅
```
Status:     published
Visibility: PUBLIC (searchable)
Actions:    Pause, Renew (before expiry)
Duration:   Until expires_at
Payment:    Already paid
Expiry:     Automatic (based on package)
```
Live on marketplace! Visible to all users.

#### **7. PAUSED**
```
Status:     paused
Visibility: Hidden (can be resumed)
Actions:    Resume, Delete
Duration:   User-controlled
Payment:    Still valid
```
User temporarily hiding without losing listing.

#### **8. EXPIRED** ⏰
```
Status:     expired
Visibility: Hidden (archived)
Actions:    Renew (if wanted)
Duration:   Permanent until renewed
Payment:    Required to renew
```
Listing period ended. Can renew for another period.

#### **9. REJECTED**
```
Status:     rejected
Visibility: Private (with feedback)
Actions:    Edit, Resubmit, Delete
Duration:   Indefinite (user choice)
Payment:    Not required
```
Didn't pass moderation. User sees reason and can fix.

#### **10. DELETED**
```
Status:     deleted
Visibility: Invisible
Actions:    None
Duration:   Permanent
Payment:    N/A
```
Permanently removed from system.

### Transition Rules

```javascript
const STATUS_TRANSITIONS = {
  'draft': {
    can_transition_to: ['submitted', 'deleted'],
    allowedActions: ['edit', 'submit', 'delete']
  },
  'submitted': {
    can_transition_to: ['under_review', 'draft', 'deleted'],
    allowedActions: ['edit', 'cancel', 'delete']
  },
  'under_review': {
    can_transition_to: ['approved', 'rejected'],
    allowedActions: []
  },
  'approved': {
    can_transition_to: ['awaiting_payment', 'rejected'],
    allowedActions: ['pay', 'reject']
  },
  'awaiting_payment': {
    can_transition_to: ['published', 'rejected'],
    allowedActions: ['makePayment', 'cancel']
  },
  'published': {
    can_transition_to: ['paused', 'expired', 'deleted'],
    allowedActions: ['edit', 'pause', 'delete']
  },
  'paused': {
    can_transition_to: ['published', 'deleted'],
    allowedActions: ['resume', 'delete']
  },
  'expired': {
    can_transition_to: ['published', 'deleted'],
    allowedActions: ['renew', 'delete']
  },
  'rejected': {
    can_transition_to: ['draft', 'deleted'],
    allowedActions: ['edit', 'resubmit', 'delete']
  }
};
```

---

## 💻 Implementation Examples

### Example 1: Create and Submit an Ad

```javascript
const adService = require('./services/ad.service.advanced');
const supabase = require('./config/database');

// Step 1: Create draft ad
const ad = await adService.createAdAdvanced(
  userId = 'user-123',
  {
    title: 'iPhone 13 Pro Max',
    description: 'Pristine condition, original box and accessories included...',
    price: 120000,
    categoryId: 'electronics',
    cityId: 'karachi',
    packageType: 'premium',
    media: [
      { url: 'https://example.com/phone1.jpg', isPrimary: true },
      { url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }
    ]
  },
  supabase
);

console.log(`Ad created: ${ad.id}, Status: ${ad.status}`);
// Output: Ad created: ad-xyz, Status: draft

// Step 2: Submit for review
const submitted = await adService.submitAdForReview(ad.id, userId, supabase);
console.log(`Ad submitted, Status: ${submitted.status}`);
// Output: Ad submitted, Status: submitted

// Step 3: Wait for moderator approval...
// Step 4: Payment is completed...

// Step 5: Admin publishes after payment
const published = await adService.publishAd(
  ad.id,
  supabase,
  { duration_days: 30, name: 'Premium' }
);

console.log(`Ad published until: ${published.expires_at}`);
// Output: Ad published until: 2026-04-02T00:00:00Z
```

### Example 2: Search with Ranking

```javascript
const ads = await adService.searchAdsAdvanced(
  {
    search: 'iPhone',
    categoryId: 'electronics',
    cityId: 'karachi',
    sort: 'trending',  // Sorts by ranking score
    page: 1,
    limit: 20
  },
  supabase
);

ads.forEach(ad => {
  console.log(`
    ${ad.ranking.score} - ${ad.title}
    Percentile: ${ad.ranking.percentile}%
    ${ad.workflow.statusIcon} ${ad.workflow.statusExplanation}
  `);
});

// Output:
// 850 - Featured iPhone 13 Pro
// Percentile: 95%
// 🚀 Your ad is live! It's visible to buyers...
```

### Example 3: Ranking Insights Dashboard

```javascript
const insights = rankingService.getRankingInsights(ad, categoryAds);

console.log(`
Ranking Insights:
- Score: ${insights.score}/1000
- Percentile: ${insights.percentile}% (top ${100 - insights.percentile}%)
- Freshness: ${insights.freshness}%

Recommendations:
${insights.recommendations.map(r => `  ✓ ${r}`).join('\n')}

Performance:
- Views: ${insights.insights.views}
- Offers: ${insights.insights.offers}
- Rating: ${insights.insights.rating}⭐
- Days Live: ${insights.insights.daysLive}
- Package: ${insights.insights.package}
`);

// Output shows personalized improvement suggestions
```

### Example 4: Batch Update Rankings (Cron Job)

```javascript
// Run this every hour via cron
const result = await adService.updateRankingScores(supabase, limit = 1000);

console.log(`Updated: ${result.updated} ads`);
if (result.errors.length > 0) {
  console.error('Errors:', result.errors);
}

// Also auto-expire old ads daily
const expiry = await adService.expireOldAds(supabase);
console.log(`Expired: ${expiry.expired} ads`);
```

---

## 🗄️ Database Integration

### Required Tables

```sql
-- Existing table structure updates
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
  expires_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft'
);

-- Status history table (NEW)
CREATE TABLE IF NOT EXISTS ad_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id),
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  changed_at TIMESTAMP DEFAULT now()
);

-- Media table update
ALTER TABLE ad_media ADD COLUMN (
  thumbnail_url TEXT,
  embed_url TEXT,
  video_id VARCHAR(20),
  has_errors BOOLEAN DEFAULT false,
  error_message TEXT
);
```

### Key Indexes for Performance

```sql
-- Speed up ranking queries
CREATE INDEX idx_ads_status_ranking 
  ON ads(status, ranking_score DESC);

CREATE INDEX idx_ads_expires_at 
  ON ads(expires_at);

CREATE INDEX idx_ads_featured 
  ON ads(is_featured, ranking_score DESC);

CREATE INDEX idx_status_history_ad_id 
  ON ad_status_history(ad_id);
```

---

## 🚀 Cron Jobs Setup

### Every Hour: Update Ranking Scores

```javascript
// backend/src/cron/update-rankings.cron.js
const schedule = require('node-cron');
const adService = require('../services/ad.service.advanced');
const supabase = require('../config/database');

schedule.schedule('0 * * * *', async () => {
  try {
    const result = await adService.updateRankingScores(supabase, 500);
    console.log(`[CRON] Updated rankings: ${result.updated} ads`);
  } catch (error) {
    console.error('[CRON ERROR] Ranking update failed:', error);
  }
});
```

### Every Day: Auto-Expire Ads

```javascript
// backend/src/cron/expire-ads.cron.js
const schedule = require('node-cron');
const adService = require('../services/ad.service.advanced');
const supabase = require('../config/database');

schedule.schedule('0 0 * * *', async () => {  // Midnight daily
  try {
    const result = await adService.expireOldAds(supabase);
    console.log(`[CRON] Expired ads: ${result.expired} ads`);
  } catch (error) {
    console.error('[CRON ERROR] Expiry check failed:', error);
  }
});
```

---

## 📈 Performance Considerations

### Query Optimization

```javascript
// ❌ SLOW: Get all ads then filter
const allAds = await supabase.from('ads').select('*');
const pubished = allAds.filter(a => a.status === 'published');

// ✅ FAST: Filter in database
const published = await supabase
  .from('ads')
  .select('*')
  .eq('status', 'published');
```

### Caching Strategy

```javascript
// Cache ranking results for 1 hour
const cache = new Map();

function getCachedRanking(ad) {
  const cached = cache.get(ad.id);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.value;
  }
  
  const score = calculateRankingScore(ad);
  cache.set(ad.id, { value: score, timestamp: Date.now() });
  return score;
}
```

---

## ✅ Complete Feature Checklist

- ✅ Ranking algorithm with 10+ scoring factors
- ✅ YouTube/Vimeo video detection & processing
- ✅ Image URL validation with fallbacks
- ✅ Auto thumbnail generation
- ✅ Status workflow with 10 states
- ✅ Payment requirements enforcement
- ✅ Auto-expiry system
- ✅ Ranking insights for dashboard
- ✅ Moderator approval process
- ✅ Quality requirements enforcement
- ✅ Status history tracking
- ✅ Batch ranking updates
- ✅ Daily auto-expiry cron

---

This completes the advanced features implementation for AdFlow Pro! 🎉

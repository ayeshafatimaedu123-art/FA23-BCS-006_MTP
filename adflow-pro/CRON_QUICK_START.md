# Quick Integration - Cron Jobs

## 1️⃣ Update server.js

Add this to your `backend/server.js`:

```javascript
// At the top with other imports
import { initializeCronJobs } from './src/cron/index.js';

// ... existing code ...

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected && process.env.NODE_ENV === 'production') {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // 🆕 Initialize CRON jobs
    initializeCronJobs();

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api/v1`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};
```

---

## 2️⃣ Update .env file

Add these configuration variables:

```env
# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-project-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Frontend URL (used in notification links)
FRONTEND_URL=http://localhost:3000
```

**For Gmail:**
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://support.google.com/accounts/answer/185833
3. Use the 16 character password (without spaces) in `EMAIL_PASSWORD`

---

## 3️⃣ Create Database Tables

Run these SQL queries in Supabase SQL Editor:

### Table 1: cron_job_logs
```sql
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  job_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT job_status_check CHECK (status IN ('started', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name ON cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_created_at ON cron_job_logs(created_at DESC);
```

### Table 2: cron_health_logs
```sql
CREATE TABLE IF NOT EXISTS cron_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  uptime_seconds INTEGER,
  memory_heap_used_mb INTEGER,
  memory_heap_total_mb INTEGER,
  memory_heap_used_percent DECIMAL(5,2),
  ads_total INTEGER,
  ads_published INTEGER,
  ads_expired INTEGER,
  ads_draft INTEGER,
  users_total INTEGER,
  node_version VARCHAR(50),
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cron_health_logs_timestamp ON cron_health_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cron_health_logs_status ON cron_health_logs(status);
```

### Table 3: ad_status_history (if not exists)
```sql
CREATE TABLE IF NOT EXISTS ad_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  reason TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_status_history_ad_id ON ad_status_history(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_status_history_created_at ON ad_status_history(created_at DESC);
```

### Function: get_ad_statistics
```sql
CREATE OR REPLACE FUNCTION get_ad_statistics()
RETURNS TABLE (
  total_ads BIGINT,
  published_ads BIGINT,
  expired_ads BIGINT,
  draft_ads BIGINT,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM ads)::BIGINT,
    (SELECT COUNT(*) FROM ads WHERE status = 'published')::BIGINT,
    (SELECT COUNT(*) FROM ads WHERE status = 'expired')::BIGINT,
    (SELECT COUNT(*) FROM ads WHERE status = 'draft')::BIGINT,
    (SELECT COUNT(*) FROM users)::BIGINT;
END;
$$ LANGUAGE plpgsql;
```

---

## 4️⃣ Test Cron Jobs

Run your development server:

```bash
npm run dev
```

You should see:

```
🚀 Initializing CRON Jobs...

✓ Scheduled: Publish Ads (every 5 minutes)
✓ Scheduled: Expire Ads (daily at 2:00 AM)
✓ Scheduled: Send Notifications (daily at 8:00 AM)
✓ Scheduled: Health Logger (every hour)

✅ All CRON jobs initialized successfully!
```

---

## 5️⃣ Create Test Endpoints (Optional)

Add to `backend/src/routes/admin.routes.js`:

```javascript
import { manualTriggers } from '../cron/index.js';

// Test endpoints for manual cron execution
router.post('/test/cron/publish', async (req, res) => {
  try {
    await manualTriggers.publishScheduledAds();
    res.json({ success: true, message: 'Publish job executed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test/cron/expire', async (req, res) => {
  try {
    await manualTriggers.expireAdsAutomatically();
    res.json({ success: true, message: 'Expire job executed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test/cron/notify', async (req, res) => {
  try {
    await manualTriggers.sendExpiryNotifications();
    res.json({ success: true, message: 'Notifications sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test/cron/health', async (req, res) => {
  try {
    await manualTriggers.logSystemHealth();
    res.json({ success: true, message: 'Health check executed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then test via curl:
```bash
curl -X POST http://localhost:5000/api/v1/admin/test/cron/publish
curl -X POST http://localhost:5000/api/v1/admin/test/cron/expire
curl -X POST http://localhost:5000/api/v1/admin/test/cron/notify
curl -X POST http://localhost:5000/api/v1/admin/test/cron/health
```

---

## 6️⃣ View Cron Logs

```javascript
// Add to admin routes for log viewing
router.get('/cron/logs', async (req, res) => {
  try {
    const { limit = 50, job } = req.query;
    
    let query = supabase
      .from('cron_job_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (job) {
      query = query.eq('job_name', job);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cron/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cron_health_logs')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📅 Cron Schedule Reference

| Job | Schedule | Frequency | Timezone |
|-----|----------|-----------|----------|
| Publish Ads | `0 */5 * * * *` | Every 5 minutes | UTC |
| Expire Ads | `0 2 * * *` | Daily 2:00 AM | UTC |
| Notifications | `0 8 * * *` | Daily 8:00 AM | UTC |
| Health Logger | `0 * * * *` | Hourly | UTC |

---

## 🔍 Key Features

✅ **Auto-Publish**: Publishes ads after payment verification  
✅ **Auto-Expire**: Marks old ads as expired  
✅ **Email Notifications**: Warns users before ad expiry  
✅ **System Monitoring**: Logs health metrics hourly  
✅ **Concurrent Protection**: Job locks prevent duplicate execution  
✅ **Error Resilience**: Individual item failures don't block job  
✅ **Audit Trail**: All jobs logged for debugging  

---

## ⚡ Performance Metrics

With default settings:

| Metric | Value |
|--------|-------|
| Publish check interval | 5 minutes |
| Max ads per health check | Full count |
| Memory warning threshold | 90% heap |
| Log retention | Unlimited (purge as needed) |

---

## 🚀 Next Steps

1. ✅ Copy cron/index.js to `backend/src/cron/`
2. ✅ Copy notification.service.js to `backend/src/services/`
3. Update `backend/server.js` with initializeCronJobs()
4. Create database tables (SQL above)
5. Configure .env file
6. Test endpoints manually
7. Monitor logs in production

Done! Your cron jobs are ready. 🎉

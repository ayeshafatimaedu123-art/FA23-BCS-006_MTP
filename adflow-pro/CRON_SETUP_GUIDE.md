# Cron Jobs Setup Guide - AdFlow Pro

## Overview

This guide walks you through setting up and configuring CRON jobs for AdFlow Pro. The system includes 4 automated tasks that handle ad lifecycle management, notifications, and system monitoring.

---

## 🎯 Jobs Overview

### 1. **Publish Scheduled Ads**
- **Schedule**: Every 5 minutes (`0 */5 * * * *`)
- **Purpose**: Auto-publishes ads after payment verification
- **Actions**:
  - Fetches ads with status `awaiting_payment` and `payment_verified = true`
  - Updates status to `published`
  - Calculates expiry date based on package type
  - Creates status history record
  - Sends published notification to user
- **Error Handling**: Locks prevent concurrent execution; individual ad failures don't block others

### 2. **Expire Ads Automatically**
- **Schedule**: Daily at 2:00 AM UTC (`0 2 * * *`)
- **Purpose**: Marks published ads as expired when their expiry date passes
- **Actions**:
  - Queries all published/paused ads past their `expires_at` date
  - Updates status to `expired`
  - Creates status history record
  - Records expiry reason in database
- **Why 2 AM**: Off-peak hours to minimize server load

### 3. **Send Expiry Notifications**
- **Schedule**: Daily at 8:00 AM UTC (`0 8 * * *`)
- **Purpose**: Proactively notifies users about upcoming/recent ad expiry
- **Actions**:
  - Finds ads expiring in next 7 days
  - Groups by urgency: expiring today, 1-3 days, 4-7 days
  - Sends differentiated email notifications
  - Encourages early renewal
- **Urgency Levels**:
  - **TODAY** (red): Ads expiring <24 hours
  - **VERY SOON** (orange): Ads expiring in 1-3 days
  - **SOON** (blue): Ads expiring in 4-7 days

### 4. **System Health Logger**
- **Schedule**: Hourly (`0 * * * *`)
- **Purpose**: Monitors and logs system metrics for production health
- **Metrics Logged**:
  - Server uptime (formatted)
  - Memory heap usage (MB and percentage)
  - Total ads count by status
  - Total users count
  - Node.js version
  - Status (healthy/warning)
- **Storage**: `cron_health_logs` table
- **Alerting**: Logs warning if heap usage > 90%

---

## 📦 Prerequisites

### Required Dependencies
```bash
# Already included in package.json
npm install node-cron nodemailer @supabase/supabase-js
```

### Environment Variables
Create or update `.env` file with:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail  # or your preferred service
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
# For Gmail: Use App Passwords, not your main password
# See: https://support.google.com/accounts/answer/185833

# Frontend URL (for notification links)
FRONTEND_URL=http://localhost:3000  # development
FRONTEND_URL=https://adflow.pro      # production

# Node Environment
NODE_ENV=production
PORT=5000
```

### Gmail Setup (for notifications)
1. Enable 2FA on your Gmail account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the 16-character password in `EMAIL_PASSWORD`

---

## 🗄️ Database Setup

### Required Tables

#### 1. **cron_job_logs** (Event logging)
```sql
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  job_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'started', 'completed', 'failed'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT job_status_check CHECK (status IN ('started', 'completed', 'failed'))
);

CREATE INDEX idx_cron_job_logs_job_name ON cron_job_logs(job_name);
CREATE INDEX idx_cron_job_logs_created_at ON cron_job_logs(created_at DESC);
```

#### 2. **cron_health_logs** (Health metrics)
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
  status VARCHAR(20), -- 'healthy', 'warning'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cron_health_logs_timestamp ON cron_health_logs(timestamp DESC);
CREATE INDEX idx_cron_health_logs_status ON cron_health_logs(status);
```

#### 3. **ad_status_history** (Status transitions - if not already created)
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

CREATE INDEX idx_ad_status_history_ad_id ON ad_status_history(ad_id);
CREATE INDEX idx_ad_status_history_created_at ON ad_status_history(created_at DESC);
```

#### 4. **Database Helper Function** (for health stats)
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

## 🚀 Integration Steps

### Step 1: Copy Cron Files

```bash
# The cron/index.js file should already be in:
backend/src/cron/index.js

# The notification service should already be in:
backend/src/services/notification.service.js
```

### Step 2: Update server.js

Add cron job initialization to your main server file:

```javascript
// backend/server.js - Add these imports at the top
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

    // 🆕 Initialize cron jobs
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

### Step 3: Update Exports in Services

Ensure `ad.service.advanced.js` has proper exports:

```javascript
// At the end of ad.service.advanced.js
export {
  createAdAdvanced,
  getAdByIdAdvanced,
  searchAdsAdvanced,
  publishAd,
  expireOldAds,
  updateRankingScores,
  // ... other exports
};

// Also export as default for CommonJS compatibility
export default {
  createAdAdvanced,
  searchAdsAdvanced,
  expireOldAds,
  // ... other exports
};
```

### Step 4: Fix Imports in Cron File

If using CommonJS, update the cron/index.js imports:

```javascript
// For CommonJS (if using .js files, not .mjs):
import { initializeCronJobs } from './src/cron/index.js';

// Or for require-based imports:
const { initializeCronJobs } = require('./src/cron/index.js');
```

---

## 🧪 Testing Cron Jobs

### Test in Development

```bash
# Start the server
npm run dev

# You should see:
# 🚀 Initializing CRON Jobs...
# ✓ Scheduled: Publish Ads (every 5 minutes)
# ✓ Scheduled: Expire Ads (daily at 2:00 AM)
# ✓ Scheduled: Send Notifications (daily at 8:00 AM)
# ✓ Scheduled: Health Logger (every hour)
# ✅ All CRON jobs initialized successfully!
```

### Manual Job Execution (for testing)

Create a test route in your admin controller:

```javascript
// backend/src/routes/admin.routes.js
import { manualTriggers } from '../cron/index.js';

// Add test endpoint
router.post('/test/cron/publish', async (req, res) => {
  try {
    await manualTriggers.publishScheduledAds();
    res.json({ message: 'Publish job executed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test/cron/expire', async (req, res) => {
  try {
    await manualTriggers.expireAdsAutomatically();
    res.json({ message: 'Expire job executed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test/cron/notify', async (req, res) => {
  try {
    await manualTriggers.sendExpiryNotifications();
    res.json({ message: 'Notification job executed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test/cron/health', async (req, res) => {
  try {
    await manualTriggers.logSystemHealth();
    res.json({ message: 'Health check executed' });
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

## 📊 Monitoring Cron Jobs

### View Job Logs

```sql
-- Last 10 cron job executions
SELECT job_name, status, metadata, created_at 
FROM cron_job_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Failed jobs
SELECT * FROM cron_job_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Job execution by date
SELECT 
  DATE(created_at) as date, 
  job_name, 
  COUNT(*) as executions,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM cron_job_logs
GROUP BY DATE(created_at), job_name
ORDER BY date DESC;
```

### View Health Metrics

```sql
-- Last 24 hours of health metrics
SELECT 
  timestamp,
  uptime_seconds,
  memory_heap_used_percent,
  ads_total,
  ads_published,
  status
FROM cron_health_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Memory usage trend
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  AVG(memory_heap_used_percent) as avg_memory,
  MAX(memory_heap_used_percent) as peak_memory
FROM cron_health_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;
```

### Create Admin Dashboard Endpoints

```javascript
// backend/src/routes/admin.routes.js

// Get recent cron logs
router.get('/cron/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cron_job_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get health metrics
router.get('/cron/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cron_health_logs')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job statistics
router.get('/cron/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('get_cron_statistics');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## ⚙️ Configuration Customization

### Adjust Cron Schedules

Edit `backend/src/cron/index.js` and modify the cron expressions:

```javascript
// Current schedules:
const publishJob = cron.schedule('0 */5 * * * *', publishScheduledAds);   // Every 5 min
const expireJob = cron.schedule('0 2 * * *', expireAdsAutomatically);     // Daily 2 AM
const notifyJob = cron.schedule('0 8 * * *', sendExpiryNotifications);    // Daily 8 AM
const healthJob = cron.schedule('0 * * * *', logSystemHealth);             // Every hour

// Cron expression format: second minute hour day-of-month month day-of-week
// Examples:
// '0 */5 * * * *'  = Every 5 minutes
// '0 0 * * *'      = Every day at midnight
// '0 9-17 * * 1-5' = Every hour 9 AM to 5 PM, Monday to Friday
// '0 0 1 * *'      = First day of every month
```

### Adjust Package Expiry

Edit the `getPackageExpiryDays` function:

```javascript
const getPackageExpiryDays = (packageType) => {
  const expiryMap = {
    basic: 14,       // 2 weeks
    standard: 30,    // 1 month (default)
    premium: 60,     // 2 months
    featured: 90,    // 3 months
    platinum: 180    // 6 months
  };
  return expiryMap[packageType] || 30;
};
```

### Adjust Notification Thresholds

Edit the `sendExpiryNotifications` function:

```javascript
// Adjust when notifications are sent:
const threeDaysFromNow = new Date();
threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

const sevenDaysFromNow = new Date();
sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

// Change these numbers to adjust notification windows
// Currently: notifies if expiring in next 7 days
//            urgent if expiring in next 3 days
//            critical if expiring in next 1 day
```

---

## 🚨 Error Handling & Recovery

### Job Lock Mechanism

The system includes job locks to prevent concurrent execution:

```javascript
const jobLocks = {
  publishScheduled: false,
  expireAds: false,
  sendNotifications: false,
  healthCheck: false
};

// If a job is already running, subsequent triggers are skipped
if (jobLocks.publishScheduled) return;
jobLocks.publishScheduled = true;
// ... job execution ...
jobLocks.publishScheduled = false; // Release lock
```

### Graceful Error Handling

Each job:
1. Catches individual item failures without blocking the whole job
2. Logs errors to `cron_job_logs` table
3. Continues processing remaining items
4. Returns summary of successes and failures

### Monitoring Failed Jobs

```javascript
// Check for failed jobs in last hour
SELECT * FROM cron_job_logs
WHERE status = 'failed'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

// Alert if specific job fails
SELECT COUNT(*) as failures
FROM cron_job_logs
WHERE job_name = 'publishScheduledAds'
AND status = 'failed'
AND created_at > NOW() - INTERVAL '6 hours';
```

---

## 📱 Notification Templates

### Email Templates Used

1. **Published Notification**
   - Confirms ad is live
   - Shows expiry date
   - Provides link to ad dashboard
   - Explains renewal process

2. **Expiry Notifications**
   - Color-coded by urgency (red/orange/blue)
   - Shows days until expiry
   - Renewal link
   - Call-to-action button

3. **Renewal Success**
   - Confirms renewal
   - Shows new expiry date
   - Package details

All templates use HTML with responsive design and are branded with AdFlow Pro logo/colors.

---

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` file to git
- Use `.env.example` for documentation
- Rotate credentials quarterly

### Database Access
- Service role key only used server-side
- Cron jobs run with full service role permissions
- Row-level security policies applied to sensitive tables

### Email Security
- Verify SMTP credentials
- Use App Passwords instead of main passwords
- Enable 2FA on email accounts

### Rate Limiting
- Cron jobs don't trigger API rate limits (server-side execution)
- Batch operations included for efficiency
- Job locks prevent concurrent execution

---

## 📈 Production Deployment

### Scaling Considerations

For high-volume deployments:

```javascript
// Increase batch sizes
const result = await adServiceAdvanced.updateRankingScores(supabase, 500); // 500 ads per run

// Consider running on separate worker process
// OR use job queue service (Bull, RabbitMQ)
```

### Deployment Checklist

- [ ] Database tables created with proper indexes
- [ ] Environment variables configured
- [ ] Service role key set in production
- [ ] Email credentials verified
- [ ] Cron jobs tested manually
- [ ] Health monitoring endpoint accessible
- [ ] Admin dashboard endpoints deployed
- [ ] Error alerting configured
- [ ] Log retention policy set
- [ ] Backup strategy in place

### PM2 Configuration (for process management)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'adflow-api',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};

// Run with: pm2 start ecosystem.config.js
```

---

## 🐛 Troubleshooting

### Cron Jobs Not Running

```bash
# Check if jobs are initialized
curl http://localhost:5000/health

# Check server logs for initialization messages
npm run dev

# Verify server.js includes initializeCronJobs()
grep -n "initializeCronJobs" backend/server.js
```

### Emails Not Sending

```javascript
// Test email configuration
const transporter = nodemailer.createTransport({...});
await transporter.verify(); // Should return true

// Check EMAIL_* environment variables
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASSWORD); // Don't print password!
```

### High Memory Usage

```sql
-- Check memory trends
SELECT * FROM cron_health_logs
WHERE memory_heap_used_percent > 85
ORDER BY timestamp DESC;

-- Consider:
-- - Increasing Node heap size: node --max-old-space-size=4096 server.js
-- - Reducing batch sizes in cron jobs
-- - Implementing caching for read-heavy operations
```

### Database Connection Timeouts

```javascript
// Increase connection timeout in Supabase client
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } }
});

// Or reduce concurrent requests in cron jobs
```

---

## 📞 Support & Resources

- Node-cron Documentation: https://github.com/kelektiv/node-cron
- Nodemailer Guide: https://nodemailer.com/
- Cron Expression Builder: https://crontab.guru/
- Supabase Docs: https://supabase.com/docs

---

## 📝 Changelog

### Version 1.0 (Current)
- ✅ 4 production-ready cron jobs
- ✅ Health monitoring and logging
- ✅ Email notifications system
- ✅ Concurrent execution prevention
- ✅ Comprehensive error handling
- ✅ Database logging

---

**Last Updated**: April 2026  
**Status**: Production Ready ✅

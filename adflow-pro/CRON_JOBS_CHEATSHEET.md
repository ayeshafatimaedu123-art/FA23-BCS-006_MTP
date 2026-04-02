# Cron Jobs Cheat Sheet

## 📅 Job Schedule Reference

| Job Name | Schedule | Frequency | What It Does |
|----------|----------|-----------|--------------|
| `publishScheduledAds` | `0 */5 * * * *` | Every 5 min | Auto-publish paid ads |
| `expireAdsAutomatically` | `0 2 * * *` | Daily 2 AM | Mark old ads as expired |
| `sendExpiryNotifications` | `0 8 * * *` | Daily 8 AM | Email users about expiry |
| `logSystemHealth` | `0 * * * *` | Every hour | Log system metrics |

---

## 🔧 Configuration

### .env Variables
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password-16-chars
FRONTEND_URL=https://adflow.pro
```

### Package Expiry Days
```
Basic:     14 days
Standard:  30 days
Premium:   60 days
Featured:  90 days
Platinum:  180 days
```

### Notification Thresholds
```
TODAY:      < 1 day   (Red)
VERY SOON:  1-3 days  (Orange)
SOON:       4-7 days  (Blue)
```

---

## 🗄️ Database Tables

### cron_job_logs
Tracks all job executions
```sql
CREATE TABLE cron_job_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ,
  job_name VARCHAR(100),
  status: 'started'|'completed'|'failed',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW
)
```

### cron_health_logs
System health snapshots
```sql
CREATE TABLE cron_health_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ,
  uptime_seconds INTEGER,
  memory_heap_used_percent DECIMAL,
  ads_total, ads_published, ads_expired INTEGER,
  status: 'healthy'|'warning',
  created_at TIMESTAMPTZ DEFAULT NOW
)
```

### ad_status_history
Ad transition audit trail
```sql
CREATE TABLE ad_status_history (
  id UUID PRIMARY KEY,
  ad_id UUID,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  reason TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW
)
```

---

## 📂 File Structure

```
backend/
├── server.js  ← Add: initializeCronJobs()
├── src/
│   ├── cron/
│   │   └── index.js  ← NEW (450+ lines)
│   └── services/
│       └── notification.service.js  ← NEW (250+ lines)
└── package.json  ← Already has node-cron

database/migrations/
└── 003_add_cron_tables.sql  ← NEW (400+ lines)

Documentation/
├── CRON_SETUP_GUIDE.md  ← Comprehensive (800+ lines)
├── CRON_QUICK_START.md  ← Quick ref (300+ lines)
├── CRON_IMPLEMENTATION_SUMMARY.md  ← This overview
└── CRON_JOBS_CHEATSHEET.md  ← This file
```

---

## ⚡ Quick Integration

### Step 1: Update server.js
```javascript
import { initializeCronJobs } from './src/cron/index.js';

// In startServer():
initializeCronJobs();
```

### Step 2: .env
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
FRONTEND_URL=https://adflow.pro
```

### Step 3: Run Migration
Copy/paste SQL from `database/migrations/003_add_cron_tables.sql` into Supabase SQL editor

### Step 4: Test
```bash
npm run dev
# Should see:
# ✓ Scheduled: Publish Ads (every 5 minutes)
# ✓ Scheduled: Expire Ads (daily at 2:00 AM)
# ✓ Scheduled: Send Notifications (daily at 8:00 AM)
# ✓ Scheduled: Health Logger (every hour)
```

---

## 🔍 Monitoring Commands

### View Recent Jobs
```sql
SELECT job_name, status, metadata, created_at
FROM cron_job_logs
ORDER BY created_at DESC
LIMIT 20;
```

### View Failed Jobs (24 hours)
```sql
SELECT * FROM cron_job_logs
WHERE status = 'failed'
AND created_at > NOW() - INTERVAL '24 hours';
```

### View Health Metrics (24 hours)
```sql
SELECT timestamp, memory_heap_used_percent, ads_total, status
FROM cron_health_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

### View Job Statistics
```sql
SELECT * FROM get_cron_statistics(24);  -- Last 24 hours
```

### View Ad Status Changes Today
```sql
SELECT * FROM v_ad_status_transitions_today;
```

---

## 🧪 Test Endpoints (Optional)

Add to admin routes:
```javascript
import { manualTriggers } from '../cron/index.js';

router.post('/test/cron/publish', async (req, res) => {
  await manualTriggers.publishScheduledAds();
  res.json({ success: true });
});

router.post('/test/cron/expire', async (req, res) => {
  await manualTriggers.expireAdsAutomatically();
  res.json({ success: true });
});

router.post('/test/cron/notify', async (req, res) => {
  await manualTriggers.sendExpiryNotifications();
  res.json({ success: true });
});

router.post('/test/cron/health', async (req, res) => {
  await manualTriggers.logSystemHealth();
  res.json({ success: true });
});
```

Test via curl:
```bash
curl -X POST http://localhost:5000/api/v1/admin/test/cron/publish
```

---

## 🔒 Security Checklist

- [ ] Service role key never exposed in frontend
- [ ] Email passwords use app passwords (not main password)
- [ ] RLS policies enabled on all tables
- [ ] Job locks prevent concurrent execution
- [ ] Error handling doesn't leak sensitive data
- [ ] FRONTEND_URL doesn't expose sensitive paths
- [ ] .env file not committed to git

---

## 📈 Performance Tips

| Optimization | How | When |
|--------------|-----|------|
| Increase batch size | Change limit in updateRankingScores | >1000 ads |
| Reduce job frequency | Edit cron expression | Reduce load |
| Move to worker process | Use separate Node process | >10000 ads |
| Use job queue | Implement Bull/RabbitMQ | High volume |
| Archive old logs | Run cleanup_old_logs() | Monthly |

---

## 🚨 Common Issues & Fixes

### Cron not running
```bash
# Check server logs for initialization
# Verify: initializeCronJobs() in server.js ✓
# Check: PORT 5000 accessible ✓
```

### Emails not sending
```env
# Gmail app password issues:
EMAIL_PASSWORD=xbcd efgh ijkl mnop  ← Remove spaces!
EMAIL_PASSWORD=xbcdefghijklmnop    ← This format
```

### Database errors
```sql
-- Verify tables exist:
SELECT * FROM cron_job_logs LIMIT 1;
SELECT * FROM cron_health_logs LIMIT 1;
-- If error: Run migration SQL
```

### High memory
```sql
-- Check memory trend:
SELECT * FROM v_health_warnings;
-- Solution: Reduce batch sizes or increase Node heap
```

---

## 📊 Key Metrics

```
Response Time:
- Publish job: ~500-2000ms (depends on ads count)
- Expire job: ~1000-3000ms
- Notification job: ~2000-5000ms (email sending)
- Health job: ~100-500ms

Database Queries:
- Each job runs 1-3 queries
- Batch operations reduce query count
- Indexes optimize all reads

Memory Usage:
- Normal: 50-70% heap
- Warning: >80% heap
- Critical: >90% heap
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Node-cron Docs | https://github.com/kelektiv/node-cron |
| Nodemailer Guide | https://nodemailer.com/ |
| Cron Expressions | https://crontab.guru/ |
| Supabase Docs | https://supabase.com/docs |
| PostgreSQL Docs | https://www.postgresql.org/docs/ |

---

## 📞 API Endpoints (if added)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/cron/logs` | View job logs |
| GET | `/api/v1/admin/cron/health` | View health metrics |
| GET | `/api/v1/admin/cron/stats` | Get job statistics |
| POST | `/api/v1/admin/test/cron/*` | Test jobs manually |

---

## 🎯 Typical Job Outputs

### publishScheduledAds
```
✓ Published: 5 ads
✗ Failed: 0 ads
⏱️ Duration: 1.2s
```

### expireAdsAutomatically
```
✓ Expired: 3 ads
✗ Failed: 0 ads
⏱️ Duration: 0.8s
```

### sendExpiryNotifications
```
✓ Notifications sent: 12
  - TODAY (1 ad)
  - VERY SOON (3 ads)
  - SOON (8 ads)
✗ Failed: 0
⏱️ Duration: 2.5s
```

### logSystemHealth
```
💚 Uptime: 7d 3h
📊 Memory: 156MB / 256MB (61%)
📈 Ads: 1,245 total | 892 published | 153 expired
👥 Users: 456 total
```

---

## 🎓 Job Dependency Tree

```
publicished Ads ✓ → Ad with payment
              ✓ → Update status → send notification ✓
              
Expire Ads ✓ → Old published ads
            ✓ → Update status
            → Create history ✓
            → Ready for renewal

Send Notifications ✓ → Published ads expiring soon
                    ✓ → Send urgency-based emails
                    ✓ → Log delivery

Health Logger ✓ → System metrics
              ✓ → Database stats
              ✓ → Log to DB ✓
```

---

## ⚙️ Customization Examples

### Change publish frequency to every 10 minutes:
```javascript
// In cron/index.js
const publishJob = cron.schedule('0 */10 * * * *', publishScheduledAds);
```

### Change expiry warning window to 14 days:
```javascript
// In cron/index.js - sendExpiryNotifications()
const fourteenDaysFromNow = new Date();
fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
```

### Change premium package to 90 days:
```javascript
// In cron/index.js - getPackageExpiryDays()
const expiryMap = {
  premium: 90,  // Changed from 60
  // ...
};
```

---

## 📝 Logging Format

```javascript
// All jobs log in this format:
console.log(`📤 [2026-04-02T08:30:00.000Z] Publishing scheduled ads...`);
console.log(`  ✓ Ad 123e4567 published (expires: 05/02/2026)`);
console.log(`✓ Completed in 1234ms | Published: 5 | Failed: 0`);

// Icons used:
📤 = Publishing        🎯 = Publishing
⏰ = Expiring          📬 = Notifications
💚 = Health check      ✓ = Success
✗ = Failure            ⚠️ = Warning
```

---

## 💾 Database Cleanup

```sql
-- Delete logs older than 30 days
SELECT * FROM cleanup_old_logs(30);
-- Returns: (cron_logs_deleted: X, health_logs_deleted: Y)

-- Manual cleanup if function unavailable:
DELETE FROM cron_job_logs
WHERE created_at < NOW() - INTERVAL '30 days';

DELETE FROM cron_health_logs
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## 🌍 Timezone Note

All cron jobs use **UTC timezone**.

For different timezone conversions:
```
UTC 2 AM (Expire)        = 9 PM EST / 6 PM PST (previous day)
UTC 8 AM (Notifications) = 3 AM EST / 12 AM PST
UTC 5 min (Publish)      = Every 5 min (all timezones)
```

---

## ✅ Production Ready Features

✅ Error handling with try-catch  
✅ Job locks prevent duplicates  
✅ Database logging & monitoring  
✅ Email notifications  
✅ Health metrics collection  
✅ Graceful degradation  
✅ Concurrent execution prevention  
✅ Comprehensive documentation  
✅ Test endpoints included  
✅ RLS security policies  

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Production Ready ✅

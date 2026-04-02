# 📘 CRON Jobs Documentation Index

Your complete guide to AdFlow Pro's automated tasks system.

---

## 🚀 Getting Started (Choose Your Path)

### 👤 **I'm in a hurry - gimme 6 steps!**
👉 Start here: [**CRON_QUICK_START.md**](CRON_QUICK_START.md) (5 min read)
- Quick integration checklist
- .env template
- Database SQL
- Testing via curl
- Result: Cron jobs running

### 📚 **I want full documentation**
👉 Start here: [**CRON_SETUP_GUIDE.md**](CRON_SETUP_GUIDE.md) (20 min read)
- Comprehensive explanations
- Production deployment guide
- Monitoring strategies
- Troubleshooting section
- Security considerations
- Result: Expert understanding

### 📊 **I need the overview**
👉 Start here: [**CRON_IMPLEMENTATION_SUMMARY.md**](CRON_IMPLEMENTATION_SUMMARY.md) (10 min read)
- What was built
- Job specifications
- Integration checklist
- Key metrics
- Result: Clear understanding of system

### 🎯 **I need quick reference**
👉 Start here: [**CRON_JOBS_CHEATSHEET.md**](CRON_JOBS_CHEATSHEET.md) (2 min read)
- Schedule table
- Configuration reference
- Common queries
- Common issues & fixes
- Result: Quick answers

---

## 📑 All Documentation Files

| File | Read Time | Best For | Key Info |
|------|-----------|----------|----------|
| [CRON_QUICK_START.md](CRON_QUICK_START.md) | 5 min | Fast integration | Steps 1-6, .env, SQL |
| [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) | 20 min | Complete setup | Full guide, production |
| [CRON_IMPLEMENTATION_SUMMARY.md](CRON_IMPLEMENTATION_SUMMARY.md) | 10 min | Overview | What's built, specs |
| [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) | 2 min | Quick reference | Tables, queries, tips |
| [CRON_JOBS_DELIVERY.md](CRON_JOBS_DELIVERY.md) | 5 min | Deliverables list | What you got |

---

## 🎯 Job Guide

Need details about a specific job?

### **Job 1: Publish Scheduled Ads**
- **Location**: CRON_SETUP_GUIDE.md → "Publish Scheduled Ads"
- **Schedule**: Every 5 minutes
- **What it does**: Auto-publishes paid ads
- **Formula**: Query `awaiting_payment` + `payment_verified` → update status → send email
- **Monitoring**: Query `cron_job_logs` where job_name = 'publishScheduledAds'

### **Job 2: Expire Ads Automatically**
- **Location**: CRON_SETUP_GUIDE.md → "Expire Ads Automatically"
- **Schedule**: Daily at 2 AM
- **What it does**: Marks old ads as expired
- **Formula**: Query ads past `expires_at` → update status to expired
- **Monitoring**: Query `cron_job_logs` where job_name = 'expireAdsAutomatically'

### **Job 3: Send Expiry Notifications**
- **Location**: CRON_SETUP_GUIDE.md → "Send Expiry Notifications"
- **Schedule**: Daily at 8 AM
- **What it does**: Email warnings before expiry
- **Formula**: Test 3 urgency levels → send emails → log results
- **Monitoring**: View `v_cron_recent_failures` for failed notifications

### **Job 4: System Health Logger**
- **Location**: CRON_SETUP_GUIDE.md → "System Health Logger"
- **Schedule**: Every hour
- **What it does**: Log system metrics
- **Formula**: Collect memory/uptime/ads/users → store in DB
- **Monitoring**: Query `cron_health_logs` with time range

---

## 🔧 Common Tasks

### **I want to integrate RIGHT NOW**
1. Read: [CRON_QUICK_START.md](CRON_QUICK_START.md) (5 min)
2. Do: Steps 1-6
3. Test: Run curl to verify
4. Done! ✅

### **I want to customize schedules**
1. Find: "Adjust Cron Schedules" in [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md)
2. Edit: `backend/src/cron/index.js` line ~400
3. Visit: https://crontab.guru/ to test expression
4. Restart server
5. Done! ✅

### **I want to monitor jobs**
1. Find: "Monitoring Cron Jobs" in [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md)
2. Run: SQL queries from "View Job Logs" section
3. Add: Dashboard endpoints from "Create Admin Dashboard Endpoints"
4. Done! ✅

### **I want to troubleshoot**
1. Find: "Troubleshooting" in [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) OR
2. Use: [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) → "🚨 Common Issues & Fixes"
3. Apply: Solution for your issue
4. Done! ✅

### **I want to test manually**
1. Find: "Testing Cron Jobs" in [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md)
2. Add: Test endpoints from code snippets
3. Run: Curl commands to trigger jobs
4. Monitor: Check console and database logs
5. Done! ✅

---

## 📍 Where to Find...

### **Environment Setup**
- .env template: [CRON_QUICK_START.md](CRON_QUICK_START.md) → Step 2
- Full explanation: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "Prerequisites"
- .env reference: [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) → "Configuration"

### **Database Setup**
- Quick SQL: [CRON_QUICK_START.md](CRON_QUICK_START.md) → Step 3
- Full migration: `database/migrations/003_add_cron_tables.sql`
- Detailed explanation: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "Database Setup"
- Verification: [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) → "🗄️ Database Tables"

### **Integration Code**
- Quick steps: [CRON_QUICK_START.md](CRON_QUICK_START.md) → Steps 1-3
- Full guide: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "Integration Steps"
- Code snippets: [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) → "🧪 Test Endpoints"

### **Monitoring**
- Quick queries: [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) → "🔍 Monitoring Commands"
- Full guide: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "Monitoring Cron Jobs"
- API endpoints: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "Create Admin Dashboard Endpoints"

### **Troubleshooting**
- Quick fixes: [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) → "🚨 Common Issues & Fixes"
- Detailed guide: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "🐛 Troubleshooting"
- Error messages: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "Error Handling & Recovery"

### **Security**
- Checklist: [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) → "🔒 Security Checklist"
- Full guide: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "🔒 Security Considerations"
- Implementation: [database/migrations/003_add_cron_tables.sql](database/migrations/003_add_cron_tables.sql)

### **Production**
- Checklist: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "Production Deployment"
- Configuration: [CRON_JOBS_CHEATSHEET.md](CRON_JOBS_CHEATSHEET.md) → "⚙️ Customization Examples"
- PM2 setup: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) → "PM2 Configuration"

---

## 📞 Quick Reference Cards

### **Commands You'll Need**

Start dev server:
```bash
npm run dev
```

Start production server:
```bash
npm start  # or PM2
```

Test a job manually:
```bash
curl -X POST http://localhost:5000/api/v1/admin/test/cron/publish
```

View recent logs:
```sql
SELECT * FROM cron_job_logs ORDER BY created_at DESC LIMIT 20;
```

Check job health:
```sql
SELECT * FROM get_cron_statistics(24);
```

---

### **File Locations**

Cron code:
```
backend/src/cron/index.js
```

Email service:
```
backend/src/services/notification.service.js
```

Database migration:
```
database/migrations/003_add_cron_tables.sql
```

Config template:
```
.env (create from .env.example)
```

---

## 🎓 Learning Path (Beginner to Expert)

### **Level 1: Beginner (15 min)**
1. Read: [CRON_QUICK_START.md](CRON_QUICK_START.md)
2. Copy: Files to correct directories
3. Configure: .env variables
4. Test: Run `npm run dev`
5. **Result**: Cron jobs working ✅

### **Level 2: Intermediate (45 min)**
1. Read: [CRON_IMPLEMENTATION_SUMMARY.md](CRON_IMPLEMENTATION_SUMMARY.md)
2. Understand: Each job's purpose
3. Run: Manual job triggers
4. Monitor: Check database logs
5. **Result**: Can monitor & debug ✅

### **Level 3: Advanced (120 min)**
1. Read: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md)
2. Customize: Adjust schedules/thresholds
3. Create: Dashboard endpoints
4. Deploy: To production
5. **Result**: Production expert ✅

---

## ✅ Integration Verification

After integration, verify these are working:

- [ ] Cron jobs initialized at server startup
- [ ] Database tables created in Supabase
- [ ] Emails sending (if test triggered)
- [ ] Logs appearing in `cron_job_logs` table
- [ ] Health metrics in `cron_health_logs` table
- [ ] Manual job triggers work (if added)

---

## 🔗 Quick Links

| Resource | URL | Use When |
|----------|-----|----------|
| Node-cron | https://github.com/kelektiv/node-cron | Understanding cron |
| Cron Guru | https://crontab.guru/ | Building expressions |
| Nodemailer | https://nodemailer.com/ | Email issues |
| Supabase | https://supabase.com/docs | Database help |
| PostgreSQL | https://www.postgresql.org/docs/ | SQL questions |

---

## 📊 File Sizes & Content

| File | Size | Key Sections | When to Read |
|------|------|--------------|--------------|
| CRON_QUICK_START.md | ~300 lines | 6 steps, .env, SQL | First thing |
| CRON_SETUP_GUIDE.md | ~800 lines | Everything | For details |
| CRON_IMPLEMENTATION_SUMMARY.md | ~400 lines | Overview, specs | For understanding |
| CRON_JOBS_CHEATSHEET.md | ~300 lines | Tables, queries | For quick lookup |
| CRON_JOBS_DELIVERY.md | ~400 lines | Deliverables | For verification |
| backend/src/cron/index.js | ~450 lines | 4 jobs | Code reference |
| notification.service.js | ~250 lines | Email functions | Code reference |
| SQL migration | ~400 lines | Tables, indexes | Database setup |

---

## 🎯 Decision Tree

```
START HERE
    ↓
Do you want to:
    ├─ Integrate NOW?          → CRON_QUICK_START.md
    ├─ Learn everything?       → CRON_SETUP_GUIDE.md
    ├─ See overview?           → CRON_IMPLEMENTATION_SUMMARY.md
    ├─ Quick lookup?           → CRON_JOBS_CHEATSHEET.md
    ├─ See what you got?       → CRON_JOBS_DELIVERY.md
    └─ Navigate docs?          → You are here!
            ↓
        Ready? Follow the path!
            ↓
        Have questions?
            ├─ How do I...?    → CRON_JOBS_CHEATSHEET.md
            ├─ Why does...?    → CRON_SETUP_GUIDE.md
            ├─ What's this...? → CRON_IMPLEMENTATION_SUMMARY.md
            └─ It's broken!    → CRON_SETUP_GUIDE.md (Troubleshooting)
```

---

## 🚀 Next Step

Choose your reading path above and **get started in 5 minutes!**

- **Fastest**: [CRON_QUICK_START.md](CRON_QUICK_START.md) (5 min)
- **Complete**: [CRON_SETUP_GUIDE.md](CRON_SETUP_GUIDE.md) (20 min)
- **Smart**: [CRON_IMPLEMENTATION_SUMMARY.md](CRON_IMPLEMENTATION_SUMMARY.md) (10 min)

---

**Status**: ✅ Ready to use  
**Updated**: April 2026  
**Support**: Full documentation included

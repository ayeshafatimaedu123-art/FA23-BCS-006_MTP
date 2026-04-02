# Deployment Guide for AdFlow Pro

## Production Deployment Strategy

### Architecture Overview
```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│  Vercel     │         │  Railway/    │         │  Supabase      │
│  (Frontend) │ ------> │  Render      │ ------> │  PostgreSQL    │
│  Next.js    │         │  (Backend)   │         │  Database      │
└─────────────┘         └──────────────┘         └────────────────┘
      ↓
   Cloudflare CDN
   (Optional)
```

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository
```bash
# Remove sensitive files
rm .env.local
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Remove local env file"
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select `frontend` as root directory
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.adflow.pro
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   ```
6. Deploy!

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.adflow.pro/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=AdFlow Pro
NEXT_PUBLIC_APP_URL=https://adflow.pro
```

## Backend Deployment

### Option 1: Railway.app (Recommended)

#### Setup
1. Go to [railway.app](https://railway.app)
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Select your repository
5. Select `backend` directory

#### Configure
1. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=xxx
   JWT_SECRET=generate-long-random-string
   JWT_EXPIRE=7d
   REFRESH_TOKEN_SECRET=generate-long-random-string
   ```

2. Create PostgreSQL plugin (optional if using Supabase)

3. Deploy

#### Get API URL
Railway provides: `https://adflow-pro-production.railway.app`
Update frontend with this URL

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect GitHub
4. Configuration:
   - Name: `adflow-pro-api`
   - Runtime: `Node`
   - Build: `npm install`
   - Start: `npm start`
   - Region: Choose closest
5. Add environment variables (same as above)
6. Deploy

### Option 3: AWS EC2

```bash
#!/bin/bash
# SSH into instance
ssh -i key.pem ubuntu@instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repository
git clone your-repo.git
cd adflow-pro/backend

# Install dependencies
npm install

# Create .env file
sudo nano .env
# Paste all environment variables

# Build
npm run build

# Start with PM2
pm2 start npm --name "adflow-pro-api" -- start
pm2 startup
pm2 save

# Setup Nginx reverse proxy (optional)
sudo apt install nginx
# Configure nginx to proxy to localhost:5000
```

## Database Setup (Supabase)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Click "New Project"
- Select region (choose closest to users)
- Wait for provisioning (2-5 minutes)

### 2. Setup Database
1. Go to SQL Editor
2. Copy/paste entire content from `/database/migrations/001_init_schema.sql`
3. Click "Run"
4. Wait for completion

### 3. Connection Info
- Project URL: `Settings` → `API`
- API Key: Copy public key
- Database URL: `Settings` → `Database` → see connection string

### 4. Enable Row-Level Security (RLS)
```sql
-- Enable RLS on tables
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own ads"
  ON ads FOR SELECT
  using (auth.uid() = user_id);
```

## Domain Configuration

### 1. DNS Setup

#### For Frontend (Vercel)
1. Vercel provides CNAME: `cname.vercel.com`
2. Add DNS record:
   - Type: `CNAME`
   - Name: `@` or `adflow`
   - Value: `cname.vercel.com`

#### For Backend (Railway/Render)
- Both provide custom domains
- Railway: `Settings` → `Custom Domain`
- Render: `Settings` → `Custom Domain`

### 2. DNS Provider Setup
- Modify DNS where domain is registered
- Propagation: 15 minutes - 48 hours
- Test with: `nslookup yourdomain.com`

## SSL/HTTPS

All deployment platforms provide free SSL:
- Vercel: Automatic
- Railway: Automatic
- Render: Automatic
- AWS: Use AWS Certificate Manager (free)

## Environment Variables Checklist

### Production Backend
- ✅ NODE_ENV=production
- ✅ DATABASE_URL (Supabase)
- ✅ SUPABASE_URL
- ✅ SUPABASE_KEY
- ✅ JWT_SECRET (strong random string)
- ✅ JWT_EXPIRE
- ✅ REFRESH_TOKEN_SECRET (strong random string)
- ✅ MAIL_SERVICE
- ✅ MAIL_EMAIL
- ✅ MAIL_PASSWORD
- ✅ ADMIN_EMAIL

### Production Frontend
- ✅ NEXT_PUBLIC_API_URL (Production API)
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ NEXT_PUBLIC_APP_URL (Production URL)

## CI/CD Pipeline Setup

### GitHub Actions (Example)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  backend-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway build
          railway deploy

  frontend-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Monitoring & Logging

### Backend Logging
1. **Railway/Render**: Built-in logs
2. **AWS CloudWatch**: Automatic
3. **Custom**: Setup in app
   ```typescript
   import winston from 'winston';
   const logger = winston.createLogger({...});
   ```

### Frontend Monitoring
1. **Vercel Analytics**: Automatic
2. **Sentry** (Error tracking):
   ```bash
   npm install @sentry/nextjs
   ```

## Performance Optimization

### Backend
- Enable caching
- Setup Redis if needed
- Database query optimization
- Use CDN for static assets

### Frontend
- Image optimization
- Code splitting
- Lazy loading
- Lighthouse score > 90

### Database
- Index optimization
- Query performance
- Connection pooling

## Backup Strategy

### Database Backups
```bash
# Manual backup
pg_dump your_connection_string > backup_$(date +%Y%m%d).sql

# Automated (weekly)
0 2 * * 0 pg_dump your_conn > /backups/weekly_$(date +\%Y\%m\%d).sql
```

### File Backups
- GitHub for code (automatic)
- S3 for user uploads
- Supabase backups (automatic)

## Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables secure
- ✅ Database passwords strong
- ✅ API keys rotated
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ JWT secrets per environment
- ✅ Input validation enabled
- ✅ SQL injection prevention
- ✅ XSS protection enabled
- ✅ CSRF tokens implemented

## Post-Deployment Testing

```bash
# Test API
curl https://api.adflow.pro/health

# Test Database
curl https://api.adflow.pro/api/v1/public/categories

# Test Frontend
curl https://adflow.pro

# Run E2E tests
npm run test:e2e
```

## Troubleshooting

### Connection Refused
- Check backend URL in frontend
- Verify CORS headers
- Restart services

### Database Connection Error
- Verify DATABASE_URL
- Check Supabase status
- Verify network access

### SSL Certificate Error
- Wait 48 hours for DNS propagation
- Clear browser cache
- Verify domain setup

## Cost Estimation

### Supabase (Database)
- Free tier: Up to 500MB
- Starter: $25/month (1GB)
- Pro: $100/month (10GB)

### Vercel (Frontend)
- Free: Good for projects
- Pro: $20/month
- Enterprise: Custom

### Railway (Backend)
- Pay as you use
- ~$5-20/month for small project
- Estimated $50-200/month for production

**Total Estimate**: $50-300/month

## Rollback Procedure

### Frontend (Vercel)
1. Go to Deployments
2. Click "Redeploy" on previous version

### Backend (Railway/Render)
1. Go to Deployments
2. Select previous version
3. Click "Restore"

## Monitoring Check List

- [ ] Uptime monitoring enabled
- [ ] Error alerts configured
- [ ] Performance metrics tracked
- [ ] Database backups scheduled
- [ ] Log retention set
- [ ] Rate limiting working
- [ ] CORS properly configured
- [ ] API authentication working

---

## Next Steps

1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Setup custom domain
4. Configure monitoring
5. Create backup strategy
6. Setup analytics
7. Enable logging
8. Test everything

**Your app is now production-ready! 🎉**

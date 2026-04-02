# AdFlow Pro - Setup & Installation Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Basic knowledge of Node.js and Next.js

## Step 1: Clone or Extract Project

```bash
cd adflow-pro
```

## Step 2: Setup Supabase Database

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Copy your API URL and API Key

### Run Database Migrations
1. Go to Supabase SQL Editor
2. Copy entire content from `/database/migrations/001_init_schema.sql`
3. Paste into SQL editor and click "RUN"

This creates all tables, views, functions, and indexes.

### Seed Initial Data
```sql
-- Run from database/migrations/002_sample_data.sql
```

## Step 3: Backend Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Create Environment File
```bash
cp .env.example .env
```

Edit `.env`:
```
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

DATABASE_URL=postgresql://user:password@localhost:5432/adflow_pro
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-api-key

JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars  
REFRESH_TOKEN_EXPIRE=30d

MAIL_SERVICE=gmail
MAIL_EMAIL=your-email@gmail.com
MAIL_PASSWORD=your-app-password

ADMIN_EMAIL=admin@adflow.pro
```

### Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Build for Production
```bash
npm run build
npm start
```

## Step 4: Frontend Setup

### Install Dependencies
```bash
cd frontend
npm install
```

### Create Environment File
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=AdFlow Pro
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Start Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

## Step 5: Create Test Users

### Client User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@test.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Client",
    "role": "client"
  }'
```

### Moderator User (via database directly)
```sql
INSERT INTO users (email, password_hash, first_name, last_name, role, status) 
VALUES (
  'moderator@test.com',
  '$2a$10/...', -- bcrypt hash of password
  'Jane',
  'Moderator',
  'moderator',
  'active'
);
```

Press Getters
### Admin User (via database directly)
```sql
INSERT INTO users (email, password_hash, first_name, last_name, role, status) 
VALUES (
  'admin@test.com',
  '$2a$10/...', -- bcrypt hash of password
  'Admin',
  'User',
  'admin',
  'active'
);
```

## Step 6: Verify Installation

### Check Backend
```bash
curl http://localhost:5000/health
```

### Check Frontend
Open browser: `http://localhost:3000`

## Step 7: Development Workflow

### Backend Development
```bash
cd backend
npm run dev    # Start dev server with hot reload
npm run lint   # Check code style
npm run test   # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev    # Start dev server
npm run lint   # Check code style
npm run build  # Build for production
```

## Step 8: Database Backup

Export database from Supabase:
```bash
pg_dump your_connection_string > backup.sql
```

## Deployment to Vercel

### Frontend (Vercel)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project
4. Add environment variables from `.env.local`
5. Deploy

### Backend (Multiple Options)

#### Option 1: Railway.app
```bash
railway login
railway init
railway up
```

#### Option 2: Render
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repo
5. Add environment variables
6. Deploy

#### Option 3: AWS EC2
```bash
# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Install dependencies
sudo apt update
sudo apt install nodejs npm

# Clone repo and setup
git clone your-repo
cd adflow-pro/backend
npm install

# Create .env file
# Start with PM2
sudo npm i -g pm2
pm2 start npm --name "adflow-pro" -- start
pm2 startup
pm2 save
```

## Troubleshooting

### Port Already in Use
```bash
# Backend
lsof -i :5000
kill -9 <PID>

# Frontend
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
- Check SUPABASE_URL and SUPABASE_KEY
- Verify database is running
- Check network connectivity

### CORS Error
- Verify NEXT_PUBLIC_API_URL in frontend .env
- Check cors middleware in backend

### Image Upload Not Working
- Use external URLs (no local file uploads)
- Validate URL format

## Next Steps

1. **Email Setup**: Configure email provider for notifications
2. **Payment Gateway**: Setup Stripe or local payment system
3. **Cron Jobs**: Deploy scheduled tasks (using cron services)
4. **Analytics**: Setup tracking and analytics
5. **CI/CD**: Setup GitHub Actions for automatic testing/deployment
6. **Monitoring**: Add error tracking (Sentry, LogRocket)
7. **CDN**: Setup Cloudflare for static assets

## Support

For issues, check:
- Database schema: `/database/migrations/001_init_schema.sql`
- API docs: `/docs/API.md`
- Types: `/shared/types/index.ts`

---

**Happy Building! 🚀**

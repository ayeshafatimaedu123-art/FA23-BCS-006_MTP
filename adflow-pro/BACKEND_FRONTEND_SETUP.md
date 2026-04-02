# AdFlow Pro - Complete Setup Guide

> **Full-Stack Marketplace Platform** | Node.js + Express + Next.js + Supabase

## 🎯 Project Overview

AdFlow Pro is a production-ready sponsored listing marketplace platform with:

- **Backend**: Node.js + Express + Supabase (PostgreSQL)
- **Frontend**: Next.js 14 + React 18 + Tailwind CSS
- **Authentication**: JWT with bcrypt password hashing
- **Authorization**: Role-based access control (4 roles)
- **Database**: 12 tables with relations, views, triggers

---

## ✅ What's Included

### Backend (Complete)
- ✅ Express server with security middleware
- ✅ Supabase PostgreSQL database connection
- ✅ Authentication (JWT + bcrypt)
- ✅ RBAC middleware (4 roles)
- ✅ 20+ API endpoints
- ✅ Zod validation schemas
- ✅ Error handling middleware
- ✅ 20+ utility functions
- ✅ Service layer with business logic
- ✅ Controllers handling HTTP requests

### Frontend (Complete)
- ✅ Next.js 14 with App Router
- ✅ Responsive Tailwind CSS design
- ✅ Public pages (Home, Explore, Packages)
- ✅ Auth pages (Login, Register)
- ✅ Role-based dashboards (Client, Moderator, Admin)
- ✅ useAuth hook for auth management
- ✅ API client for backend communication
- ✅ Form components
- ✅ Ad card components
- ✅ Header/Footer components

### Database
- ✅ 12-table schema ready to use
- ✅ Relationships and constraints
- ✅ Views for complex queries
- ✅ Triggers for automation
- ✅ Sample data included

---

## 🚀 5-Minute Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (free at https://supabase.com)

### Step 1: Setup Supabase Database (2 minutes)

1. Go to https://supabase.com
2. Create new project
3. Go to SQL Editor tab
4. Copy content from: `/database/migrations/001_init_schema.sql`
5. Paste and execute
6. Get your credentials from Settings > API

### Step 2: Backend Setup (1 minute)

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=generate-random-string-here
```

```bash
# Start server
npm run dev
```

✓ Backend running on http://localhost:5000

### Step 3: Frontend Setup (1.5 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

```bash
# Start dev server
npm run dev
```

✓ Frontend running on http://localhost:3000

### Step 4: Test It! (30 seconds)

1. Go to http://localhost:3000/register
2. Create an account
3. View dashboard
4. Create an ad
5. Logout and login

---

## 📁 Directory Structure

```
adflow-pro/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   └── src/
│       ├── config/          # Configuration (database, constants)
│       ├── routes/          # API routes (5 files)
│       ├── controllers/      # HTTP handlers (3 files)
│       ├── services/        # Business logic (3 files)
│       ├── middlewares/      # Express middleware (4 files)
│       ├── validators/       # Zod schemas (3 files)
│       ├── utils/           # Helper functions (5 files)
│       ├── cron/            # Scheduled tasks
│       └── db/              # Database utilities
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Home page
│   │   ├── login/           # Login page
│   │   ├── register/        # Register page
│   │   ├── explore/         # Browse ads
│   │   ├── packages/        # Pricing
│   │   └── dashboard/       # Protected routes
│   ├── components/
│   │   ├── common/          # Header, Footer, AdCard
│   │   ├── forms/           # Login, Register, CreateAd forms
│   │   └── dashboard/       # Dashboard components
│   ├── lib/
│   │   ├── api/            # API client
│   │   └── hooks/          # React hooks (useAuth)
│   ├── styles/             # Tailwind + custom CSS
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── database/
│   └── migrations/
│       └── 001_init_schema.sql  # Complete DB schema
│
└── docs/
    ├── API.md              # API documentation
    ├── SETUP.md            # Setup guide
    ├── DEPLOYMENT.md       # Deployment guide
    └── PROJECT_STRUCTURE.md
```

---

## 🔑 API Endpoints

### Authentication
```
POST   /api/v1/auth/register        Register user
POST   /api/v1/auth/login           Login user
GET    /api/v1/auth/profile         Get profile
PUT    /api/v1/auth/profile         Update profile
POST   /api/v1/auth/logout          Logout (client-side)
```

### Ads (Public)
```
GET    /api/v1/ads                  Search all ads
GET    /api/v1/ads/:slug            Get ad details
GET    /api/v1/categories           Get categories
GET    /api/v1/cities               Get cities
GET    /api/v1/packages             Get packages
```

### Client
```
POST   /api/v1/client/ads           Create ad
PATCH  /api/v1/client/ads/:id       Edit ad
DELETE /api/v1/client/ads/:id       Delete ad
POST   /api/v1/client/payments      Create payment
GET    /api/v1/client/payments      Get user payments
GET    /api/v1/client/dashboard     Client stats
```

### Moderator
```
GET    /api/v1/moderator/review-queue      Get pending ads
PATCH  /api/v1/moderator/ads/:id/review    Review ad
GET    /api/v1/moderator/dashboard         Moderator stats
```

### Admin
```
GET    /api/v1/admin/payment-queue            Get pending payments
PATCH  /api/v1/admin/payments/:id/verify      Verify payment
PATCH  /api/v1/admin/ads/:id/publish          Publish ad
GET    /api/v1/admin/dashboard                Admin stats
GET    /api/v1/admin/analytics                Platform analytics
```

---

## 👥 User Roles & Permissions

### CLIENT (Default)
- Create/edit/delete own ads
- Submit ads for review
- Make payments for ad promotion
- View own dashboard & stats

### MODERATOR
- Review submitted ads
- Approve/reject ads
- Flag inappropriate content
- View moderator dashboard

### ADMIN
- Verify payments
- Publish ads
- Manage users
- View analytics
- Access admin dashboard

### SUPER_ADMIN
- Full platform access
- Manage admins
- System settings

---

## 🔐 Security Features

✅ **Authentication**: JWT tokens (7-day access, 30-day refresh)
✅ **Password Security**: bcryptjs with 10 salt rounds
✅ **Input Validation**: Zod schemas on all endpoints
✅ **CORS Protection**: Configurable origins
✅ **Helmet**: Security headers
✅ **RBAC**: Role-based middleware
✅ **Error Handling**: Centralized error management
✅ **SQL Injection**: Parameterized queries via Supabase
✅ **Rate Limiting**: Ready to add
✅ **Audit Logging**: Built-in logging

---

## 📊 Database Schema (12 Tables)

```
users
├── id, email, password_hash
├── first_name, last_name, phone
├── role (client, moderator, admin, super_admin)
└── status (active, inactive, banned)

ads
├── id, user_id, title, description, slug
├── category_id, city_id, price
├── package_id, status
└── created_at, updated_at

ad_media
├── id, ad_id, type (image, video, youtube)
├── url, is_primary
└── created_at

payments
├── id, ad_id, user_id, amount
├── payment_method, transaction_id
├── status, verified_at
└── created_at

categories, cities, packages
└── Basic reference data

Other tables:
- notifications, audit_logs, ad_status_history
- analytics_snapshots, system_health_logs
```

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub
git push origin main

# Go to vercel.com, import project
# Auto-deploys on push
```

### Backend (Railway or Render)

1. Create account at https://railway.app or https://render.com
2. Connect GitHub
3. Deploy `backend` folder
4. Set environment variables
5. Get deployed URL

### Database (Supabase)
- Already hosted in cloud
- Auto-backups enabled
- SSL/TLS secure

---

## 🛠️ Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## 📚 Additional Resources

| Resource | Location |
|----------|----------|
| API Documentation | `/docs/API.md` |
| Backend Setup | `/backend/README.md` |
| Frontend Setup | `/frontend/README.md` |
| Database Schema | `/database/migrations/001_init_schema.sql` |
| Deployment Guide | `/docs/DEPLOYMENT.md` |
| Project Summary | `/COMPLETE_PROJECT_SUMMARY.md` |

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check port 5000
lsof -i :5000

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database connection error
- Verify Supabase credentials
- Check SERVICE_ROLE_KEY (not anon key)
- Ensure DATABASE_URL is correct

### Frontend API errors
- Check `NEXT_PUBLIC_API_URL`
- Ensure backend is running
- Verify CORS in backend

### Auth not working
- Clear localStorage
- Check JWT token format
- Verify password requirements

---

## 📞 Support

For issues or questions:
1. Check `/docs/SETUP.md`
2. Check `/backend/README.md`
3. Check `/frontend/README.md`
4. Review error messages in console

---

## ✨ Next Steps

1. ✅ Complete setup (follow 5-minute quickstart)
2. → Test all features locally
3. → Customize for your brand
4. → Add remaining features (cron jobs, email, etc.)
5. → Deploy to production
6. → Monitor and scale

---

## 📊 Technology Stack

**Frontend**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Zod validation
- Axios/Fetch

**Backend**
- Node.js 18+
- Express.js
- TypeScript
- Zod validation
- Supabase SDK

**Database**
- PostgreSQL (via Supabase)
- 12 tables
- Views, triggers, functions
- Auto-backups

**Deployment**
- Frontend: Vercel
- Backend: Railway/Render
- Database: Supabase

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 🎉 You're All Set!

Your production-ready marketplace platform is ready.

**Start with**: 5-minute quickstart above → Then explore `/docs/`

**Questions?** Check README files in `/backend` and `/frontend`

**Go build something amazing!** 🚀

# AdFlow Pro Backend Setup Guide

## Project Structure

```
backend/
├── server.js                 # Main entry point
├── package.json              # Dependencies
├── .env.example              # Environment template
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.js       # Supabase connection
│   │   └── constants.js      # App constants & RBAC
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.js         # JWT auth
│   │   ├── rbac.middleware.js         # Role-based access
│   │   ├── error.handler.js           # Error handling
│   │   └── validation.middleware.js   # Input validation
│   ├── validators/           # Zod schemas
│   │   ├── auth.validator.js  # Auth validation
│   │   ├── ad.validator.js    # Ad validation
│   │   └── payment.validator.js    # Payment validation
│   ├── services/             # Business logic
│   │   ├── auth.service.js   # Auth logic
│   │   ├── ad.service.js     # Ad logic
│   │   └── payment.service.js # Payment logic
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.js   # Auth endpoints
│   │   ├── ad.controller.js     # Ad endpoints
│   │   └── payment.controller.js # Payment endpoints
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── client.routes.js
│   │   ├── moderator.routes.js
│   │   ├── admin.routes.js
│   │   └── public.routes.js
│   ├── utils/                # Helper functions
│   │   ├── jwt.js           # JWT helpers
│   │   ├── password.js      # Password hashing
│   │   ├── string.js        # String utilities
│   │   ├── errors.js        # Error classes
│   │   └── response.js      # Response utilities
│   ├── cron/                 # Scheduled tasks
│   └── db/                   # Database setup
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Supabase

- Go to https://supabase.com
- Create a new project
- Go to SQL Editor
- Copy content from `/database/migrations/001_init_schema.sql`
- Execute the SQL

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 5. Test API

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "client"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/logout` - Logout

### Client
- `POST /api/v1/client/ads` - Create ad
- `PATCH /api/v1/client/ads/:id` - Update ad
- `DELETE /api/v1/client/ads/:id` - Delete ad
- `POST /api/v1/client/payments` - Create payment
- `GET /api/v1/client/payments` - Get user payments
- `GET /api/v1/client/dashboard` - Client dashboard

### Moderator
- `GET /api/v1/moderator/review-queue` - Get review queue
- `PATCH /api/v1/moderator/ads/:id/review` - Review ad
- `GET /api/v1/moderator/dashboard` - Moderator dashboard

### Admin
- `GET /api/v1/admin/payment-queue` - Get payment queue
- `PATCH /api/v1/admin/payments/:id/verify` - Verify payment
- `PATCH /api/v1/admin/ads/:id/publish` - Publish ad
- `GET /api/v1/admin/dashboard` - Admin dashboard
- `GET /api/v1/admin/analytics` - Analytics

### Public
- `GET /api/v1/ads` - Get all ads (with filters)
- `GET /api/v1/ads/:slug` - Get ad by slug
- `GET /api/v1/categories` - Get categories
- `GET /api/v1/cities` - Get cities
- `GET /api/v1/packages` - Get packages

## User Roles & Permissions

### CLIENT
- Create and manage own ads
- Submit ads for review
- Make payments
- View own dashboard

### MODERATOR
- Review ad submissions
- Approve/reject ads
- Flag inappropriate media
- View review queue

### ADMIN
- Verify payments
- Publish ads
- Manage users
- View analytics

### SUPER_ADMIN
- Full access to all features

## Database Schema

The database includes 12 tables:
- `users` - User accounts
- `ads` - Ad listings
- `ad_media` - Ad images/videos
- `payments` - Payment records
- `categories` - Ad categories
- `cities` - Cities
- `packages` - Ad packages
- `notifications` - User notifications
- `audit_logs` - System audit trail
- `ad_status_history` - Ad status tracking
- `analytics_snapshots` - Performance analytics
- `system_health_logs` - System health monitoring

See `/database/migrations/001_init_schema.sql` for complete schema.

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

## Authentication

Uses JWT tokens:
- **Access Token**: 7 days (Bearer token in Authorization header)
- **Refresh Token**: 30 days

Header format:
```
Authorization: Bearer <access_token>
```

## Validation

Uses Zod for input validation. See `/src/validators/` for all schemas.

## Production Deployment

See `/docs/DEPLOYMENT.md` for production setup.

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Cannot Connect to Database

- Verify Supabase credentials in `.env`
- Check database URL
- Ensure SERVICE_ROLE_KEY is used (not anon key)

### CORS Errors

- Update `CORS_ORIGIN` in `.env`
- Verify frontend URL matches

## Next Steps

1. ✅ Backend setup complete
2. → Setup frontend (see `/frontend` directory)
3. → Deploy to production
4. → Add remaining features

For questions, see `/docs/SETUP.md` and `/docs/API.md`

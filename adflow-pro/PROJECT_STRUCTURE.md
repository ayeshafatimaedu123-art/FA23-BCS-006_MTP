# AdFlow Pro - Project Structure

## Complete Folder Structure

```
adflow-pro/
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── index.ts                 # Main server file
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.ts          # Database connection
│   │   │   ├── env.ts               # Environment variables
│   │   │   └── constants.ts         # App constants
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.routes.ts       # Auth endpoints
│   │   │   ├── ads.routes.ts        # Ad management
│   │   │   ├── payment.routes.ts    # Payment endpoints
│   │   │   ├── admin.routes.ts      # Admin endpoints
│   │   │   ├── moderator.routes.ts  # Moderator endpoints
│   │   │   └── public.routes.ts     # Public endpoints
│   │   ├── controllers/             # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── ad.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── moderator.controller.ts
│   │   ├── models/                  # Database queries/models
│   │   │   ├── user.model.ts
│   │   │   ├── ad.model.ts
│   │   │   ├── payment.model.ts
│   │   │   └── notification.model.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   ├── rbac.middleware.ts   # Role-based access
│   │   │   ├── error.handler.ts     # Error handling
│   │   │   ├── validation.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   ├── validators/              # Input validation (Zod/Joi)
│   │   │   ├── auth.validator.ts
│   │   │   ├── ad.validator.ts
│   │   │   └── payment.validator.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── jwt.utils.ts         # JWT generation/verification
│   │   │   ├── password.utils.ts    # Password hashing
│   │   │   ├── mail.utils.ts        # Email sending
│   │   │   ├── media.utils.ts       # Media validation
│   │   │   ├── slug.utils.ts        # Slug generation
│   │   │   ├── ranking.utils.ts     # Ad ranking
│   │   │   └── error.utils.ts       # Error handling
│   │   ├── crons/                   # Scheduled jobs
│   │   │   ├── publish-scheduled.ts # Publish scheduled ads
│   │   │   ├── expire-ads.ts        # Expire old ads
│   │   │   ├── send-notifications.ts
│   │   │   └── health-check.ts
│   │   └── types/                   # TypeScript interfaces
│   │       └── index.ts
│   ├── dist/                        # Compiled JavaScript (generated)
│   ├── .env                         # Environment variables (LOCAL ONLY)
│   ├── .env.example                 # Example env file
│   ├── tsconfig.json               # TypeScript config
│   ├── package.json
│   └── jest.config.js              # Test configuration
│
├── frontend/                        # Next.js 14 Frontend
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── (auth)/                 # Auth pages layout
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (public)/               # Public pages layout
│   │   │   ├── ads/page.tsx        # Explore ads
│   │   │   ├── ads/[slug]/page.tsx # Ad details
│   │   │   ├── categories/page.tsx
│   │   │   ├── cities/page.tsx
│   │   │   └── packages/page.tsx
│   │   ├── dashboard/              # Protected dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # User dashboard home
│   │   │   ├── client/
│   │   │   │   ├── ads/page.tsx    # Client's ads list
│   │   │   │   ├── ads/create/page.tsx
│   │   │   │   ├── ads/[id]/edit/page.tsx
│   │   │   │   └── payments/page.tsx
│   │   │   ├── moderator/
│   │   │   │   ├── review/page.tsx # Review queue
│   │   │   │   └── analytics/page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── payments/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── categories/page.tsx
│   │   │   │   ├── packages/page.tsx
│   │   │   │   ├── cities/page.tsx
│   │   │   │   └── analytics/page.tsx
│   │   └── api/                    # API routes (if using Next.js API)
│   │       ├── auth/
│   │       ├── ads/
│   │       └── ...
│   ├── components/
│   │   ├── dashboard/              # Dashboard components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── ...
│   │   ├── public/                 # Public components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── AdCard.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── ...
│   │   ├── forms/                  # Form components
│   │   │   ├── CreateAdForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── ...
│   │   ├── shared/                 # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ...
│   │   └── common/
│   │       └── Toast.tsx
│   ├── lib/                        # Utilities & helpers
│   │   ├── api.ts                  # API client
│   │   ├── auth.ts                 # Auth utilities
│   │   ├── validators.ts           # Form validation
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useAds.ts
│   │   │   └── ...
│   │   ├── store/                  # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── uiStore.ts
│   │   └── utils.ts
│   ├── public/                     # Static files
│   │   ├── images/
│   │   ├── icons/
│   │   └── ...
│   ├── styles/
│   │   ├── globals.css             # Global styles
│   │   └── variables.css           # CSS variables
│   ├── .env.local                  # Local env (NOT in git)
│   ├── .env.example                # Example env
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── next.config.js
│   ├── package.json
│   └── .eslintrc.json
│
├── database/                        # Database files
│   ├── migrations/
│   │   ├── 001_init_schema.sql     # Main schema
│   │   └── 002_sample_data.sql     # Sample data
│   └── seeds/
│       └── seed.ts                 # Data seeding script
│
├── shared/                          # Shared utilities
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   └── constants.ts               # Constants
│
├── scripts/                         # Utility scripts
│   ├── setup.sh                    # Setup script
│   ├── deploy.sh                   # Deployment script
│   └── ...
│
├── docs/                           # Documentation
│   ├── API.md                      # API documentation
│   ├── SETUP.md                    # Setup guide
│   ├── DEPLOYMENT.md               # Deployment guide
│   └── DATABASE.md                 # Database schema docs
│
├── .gitignore
├── .env.example                    # Example env (root level)
├── README.md                       # Project README
├── PROJECT_STRUCTURE.md            # This file
└── package.json (root monorepo)    # Optional root package.json

```

## Key Points

### Backend Structure
- **Separation of Concerns**: Routes → Controllers → Models
- **Middleware Stack**: Auth, RBAC, Validation, Error Handling
- **Validators**: Zod validation schemas for all inputs
- **Cron Jobs**: Automated tasks run at specified intervals
- **Utils**: Reusable functions for JWT, passwords, email, media, etc.

### Frontend Structure
- **App Router**: Modern Next.js 14 with app directory
- **Layout Groups**: (auth), (public), dashboard for organization
- **Protected Routes**: Dashboard routes check authentication
- **Role-based UI**: Components show/hide based on user role
- **Components**: Organized by feature (forms, dashboard, public)
- **Hooks & Store**: Custom hooks and Zustand for state
- **Validation & API**: Helper functions and API client

### Database
- **Migrations**: Version-controlled SQL files
- **Seeds**: Sample data for testing
- **Views**: Pre-built queries for complex operations
- **Triggers & Functions**: Automate status tracking, expiry, ranking

### Shared
- **TypeScript Types**: Single source of truth for types
- **Constants**: Shared constants across frontend & backend

## Next Steps
1. Create environment files
2. Setup backend server configuration
3. Create validation schemas
4. Implement authentication
5. Build API endpoints
6. Create frontend pages & components
7. Setup database connection
8. Configure cron jobs
9. Deploy to Vercel + Supabase

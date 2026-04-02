# AdFlow Pro Frontend Setup Guide

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── login/
│   ├── register/
│   ├── explore/
│   ├── packages/
│   ├── create-ad/
│   └── dashboard/
│       ├── layout.tsx          # Dashboard wrapper
│       ├── client/             # Client dashboard
│       ├── moderator/          # Moderator dashboard
│       └── admin/              # Admin dashboard
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── AdCard.jsx
│   ├── forms/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── CreateAdForm.jsx
│   └── dashboard/
├── lib/
│   ├── api/
│   │   └── client.js           # API client
│   ├── hooks/
│   │   └── useAuth.js          # Auth hook
│   └── store/
├── styles/
│   └── globals.css
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Build for Production

```bash
npm run build
npm start
```

## Pages

### Public Pages
- `/` - Home page with hero and features
- `/explore` - Browse and filter ads
- `/packages` - Pricing plans
- `/login` - User login
- `/register` - User registration

### Protected Pages (require authentication)
- `/dashboard` - Role-based dashboard routing
- `/dashboard/client` - Client dashboard
- `/dashboard/moderator` - Moderator dashboard
- `/dashboard/admin` - Admin dashboard
- `/create-ad` - Create new ad

## Components

### Common Components
- `Header.jsx` - Navigation bar
- `Footer.jsx` - Footer
- `AdCard.jsx` - Ad listing card

### Form Components
- `LoginForm.jsx` - Login form
- `RegisterForm.jsx` - Registration form
- `CreateAdForm.jsx` - Create ad form

## Hooks

### useAuth
Manages user authentication state

```javascript
const { user, isAuthenticated, login, register, logout } = useAuth();
```

## API Client

Located in `/lib/api/client.js`

```javascript
// Auth
await authAPI.register(payload);
await authAPI.login({ email, password });
await authAPI.getProfile();

// Ads
await adsAPI.search(filters);
await adsAPI.getBySlug(slug);
await adsAPI.create(payload);

// Payments
await paymentsAPI.create(payload);
await paymentsAPI.getUserPayments(page, limit);
```

## Styling

Uses Tailwind CSS with custom utilities in `globals.css`:

```css
.btn - Button styles
.btn-primary - Primary button
.input - Input field
.card - Card container
```

## Features

### Authentication
- Register with email/password
- Login with credentials
- JWT token management
- Persistent auth (localStorage)
- Protected routes

### Ads Management
- Search ads with filters
- Browse by category, city, price
- View ad details
- Create ads (authenticated users)
- Edit/delete own ads

### Dashboards
- Client dashboard with stats
- Moderator dashboard with review queue
- Admin dashboard with analytics
- Role-based navigation

### Responsive Design
- Mobile-first approach
- Tablet and desktop layouts
- Touch-friendly UI
- Optimized images

## TypeScript

Pages use `.tsx` extension. Components use `.jsx`.

To use TypeScript in components, rename to `.tsx` and add types.

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

RUN npm run build

CMD ["npm", "start"]
```

Then:

```bash
docker build -t adflow-frontend .
docker run -p 3000:3000 adflow-frontend
```

## Performance

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- CSS minification
- API request optimization
- Caching strategies

## Troubleshooting

### Port 3000 already in use

```bash
npm run dev -- -p 3001
```

### API connection error

- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is running
- Check CORS settings

### Auth not persisting

- Check localStorage settings
- Verify cookies/storage not blocked
- Clear browser cache

## Next Steps

1. ✅ Frontend setup complete
2. → Move to next page implementations
3. → Add more dashboard features
4. → Deploy to production

For API endpoints, see `/docs/API.md`

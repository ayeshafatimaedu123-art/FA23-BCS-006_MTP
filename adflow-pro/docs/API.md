# AdFlow Pro - API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## AUTH ENDPOINTS

### Register User
**POST** `/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "client",
  "phone": "03001234567",
  "companyName": "My Company"
}
```

Response:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { id, email, firstName, lastName, role, ... },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login
**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response: Same as register

### Refresh Token
**POST** `/auth/refresh`

Request:
```json
{
  "refreshToken": "refresh_token"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "new_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### Get Profile
**GET** `/auth/profile` (Protected)

Response:
```json
{
  "success": true,
  "data": { "user": {...} }
}
```

### Update Profile
**PUT** `/auth/profile` (Protected)

Request:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "03009876543",
  "companyName": "New Company",
  "bio": "Bio description"
}
```

---

## AD ENDPOINTS

### Create Ad
**POST** `/ads` (Protected - Client)

Request:
```json
{
  "title": "Beautiful 3-Bedroom Apartment in Karachi",
  "description": "Spacious apartment with modern amenities...",
  "categoryId": "uuid",
  "cityId": "uuid",
  "packageId": "uuid",
  "price": 50000,
  "currency": "PKR",
  "contactEmail": "contact@example.com",
  "contactPhone": "03001234567",
  "websiteUrl": "https://property.com",
  "media": [
    {
      "url": "https://example.com/image.jpg",
      "mediaType": "image",
      "title": "Front View",
      "isPrimary": true
    },
    {
      "url": "https://youtube.com/watch?v=abc123",
      "mediaType": "youtube",
      "isPrimary": false
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "message": "Ad created successfully",
  "data": { "ad": {...} }
}
```

### Get Ad Details
**GET** `/ads/:id`

Response:
```json
{
  "success": true,
  "data": { 
    "ad": {
      id, title, description, slug, status, price, currency,
      user, category, city, package, media, ...
    }
  }
}
```

### Get Ad by Slug (Public)
**GET** `/ads/public/:slug`

Response: Same as above

### Update Ad
**PATCH** `/ads/:id` (Protected - Owner)

Request: Same fields as create

### Submit Ad for Review
**POST** `/ads/:id/submit` (Protected - Owner)

Response:
```json
{
  "success": true,
  "message": "Ad submitted for review",
  "data": { "ad": {...} }
}
```

### Get User Ads
**GET** `/ads` (Protected - Client)

Query params:
- `page` (default: 1)
- `limit` (default: 20)

### Search/Filter Ads (Public)
**GET** `/ads/search`

Query params:
- `search`: keyword search
- `categoryId`: filter by category
- `cityId`: filter by city
- `isFeatured`: true/false
- `minPrice`: minimum price
- `maxPrice`: maximum price
- `sortBy`: newest, popular, price_asc, price_desc
- `page`: pagination page
- `limit`: results per page

### Delete Ad
**DELETE** `/ads/:id` (Protected - Owner)

---

## PAYMENT ENDPOINTS

### Submit Payment Proof
**POST** `/payments` (Protected - Client)

Request:
```json
{
  "adId": "uuid",
  "packageId": "uuid",
  "proofUrl": "https://example.com/payment-proof.jpg",
  "proofType": "screenshot",
  "paymentMethod": "bank_transfer"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment submitted successfully",
  "data": { "payment": {...} }
}
```

### Get Payment Queue
**GET** `/payments/queue` (Protected - Admin)

Query params:
- `page`
- `limit`
- `status`
- `sortBy`

### Verify Payment
**PATCH** `/payments/:id/verify` (Protected - Admin)

Request:
```json
{
  "status": "verified",
  "verificationNotes": "Payment verified from bank statement"
}
```

Or for rejection:
```json
{
  "status": "rejected",
  "rejectionReason": "Amount doesn't match"
}
```

### Get User Payments
**GET** `/payments` (Protected - Client)

Query params:
- `page`
- `limit`
- `status`

### Get Payment Details
**GET** `/payments/:id` (Protected)

---

## MODERATOR ENDPOINTS

### Get Review Queue
**GET** `/moderator/review-queue` (Protected - Moderator)

Query params:
- `page`
- `limit`
- `status`

### Review Ad
**PATCH** `/moderator/ads/:id/review` (Protected - Moderator)

Request:
```json
{
  "status": "approved",
  "reason": "All criteria met"
}
```

Or for rejection:
```json
{
  "status": "rejected",
  "reason": "Contains prohibited content"
}
```

### Flag Media
**POST** `/moderator/media/:mediaId/flag` (Protected - Moderator)

Request:
```json
{
  "reason": "Inappropriate or low-quality image"
}
```

---

## ADMIN ENDPOINTS

### Get All Ads
**GET** `/admin/ads` (Protected - Admin)

Query params:
- `page`
- `limit`
- `status`
- `categoryId`
- `cityId`

### Publish Ad
**POST** `/admin/ads/:id/publish` (Protected - Admin)

Request:
```json
{
  "expiresAt": "2024-12-31T23:59:59Z",
  "isScheduled": false,
  "scheduledPublishAt": null
}
```

### Manage Categories
**GET** `/admin/categories`
**POST** `/admin/categories`
**PUT** `/admin/categories/:id`
**DELETE** `/admin/categories/:id`

### Manage Packages
**GET** `/admin/packages`
**POST** `/admin/packages`
**PUT** `/admin/packages/:id`
**DELETE** `/admin/packages/:id`

### Manage Cities
**GET** `/admin/cities`
**POST** `/admin/cities`
**PUT** `/admin/cities/:id`
**DELETE** `/admin/cities/:id`

### Get Analytics
**GET** `/admin/analytics` (Protected - Admin)

Response:
```json
{
  "success": true,
  "data": {
    "totalAds": 150,
    "activeAds": 87,
    "totalRevenue": 50000,
    "approvalRate": 85,
    "adsByCategory": { "real-estate": 45, "jobs": 32, ... },
    "adsByCity": { "karachi": 50, "lahore": 37, ... }
  }
}
```

---

## PUBLIC ENDPOINTS

### Get Categories
**GET** `/public/categories`

### Get Cities
**GET** `/public/cities`

### Get Packages
**GET** `/public/packages`

### Search Ads
**GET** `/ads/search` (See above)

---

## ERROR RESPONSES

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Server Error

---

## RATE LIMITING
- 100 requests per 15 minutes per IP

---

## AUTH HEADERS EXAMPLE
```
GET /api/v1/ads HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## WEBHOOKS (Optional)
Subscribe to events:
- `ad.created`
- `ad.approved`
- `ad.rejected`
- `ad.published`
- `ad.expired`
- `payment.verified`
- `payment.rejected`

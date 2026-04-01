# AdFlow Pro

AdFlow Pro is a production-style sponsored listing marketplace where users can submit paid advertisements that go through moderation, payment verification, scheduled publishing, and automatic expiry.

This project is designed to demonstrate advanced full-stack development concepts including role-based access control, workflow-driven backend logic, automation, analytics, and system traceability.

---

## 🚀 Features

- Multi-role system (Client, Moderator, Admin, Super Admin)
- Controlled ad lifecycle (Draft → Review → Payment → Publish → Expire)
- External media URL handling (no local uploads)
- Package-based visibility and ranking
- Payment proof verification
- Scheduled publishing and expiry using cron jobs
- Analytics dashboard with system metrics
- Full audit logs and status history tracking

---

## 👥 User Roles

### Client
- Create and manage ads
- Select packages
- Submit payment proof
- Track ad status

### Moderator
- Review ad content
- Reject or approve ads for payment stage
- Add internal moderation notes

### Admin
- Verify payments
- Publish or schedule ads
- Feature ads
- View analytics and reports

### Super Admin
- Manage packages, categories, and system settings
- Full system access

---

## 🔄 Ad Lifecycle

1. Draft  
2. Submitted  
3. Under Review  
4. Payment Pending  
5. Payment Submitted  
6. Payment Verified  
7. Published  
8. Expired  

Only **published and non-expired ads** are visible publicly.

---

## 🖼️ Media Strategy

- Only external media URLs are stored
- Supported sources:
  - Public image URLs
  - YouTube video links (auto thumbnail generation)
- Invalid or broken media falls back to a placeholder image

---

## 📦 Packages

| Package   | Duration | Priority | Homepage Visibility |
|----------|----------|----------|---------------------|
| Basic    | 7 Days   | Low      | No                  |
| Standard | 15 Days  | Medium   | Category Priority   |
| Premium  | 30 Days  | High     | Homepage + Featured |

---

## 📊 Ranking Logic

Ads are ranked using a calculated score based on:
- Featured status
- Package weight
- Freshness
- Admin boost

Expired ads never appear in public listings.

---

## ⏰ Automation

- Scheduled ads are published automatically
- Expired ads are hidden automatically
- Expiry reminder notifications are sent
- Database health checks are logged

---

## 🛠️ Tech Stack

- Frontend: Next.js / React
- Backend: Node.js + Express
- Database: Supabase (PostgreSQL)
- Authentication: JWT / Supabase Auth
- Styling: Tailwind CSS
- Deployment: Vercel

---

## 📂 Project Structure

The project follows a clean layered architecture with separate frontend, backend, shared logic, and documentation folders to ensure scalability and maintainability.

---

## ✅ Learning Outcomes

- Workflow-based backend design
- Role-based access control (RBAC)
- Automation using cron jobs
- Real-world database modeling
- Production-style system architecture

---

## 📌 Author

Developed as an Advanced MERN Stack / Full-Stack Web Development project.

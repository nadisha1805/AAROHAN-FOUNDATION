# AAROHAN Foundation

AAROHAN Foundation is a responsive charity website and operational platform for a single nonprofit organization. The project spans all three milestones:

- Milestone 1: public website, content pages, API layer, and foundation structure
- Milestone 2: admin dashboard and content management workflows
- Milestone 3: donor experience, payment flow, donation records, and production-ready support infrastructure

The project is designed to remain extensible while preserving the original architecture and content model.

## Stack

- Frontend: React + TypeScript + Vite + React Router
- Styling: Tailwind-inspired utility classes and custom component styling
- Backend: Node.js + Express + TypeScript + Zod
- Database: PostgreSQL + Prisma ORM
- Authentication: admin session tokens using secure backend validation
- Payment integration: Razorpay-ready order creation and verification flow
- Design: mobile-first, accessible nonprofit branding

## Project structure

```text
M3/
├── frontend/                 # React frontend application
│   ├── src/
│   ├── package.json
│   └── vite.config.*
├── backend/                  # Express + Prisma API
│   ├── prisma/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── README.md
├── TESTING_REPORT.md
└── .gitignore
```

## Setup

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment configuration

Copy the example environment files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Set the required values in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aarohan?schema=public
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-admin-password
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Notes:
- The backend will continue to work in demo mode when PostgreSQL and Razorpay credentials are not yet configured.
- Admin login is disabled when `ADMIN_EMAIL` or `ADMIN_PASSWORD` is missing.
- Razorpay live credentials must not be committed to the repository.

### 3. Run the frontend

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

### 4. Run the backend

```bash
cd backend
npm run dev
```

### 5. Optional database setup

If using Prisma/PostgreSQL locally:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## Milestone coverage

### Milestone 1 — Public foundation website

Completed features:
- Responsive homepage with announcement bar, hero banner, intro sections, cause cards, campaign highlights, impact metrics, stories, events, newsletter, and footer
- Public pages for About, Causes, Cause detail, Campaigns, Campaign detail, Impact, Stories, Story detail, Events, Event detail, Volunteer, Contact, FAQ, and policy placeholders
- Public REST APIs with validation and rate limiting
- Backend data layer with sample seed/demo content and structured API responses
- Prisma schema for core content models and organization structure
- SEO-related page metadata and supporting public-facing configuration

### Milestone 2 — Admin dashboard and management operations

Completed features:
- Admin login and protected dashboard access
- Overview dashboard with summary cards and recent activity
- CRUD-style admin pages for causes and campaigns
- Volunteer application review and status management
- Contact enquiry tracking and status changes
- Stories and events management
- Newsletter subscriber listing
- Admin-only routes with token-based authentication checks

### Milestone 3 — Donations, payments, donor support, and production-ready flow

Completed features:
- Donation form with amount selection, custom amounts, donor details, donation type, anonymous option, and consent
- Public donation endpoints for campaign, cause, and general giving
- Donation status lookup and receipt endpoint structure
- Razorpay-ready payment order creation and backend verification flow
- Donation records, payment status tracking, and admin donation management
- Campaign donation progress support for verified contributions
- Donation settings support in the admin dashboard
- Webhook verification scaffold and idempotent-style payment handling
- Demo-mode fallback when live gateway credentials are unavailable

## Public API endpoints

### Public content

- `GET /api/health`
- `GET /api/causes`
- `GET /api/causes/:slug`
- `GET /api/campaigns`
- `GET /api/campaigns/:slug`
- `GET /api/campaigns/featured`
- `GET /api/campaigns/:slug/donation-progress`
- `GET /api/impact`
- `GET /api/stories`
- `GET /api/stories/:slug`
- `GET /api/events`
- `GET /api/events/:slug`
- `GET /api/faqs`

### Public forms and donation flow

- `POST /api/volunteers`
- `POST /api/contact`
- `POST /api/newsletter/subscribe`
- `POST /api/donations`
- `GET /api/donations/:id/status`
- `POST /api/donations/:id/verify`
- `GET /api/donations/:id/receipt`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/webhook`

### Admin routes

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `GET /api/admin/overview`
- `GET /api/admin/causes`
- `POST /api/admin/causes`
- `PATCH /api/admin/causes/:id`
- `POST /api/admin/causes/:id/delete`
- `GET /api/admin/campaigns`
- `POST /api/admin/campaigns`
- `PATCH /api/admin/campaigns/:id`
- `POST /api/admin/campaigns/:id/delete`
- `GET /api/admin/volunteers`
- `PATCH /api/admin/volunteers/:id`
- `GET /api/admin/enquiries`
- `PATCH /api/admin/enquiries/:id`
- `GET /api/admin/stories`
- `PATCH /api/admin/stories/:id`
- `GET /api/admin/events`
- `PATCH /api/admin/events/:id`
- `GET /api/admin/newsletter`
- `GET /api/admin/donations`
- `GET /api/admin/donations/:id`
- `GET /api/admin/donations/stats`
- `GET /api/admin/donations/export`
- `GET /api/admin/donation-settings`
- `PUT /api/admin/donation-settings`

## Feature summary

- Responsive public-facing charity website
- Cause and campaign discovery pages
- Community interest forms and contact workflows
- Admin dashboard for managing core content and operations
- Donation form with general, cause, and campaign support
- Predefined and custom donation amounts
- Payment flow wired for Razorpay-ready verification and webhook processing
- Donation status tracking and reporting
- Donation settings configuration for administrators
- Campaign donation progress visibility
- Secure admin access and protected backend routes

## Production and compliance notes

- Payment credentials are never exposed in frontend code.
- The project is prepared for Razorpay test mode and live-mode configuration separation.
- Donation receipts and templates are structured to avoid unsupported tax claims unless verified formally.
- Placeholder contact details and policy language should be replaced with organization-approved values before production launch.
- The repository-root `vercel.json` routes `/api/*` to the backend service and all other paths to the frontend service.
- Both service TypeScript compilers are pinned to 5.9.3 because Vercel's backend builder currently fails its type-check step with TypeScript 7; retain each exact version and lockfile together.

## Testing report summary

Validated in this session:
- Frontend build: passed (`npm run build` in `frontend`)
- Backend build: passed (`npm run build` in `backend`)
- Health endpoint check: passed (`GET /api/health`)
- Donation creation flow: passed via API smoke test
- Public content endpoints: verified through application behavior

## Notes

- This project intentionally uses demo data where the foundation’s live operational details are unknown or not yet verified.
- Sensitive foundation details remain placeholders to avoid inventing unverifiable information.
- The donation flow is built to be production-ready in structure while requiring valid merchant credentials before real-payment activation.
- Configure unique `ADMIN_EMAIL` and `ADMIN_PASSWORD` values in `backend/.env` to provision the initial super-admin account.

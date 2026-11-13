# AAROHAN Foundation – Milestone 1

AAROHAN Foundation is a responsive charity foundation website and technical foundation for a single organization. This milestone includes a frontend, backend APIs, a Prisma schema, sample seeded data, and an implementation structure ready for the later Milestone 2 and 3 expansions.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express + TypeScript + Zod
- Database: PostgreSQL + Prisma ORM
- Design: Accessible, mobile-first nonprofit branding

## Project structure

- `frontend/` – React frontend
- `backend/` – Express + Prisma backend

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

The project includes example files, and the backend will run without a live PostgreSQL database by falling back to demonstration data.

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

## API endpoints

- `GET /api/health`
- `GET /api/causes`
- `GET /api/causes/:slug`
- `GET /api/campaigns`
- `GET /api/campaigns/:slug`
- `GET /api/campaigns/featured`
- `GET /api/impact`
- `GET /api/stories`
- `GET /api/stories/:slug`
- `GET /api/events`
- `GET /api/events/:slug`
- `GET /api/faqs`
- `POST /api/volunteers`
- `POST /api/contact`
- `POST /api/newsletter/subscribe`

## Completed feature list

- Responsive homepage with announcement bar, hero, intro, cause cards, campaigns, impact stats, help cards, stories, events, newsletter, and footer
- About page, cause listing page, cause detail page, campaigns listing page, campaign detail page, impact page, stories page, event listing/detail page, volunteer form, contact form, FAQ page, and policy placeholders
- Frontend-backend integration via reusable API layer
- Public REST APIs with validation and rate-limited public endpoints
- Prisma schema for all required models and migration definition
- Sample data for causes, campaigns, stories, impact, and events
- SEO basics including title, meta description, sitemap, and robots.txt

## Pending features for Milestone 2

- Complete admin dashboard
- Full campaign management interface
- Volunteer management dashboard
- Donation dashboard and donor portal
- Real PostgreSQL connection setup in a production-ready environment
- Payment integration and donation processing (Milestone 3)

## Testing report summary

Validated in this session:
- Frontend build: passed (`npm run build` in `frontend`)
- Backend build: passed (`npm run build` in `backend`)
- Health endpoint check: passed (`GET /api/health`)
- Contact form submission: passed
- Newsletter subscription: passed
- Cause API response: passed

## Notes

- This milestone intentionally does not implement the complete donation payment flow or admin dashboard.
- Sensitive foundation details remain placeholder values to avoid inventing unverifiable information.
- Sample campaign, cause, story, event, and impact data are clearly marked as demonstration data for Milestone 1 development.

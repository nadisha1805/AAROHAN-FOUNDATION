# Testing Report – AAROHAN Foundation Milestone 1

## Environment

- Operating system: Windows
- Frontend: Vite + React + TypeScript
- Backend: Express + TypeScript
- Database layer: Prisma schema prepared for PostgreSQL

## Validation performed

1. Frontend production build
   - Command: `cd frontend && npm run build`
   - Result: Passed

2. Backend TypeScript build
   - Command: `cd backend && npm run build`
   - Result: Passed

3. Backend health endpoint
   - Command: `Invoke-RestMethod http://localhost:5000/api/health`
   - Result: Passed (`success: true`)

4. Contact submission endpoint
   - Command: POST to `/api/contact`
   - Result: Passed

5. Newsletter subscription endpoint
   - Command: POST to `/api/newsletter/subscribe`
   - Result: Passed

6. Cause listing endpoint
   - Command: `Invoke-RestMethod http://localhost:5000/api/causes`
   - Result: Passed and returned six sample causes

## Observations

- The app runs successfully in local development mode with demo API data and safe fallback behavior.
- The database layer is implemented as Prisma-ready and migration SQL is included, but a live PostgreSQL instance was not available in this environment for end-to-end database execution.
- All frontend and backend build checks passed so the milestone is structurally complete and ready for continued enhancement in later milestones.

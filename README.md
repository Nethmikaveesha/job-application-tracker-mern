# Job Application Tracker

Full-stack job application tracking platform with role-based access for job seekers and admins.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT-based authentication with optional 2FA support

## Features

- User registration and login
- Role-based route protection (`job_seeker`, `admin`)
- Job listing and application management
- Admin dashboards for jobs, users, and applications
- Profile management
- Password reset flow via email (SMTP)
- Contact form email handling

## Project Structure

```text
job-application-tracker/
  Backend/    # Express API + MongoDB models/routes
  frontend/   # React Vite client
```

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (or compatible)
- MongoDB instance (local or cloud)

## Environment Variables (Backend)

Create `Backend/.env` with the following keys:

```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Optional - SMTP for password reset/contact/status notifications
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CONTACT_INBOX_EMAIL=

# Optional - Admin seed user
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_NAME=Admin
```

## Installation

From the repository root:

```bash
# Backend dependencies
cd Backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

## Run in Development

Open two terminals.

### Terminal 1 - Backend

```bash
cd Backend
npm run dev
```

API runs on `http://localhost:5000`.

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

App runs on `http://localhost:5173`.

Vite is configured to proxy `/api` and `/uploads` to the backend.

## Build and Lint (Frontend)

```bash
cd frontend
npm run lint
npm run build
```

## Seed Admin User (Optional)

After setting `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `Backend/.env`:

```bash
cd Backend
npm run seed
```

If the user already exists, the script promotes that user to admin.

## Auth Notes

- Signup creates an account and redirects to login.
- Users must explicitly log in after signup.
- Signup password requirements:
  - minimum 8 characters
  - at least one uppercase letter
  - at least one lowercase letter
  - at least one number

## Core API Prefixes

- `/api/auth`
- `/api/users`
- `/api/jobs`
- `/api/applications`
- `/api/admin`
- `/api/admin/reports`
- `/api/notifications`
- `/api/contact`

## Health Check

`GET /api/health` should return:

```json
{ "ok": true }
```

## Troubleshooting

- If frontend cannot reach backend, confirm backend is running on port `5000`.
- If login/signup fails, verify `JWT_SECRET` and `MONGODB_URI` are set.
- If email features do not work, configure SMTP variables in `Backend/.env`.
- If CORS issues appear, make sure `FRONTEND_URL` matches your frontend origin.


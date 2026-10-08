# PulseCheck — Multi-Tenant API & Website Uptime Monitoring SaaS

PulseCheck is an enterprise-grade, multi-tenant uptime monitoring and incident alerting SaaS platform. It continuously evaluates the health, latency, and response status of external HTTP/HTTPS endpoints through an asynchronous, high-concurrency Go worker pool, dispatches instant downtime notifications on state transitions, and serves interactive analytics dashboards and public status pages.

## Key Features

- **Concurrent Check Engine**: Non-blocking scheduling engine powered by Go goroutines and a counting semaphore worker pool that caps active HTTP requests to avoid socket exhaustion.
- **Fail-Safe HTTP Execution**: Per-request `context.Context` cancellation with 10-second timeouts guarantees hung endpoints never deadlock background workers.
- **Smart Downtime Alerting**: State transition detection triggers email alerts (via provider-agnostic SMTP / Mailtrap) exclusively on healthy &rarr; down transitions to prevent notification fatigue.
- **Subscription Tier Quotas**: Multi-tenant tier enforcement cleanly separated at the service layer:
  - **Free Tier**: Up to 5 active monitors, 5-minute minimum check frequency.
  - **Pro Tier**: Up to 50 active monitors, 30-second high-precision check frequency.
- **SQL-Aggregated Analytics**: 24h, 7d, and 30d uptime ratios and average response latencies are calculated directly via PostgreSQL aggregation queries without in-memory looping.
- **Stripe Billing Integration**: Secure checkout sessions in Stripe test mode and cryptographically verified webhook handlers for subscription activations and cancellations.
- **Zero-Auth Public Status Pages**: Shareable, lightweight customer-facing status endpoints (`/status/:id`) exposing sanitized operational badges without leaking sensitive tenant telemetry.
- **Modern React + Tailwind Dashboard**: Fast Single-Page Application featuring in-memory JWT authentication (mitigating XSS risks), interactive Recharts response time graphs, and parallax landing pages.

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Go 1.24+ (`net/http`, `database/sql`, `pgx/v5`, `golang-jwt/jwt/v5`, `stripe-go/v78`) |
| **Database** | PostgreSQL 16 (with `golang-migrate` embedded migrations) |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **DevOps / Container** | Docker, Docker Compose, Multi-stage scratch/alpine containerization |

## Architecture Overview

The system follows a layered architecture pattern: **HTTP Handler &rarr; Domain Service &rarr; Repository Interface**.

```
[ Frontend (React SPA) ]
         │
         │  REST / Bearer JWT
         ▼
[ Go Backend Server ]
 ├── Handlers (HTTP routing, JSON validation, status codes)
 ├── Middleware (JWT auth, CORS, logging, graceful shutdown)
 ├── Services (Business logic, tier quotas, check coordination)
 └── Repositories (Raw SQL via database/sql + pgx)
         │
         ├──► PostgreSQL Database
         ├──► Stripe API (Checkout & Webhooks)
         └──► SMTP Relays (Mailtrap / SendGrid / Custom SMTP)
```

For full architectural diagrams, concurrency primitives breakdown, and security specifications, see [docs/architecture.md](docs/architecture.md).

## Local Setup & Development

### 1. Prerequisites
- [Go 1.22+](https://go.dev/)
- [Node.js 18+](https://nodejs.org/) & `npm`
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Database Setup
Start the local PostgreSQL container:
```bash
docker compose up -d
```
*(PostgreSQL will listen on `localhost:5432` with database `pulsecheck`)*.

### 3. Backend Setup
1. Copy the environment template:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Configure your credentials inside `backend/.env`.
3. Run the backend server (migrations apply automatically on boot):
   ```bash
   cd backend
   go run ./cmd/server/main.go
   ```
   The backend server will start on `http://localhost:8080`.

### 4. Frontend Setup
1. Copy the frontend environment template:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
2. Install dependencies and start the Vite dev server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The application dashboard will open at `http://localhost:5173`.

## Required Environment Variables

### Backend (`backend/.env`)
- `PORT` — Server listening port (default: `8080`)
- `CLIENT_ORIGIN` — Allowed CORS client URL (default: `http://localhost:5173`)
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Cryptographic signing key for authentication tokens
- `JWT_EXPIRY_MINUTES` — Short-lived token duration (default: `15`)
- `STRIPE_SECRET_KEY` — Stripe test secret key (`sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (`whsec_...`)
- `STRIPE_PRICE_ID` — Stripe recurring price identifier (`price_...`)
- `SMTP_HOST` — SMTP server host (`sandbox.smtp.mailtrap.io`)
- `SMTP_PORT` — SMTP server port (`2525`)
- `SMTP_USERNAME` — SMTP authentication username
- `SMTP_PASSWORD` — SMTP authentication password
- `SMTP_FROM_EMAIL` — Outgoing sender address (`alerts@pulsecheck.dev`)

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL` — Base backend API URL (`http://localhost:8080`)

## API Endpoint Summary

A ready-to-import Postman collection and environment are provided in [`backend/postman/`](backend/postman/):
- `backend/postman/pulsecheck.postman_collection.json`
- `backend/postman/pulsecheck.postman_environment.json`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | System liveness probe |
| `POST` | `/api/auth/register` | Public | Creates a user account and returns JWT |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT |
| `GET` | `/api/auth/me` | Bearer Auth | Returns current user profile |
| `POST` | `/api/monitors` | Bearer Auth | Creates a monitor (enforces tier limits) |
| `GET` | `/api/monitors` | Bearer Auth | Lists tenant's monitors |
| `GET` | `/api/monitors/:id` | Bearer Auth | Retrieves specific monitor metadata |
| `PUT` | `/api/monitors/:id` | Bearer Auth | Updates monitor name, URL, or interval |
| `DELETE` | `/api/monitors/:id` | Bearer Auth | Deletes monitor and halts check loop |
| `GET` | `/api/monitors/:id/history` | Bearer Auth | Returns SQL aggregated metrics & probe logs |
| `GET` | `/status/:id/public` | Public | Unauthenticated status badge & health |
| `POST` | `/api/billing/checkout` | Bearer Auth | Generates Stripe Checkout upgrade session |
| `POST` | `/api/billing/webhook` | Public | Receives signed Stripe subscription events |

## Screenshots

<!-- Screenshots Section: Place dashboard, detail view, and status page screenshots here -->

## License

This project is licensed under the MIT License.

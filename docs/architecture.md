# PulseCheck Architecture

PulseCheck is a multi-tenant API & website uptime monitoring SaaS application. The backend is built in Go using idiomatic layered architecture, and the frontend is built with React, Vite, and Tailwind CSS.

## 1. System Overview

```
[ Frontend (React SPA) ]
         │
         │  HTTPS / REST + JWT
         ▼
[ Go Backend Server ]
 ├── Handlers (HTTP routing, JSON validation, status codes)
 ├── Middleware (JWT auth, CORS, logging, recovery)
 ├── Services (Business logic, plan enforcement, check coordination)
 └── Repositories (Data access layer with raw SQL via database/sql + pgx)
         │
         ├──► PostgreSQL Database
         ├──► Stripe API (Checkout & Webhooks)
         └──► SMTP Relays (Mailtrap / SendGrid / Custom SMTP)
```

## 2. Layered Architecture Pattern

The codebase adheres strictly to the Controller/Handler → Service → Repository pattern:

1. **HTTP Handler (`internal/<domain>/handler.go`)**:
   - Parses HTTP requests, extracts route parameters, and validates payload formatting.
   - Delegates business operations directly to the domain service.
   - Formats responses and writes appropriate HTTP status codes.

2. **Domain Service (`internal/<domain>/service.go`)**:
   - Implements business logic (e.g. tier limits, uptime statistics, password hashing).
   - Coordinates cross-domain tasks (e.g., monitor checks triggering alert emails).
   - Relies solely on repository interfaces for data persistence.

3. **Repository Layer (`internal/<domain>/repository.go`)**:
   - Manages raw SQL execution through Go's standard `database/sql` combined with the `pgx` driver.
   - Enforces multi-tenant ownership in SQL queries (`WHERE user_id = $1`).
   - Defined via interfaces to ensure full unit-testability without requiring a live database.

## 3. Concurrency Model: Check Engine

The monitoring engine executes checks at defined intervals per monitor:

- **Worker Pool**: A buffered channel semaphore limits maximum concurrent HTTP requests, guarding against socket exhaustion and unbounded goroutine growth.
- **Context Timeouts**: Every HTTP ping uses `context.WithTimeout` (default 10s), ensuring slow or hanging targets terminate predictably.
- **State Transition Alerts**: Checks record execution latency and response status in PostgreSQL. Alerts trigger when a monitor transitions from healthy to failing.

## 4. Multi-Tenancy & Security

- **Row-Level Tenant Isolation**: All monitor queries enforce user scoping (`WHERE id = $1 AND user_id = $2`) at the repository and service layers.
- **Short-Lived JWTs**: Authentication tokens expire quickly (15 minutes). The frontend stores tokens in memory/React context rather than `localStorage` to reduce XSS exposure.
- **Plan Enforcement**: Subscription quotas (free: 5 monitors, 5-minute minimum interval; paid: 50 monitors, 30-second minimum interval) are strictly enforced in the service layer before monitor creation or updates.

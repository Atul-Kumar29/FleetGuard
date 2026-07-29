# FleetGuard: a beginner-friendly build and code-review guide

This document explains what FleetGuard is, how this repository was assembled, how the important code works, and what should be improved next. It is written for a developer who is new to full-stack projects.

## 1. The problem we are solving

FleetGuard is a fleet maintenance and compliance application. A company needs to know whether every vehicle is safe and legal to use. The important documents are independent: an insurance policy, a safety inspection, and an emissions certificate can all expire on different days.

The core safety rule is:

> A vehicle with an expired compliance document must not be assigned to a driver unless a manager creates an explicit, auditable override.

That requirement leads to the project’s main end-to-end flow:

```text
Register vehicle
      ↓
Add insurance / inspection / emissions records
      ↓
Recalculate each record's expiry status every day
      ↓
Show fleet manager the current fleet status
      ↓
Later phases: safely assign → service vehicle → reset only the affected clock
```

## 2. Technology choices

| Layer | Technology | Why it is used |
| --- | --- | --- |
| Frontend | React + Vite | Creates interactive pages and forms in the browser. |
| Backend | Node.js + Express | Receives HTTP requests and applies business rules. |
| Database/Auth | Supabase (PostgreSQL + Auth) | Stores application data and validates user sessions. |
| Styling | CSS | Provides the responsive dashboard, forms, badges, and modal UI. |
| Tests | Node built-in test runner | Tests backend rules without adding a test framework. |
| Version control | Git + GitHub | Tracks changes and makes team collaboration possible. |

The repository is divided into two applications:

```text
fleetguard/
├── frontend/                 # React browser application
│   └── src/
├── backend/                  # Express API and background work
│   ├── controllers/          # Request/business logic
│   ├── routes/               # URL → controller mapping
│   ├── middleware/           # Authentication and authorization
│   ├── services/             # Reusable background/domain logic
│   └── tests/                # Automated backend checks
└── PROJECT_TUTORIAL.md       # This guide
```

## 3. Data model: why compliance is a separate table

The most important database decision is **not** storing a single `next_due_date` on `vehicles`. That would fail as soon as insurance and emissions have different dates.

Instead, FleetGuard uses a one-to-many relationship:

```text
vehicles (one vehicle)
   └── compliance_items (many documents for that vehicle)
         ├── INSURANCE
         ├── SAFETY_INSPECTION
         └── EMISSIONS
```

Each compliance item has its own:

- `expiration_date`
- `lead_time_days` — how many days before expiry it becomes a warning
- `status` — `VALID`, `WARNING`, or `EXPIRED`
- `document_number`
- `last_verified_at`

Example: a vehicle can have valid insurance, an inspection that expires in seven days, and expired emissions. The vehicle’s overall status is then `EXPIRED`, because the most serious status wins.

### Required Supabase setup

Before running the application against a real database, apply the supplied Supabase SQL to the project’s SQL editor. It creates `users`, `vehicles`, and `compliance_items`, the roles, indexes, status trigger, and RLS policies.

For a production-quality project, copy that SQL into a versioned migration file such as `supabase/migrations/001_core_schema.sql`. A database schema should live in source control, not only in a pasted document or the Supabase dashboard.

## 4. How the project was built, step by step

### Step 1: Create the project shells

The frontend was created as a Vite/React application and the backend as an Express application. The backend starts in `backend/server.js` and exposes a small health endpoint:

```http
GET /health
→ { "status": "ok" }
```

This is a useful first check: if `/health` does not respond, do not debug the frontend yet—the API itself is not running.

### Step 2: Configure Supabase safely

`backend/config/supabase.js` reads environment variables and creates a shared Supabase client. The important values belong in `backend/.env`, never in Git:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-secret
PORT=5000
COMPLIANCE_MONITOR_ENABLED=true
```

Use `backend/.env.example` as the safe template. The service-role key must never be placed in frontend code, screenshots, or a public repository.

### Step 3: Add authentication and role authorization

The backend middleware at `backend/middleware/auth.js` does four things for protected routes:

1. Reads the `Authorization: Bearer <token>` header.
2. Asks Supabase Auth whether the token represents a real user.
3. Looks up the user’s application role in `public.users`.
4. Allows or denies the route based on its permitted roles.

For example, the vehicle registration route permits Fleet Managers and Admins, while the frontend also prevents other roles from seeing that page.

The frontend stores the login session in `AuthContext.jsx`. `ProtectedRoute.jsx` and the sidebar use the role to control navigation. Frontend route guards improve the user experience, but the backend middleware is the real security boundary: a user can bypass browser UI with a manual HTTP request.

### Step 4: Build the vehicle registry

The registration page gathers vehicle information such as VIN, licence plate, make, model, year, type, status, and mileage. It sends it to:

```http
POST /api/vehicles
```

The controller validates values before writing anything:

- VIN and licence plate are required and checked for duplicates.
- Vehicle type must be `TRUCK`, `VAN`, `TRAILER`, or `CAR`.
- Status must be valid.
- Mileage must be a non-negative whole number.

This is a good example of a backend rule: frontend validation is helpful, but only server validation can be trusted.

### Step 5: Build fleet listing and details

The fleet list endpoint is:

```http
GET /api/vehicles?type=TRUCK&status=ACTIVE&search=ABC
```

It supports type/status filters, text search, and pagination. The controller then loads the matching compliance documents and calculates a vehicle-level display status:

```text
any EXPIRED document  → vehicle is EXPIRED
else any WARNING      → vehicle is WARNING
else no documents     → NO_RECORDS
else                  → VALID
```

The React fleet page displays this result in a table. Selecting a vehicle opens the details page, where `ComplianceStatusOverview` renders each document as a separate card.

### Step 6: Build individual compliance-document management

The compliance API is deliberately document-focused. Updating insurance must not accidentally modify emissions or inspection data.

```http
POST /api/compliance
Content-Type: application/json
Authorization: Bearer <token>

{
  "vehicle_id": "<vehicle UUID>",
  "document_type": "INSURANCE",
  "document_number": "POL-12345",
  "expiration_date": "2026-12-31",
  "lead_time_days": 30
}
```

```http
PUT /api/compliance/:id
Content-Type: application/json
Authorization: Bearer <token>

{ "expiration_date": "2027-12-31" }
```

`backend/controllers/complianceController.js` validates these requests. It accepts `INSURANCE`, `INSPECTION`, and `EMISSIONS`; `INSPECTION` is normalized to the database’s canonical `SAFETY_INSPECTION` value. It checks that the vehicle exists and rejects a second active record of the same document type for the same vehicle.

The edit modal already uses the update endpoint. The frontend API helper `createCompliance()` is ready for an “Add document” form in a future UI iteration.

### Step 7: Keep expiry status correct every day

A common bug is calculating a compliance status only when the user edits a document. A document that was valid yesterday can become expired at midnight even when no user opens it.

FleetGuard fixes this with three service files:

| File | Responsibility |
| --- | --- |
| `complianceStatus.js` | Pure function that returns `VALID`, `WARNING`, or `EXPIRED`. |
| `complianceMonitoringService.js` | Reads every document and updates only stale statuses. |
| `complianceScheduler.js` | Runs the monitor when the API starts, then schedules it for 00:05 every day. |

The status rule is intentionally simple and testable:

```text
expiration date < today                  → EXPIRED
expiration date ≤ today + lead-time days → WARNING
otherwise                                → VALID
```

The service uses calendar dates in UTC for its calculation. This avoids accidentally moving a date backwards or forwards because of a timezone offset.

### Step 8: Test what matters

Run backend tests:

```bash
cd backend
npm test
```

The current meaningful tests include:

- independent valid/warning/expired date calculations;
- monitoring updating only stale records;
- validation for allowed document types and invalid dates;
- daily schedule timing.

Build the browser application before a demo or commit:

```bash
cd frontend
npm run build
```

This catches import and syntax errors in React files.

## 5. API reference

| Method | URL | Who can use it | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Anyone | Simple server health check. |
| `POST` | `/api/vehicles` | Fleet Manager, Admin | Register a vehicle. |
| `GET` | `/api/vehicles` | Fleet Manager, Admin, Driver | List/filter fleet vehicles. |
| `GET` | `/api/vehicles/:id` | Fleet Manager, Admin, Driver | Vehicle and its compliance records. |
| `POST` | `/api/compliance` | Fleet Manager, Admin, Mechanic | Create one compliance record. |
| `PUT` | `/api/compliance/:id` | Fleet Manager, Admin, Mechanic | Update one selected record. |

All `/api/...` routes require a valid Supabase bearer token.

## 6. Code review: strengths and improvements

### What is working well

1. **The domain model matches the problem.** Separate compliance records correctly represent separate legal clocks.
2. **Validation happens on the server.** Vehicle and compliance inputs are checked before database writes.
3. **Role checks are enforced in the API.** The application does not rely only on hidden buttons in the UI.
4. **Expiry logic is isolated.** `calculateComplianceStatus()` is a small pure function, making it easy to test and reuse.
5. **The monitor avoids needless writes.** It updates only documents whose stored status differs from their calculated status.
6. **Error responses are purposeful.** Missing records produce `404`, invalid input produces `400`, duplicate document types produce `409`.

### Improvements to make next

1. **Version the database schema and add a seed script.** The Supabase SQL must be committed as a migration. Add 10+ realistic vehicles, documents, and status examples for demos.
2. **Add database constraints for data integrity.** The API prevents duplicate document types, but concurrent requests could still create duplicates. Add a unique constraint on `(vehicle_id, document_type)`.
3. **Use a durable scheduler in production.** A Node timer is excellent for a sprint/demo, but if the server restarts, sleeps, or runs in multiple instances, timing is not guaranteed. Use Supabase Cron, a worker queue, or a platform scheduler in production.
4. **Paginate monitoring work.** The current monitor reads all compliance records. Fetch in pages/batches for a large fleet.
5. **Create an alert record when state changes.** The monitor currently updates status. The next feature should add notifications for newly-warning and newly-expired documents, avoiding duplicate alerts each day.
6. **Separate the Express app from the listener.** `server.js` immediately calls `app.listen()`. Exporting an app from `app.js` and starting it from `server.js` makes HTTP integration tests easier.
7. **Add real integration tests.** Existing tests test important functions, but mocked Supabase/HTTP tests should cover authorization, database errors, and the full create/update flow.
8. **Implement remaining product epics.** Driver assignment hard-blocking, overrides, service logs, pre-trip checklists, admin analytics, notifications, and predictive maintenance remain.
9. **Model branch ownership.** The project brief describes branch-level fleet views, but the current vehicle schema and registration API do not yet contain a `branch_id` field.
10. **Resolve the README naming collision.** The repository has both `README.md` and `Readme.md`. Keep one canonical `README.md` to avoid confusion on case-sensitive systems and GitHub.

## 7. How to run the project locally

### Backend

```bash
cd backend
cp .env.example .env
# Fill in real Supabase values in .env
npm install
npm start
```

The API listens on `http://localhost:5000` by default.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

If the backend is on its default port, the frontend API client uses `http://localhost:5000`. Otherwise set `VITE_API_URL` in the frontend environment.

## 8. A simple Git and GitHub workflow

Git has two important places:

- **Local repository:** files and commits on your computer.
- **Remote repository:** the GitHub copy.

Editing a file does not update GitHub. The normal workflow is:

```bash
git status                    # See saved changes
git add path/to/file           # Stage selected changes
git commit -m "Explain change" # Save a Git snapshot locally
git push origin branch-name    # Send that commit to GitHub
```

Before every push, verify the branch:

```bash
git branch --show-current
git status
```

To create and push a new branch from current work:

```bash
git switch -c feature/descriptive-name
git add -A
git commit -m "Describe the completed work"
git push -u origin feature/descriptive-name
```

On GitHub, use the branch selector to view that branch. The default `main` branch will not change until a pull request is merged into it.

## 9. Suggested learning path for a newcomer

1. Read `frontend/src/App.jsx` to see which pages exist.
2. Open `backend/server.js` to see how Express mounts routes.
3. Follow `backend/routes/vehicleRoutes.js` to `vehicleController.js`.
4. Read `complianceStatus.js`, then its unit tests. This is the easiest place to understand a business rule.
5. Use Postman/Insomnia to call `GET /health`, then authenticated vehicle and compliance endpoints.
6. Put an expiry date in the past, run the monitor, and observe the document become `EXPIRED`.
7. Make one small change, run the tests, commit it on a feature branch, and open a pull request.

That cycle—understand one requirement, change a small piece, verify it, and commit it—is the most reliable way to learn full-stack development.

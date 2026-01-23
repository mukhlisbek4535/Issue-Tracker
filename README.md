# Issue Tracker (Client + Server)

This repo is a simple Issue Tracker app with:

- **Backend**: TypeScript + Express + PostgreSQL (`Server/`)
- **Frontend**: React + TypeScript (Vite) + React Query + Zustand (`Client/`)

It supports:
- User registration + login (JWT)
- Issues CRUD + filtering/pagination/sorting
- Labels CRUD + assigning labels to issues (many-to-many)
- Comments on issues

> Note about folder names: the project folders are **`Server/`** and **`Client/`** (capitalized).

---

## Project structure (high-level)

```
Issue Tracker/
  Client/                 # React app (Vite)
  Server/                 # Express API + DB scripts
  README.md               # (this file)
```

### Backend structure (`Server/src`)

- **`app.ts`**: Express app + middleware + route mounting (starts the server)
- **`db/index.ts`**: PostgreSQL connection pool
- **`routes/*.routes.ts`**: Route definitions (URL + HTTP method + middleware + controller)
- **`controllers/*.controller.ts`**: Request parsing/validation + HTTP responses
- **`services/*.service.ts`**: Database queries and business logic
- **`middlewares/auth.middleware.ts`**: JWT auth (`Authorization: Bearer <token>`)
- **`scripts/*.ts`**: DB initialization (create tables, seed, drop)
- **`utils/*`**: Zod schemas, JWT helpers, password hashing helpers, shared types

### Frontend structure (`Client/src`)

- **`api/*.ts`**: Small wrappers around `fetch` for each backend resource
- **`hooks/*`**: React Query hooks around the API layer
- **`pages/*`**: Route pages (Issue list/detail/edit, Labels, Login/Register)
- **`stores/authStore.ts`**: Auth state (Zustand + persistence)
- **`components/*`**: Reusable UI + protected route wrapper

---

## Quick start (local development)

### Prerequisites

- Node.js (any recent LTS should work)
- PostgreSQL 13+ (or any recent version)

### 1) Database setup (PostgreSQL)

1. Create a database (example name used by the server config):

```sql
CREATE DATABASE issue_tracker;
```

2. Ensure your Postgres instance allows local connections for the configured user.

### 2) Backend env config (`Server/.env`)

The server reads these environment variables (see `Server/src/db/index.ts` and `Server/src/utils/jwt.ts`):

- **`DB_HOST`**: Postgres host (e.g. `localhost`)
- **`DB_PORT`**: Postgres port (e.g. `5432`)
- **`DB_USER`**: Postgres user (e.g. `postgres`)
- **`DB_PASSWORD`**: Postgres password
- **`DB_NAME`**: Database name (e.g. `issue_tracker`)
- **`PORT`**: Server port (backend listens here)
- **`JWT_SECRET`**: Secret used to sign JWTs

Security note: `Server/.env` currently contains real secrets. Treat it as sensitive, rotate them if this repo is shared, and do not commit secrets.

### 3) Install deps + run DB migrations (table creation)

In one terminal:

```bash
cd "Server"
npm install
```

Create tables:

```bash
npx ts-node src/scripts/initDB.ts
```

Optional: seed example data:

```bash
npx ts-node src/scripts/seedData.ts
```

### 4) Start the backend

```bash
cd "Server"
npm run dev
```

The Express app is started from `Server/src/app.ts`.

> Note: `Server/src/server.ts` is currently empty, but `npm run start` points at it. For local dev, use `npm run dev`.

### 5) Start the frontend

In another terminal:

```bash
cd "Client"
npm install
npm run dev
```

The frontend runs on **`http://localhost:8080`** (configured in `Client/vite.config.ts`), and the backend CORS is configured to allow that origin.

---

## Database documentation (PostgreSQL)

The schema is created by `Server/src/scripts/createTables.ts`.

### Extension

- **`uuid-ossp`** is enabled so tables can use `uuid_generate_v4()` for primary keys.

### Tables overview

#### 1) `users`

Purpose: app users who can create issues, be assigned issues, and write comments.

Columns:
- **`id`** `UUID` primary key, default `uuid_generate_v4()`
- **`email`** `TEXT` not null, **unique**
- **`name`** `TEXT` not null
- **`password_hash`** `TEXT` not null (bcrypt hash)
- **`created_at`** `TIMESTAMPTZ` not null, default `NOW()`

Notes:
- Passwords are never stored in plain text; only `password_hash` exists.

#### 2) `issues`

Purpose: the core entity being tracked.

Columns:
- **`id`** `UUID` primary key, default `uuid_generate_v4()`
- **`title`** `TEXT` not null
- **`description`** `TEXT` not null
- **`status`** `TEXT` not null, constrained to one of:
  - `todo`
  - `in_progress`
  - `done`
  - `cancelled`
- **`priority`** `TEXT` not null, constrained to one of:
  - `low`
  - `medium`
  - `high`
- **`assignee_id`** `UUID` nullable, foreign key to `users(id)`
  - `ON DELETE SET NULL` (if the assignee user is deleted, the issue remains but becomes unassigned)
- **`created_by`** `UUID` not null, foreign key to `users(id)`
- **`created_at`** `TIMESTAMPTZ` not null, default `NOW()`
- **`updated_at`** `TIMESTAMPTZ` not null, default `NOW()`

#### 3) `labels`

Purpose: reusable tags like “bug”, “feature”, etc.

Columns:
- **`id`** `UUID` primary key, default `uuid_generate_v4()`
- **`name`** `TEXT` not null, **unique**
- **`color`** `TEXT` not null (hex color like `#ef4444`)

#### 4) `issue_labels` (join table)

Purpose: many-to-many relationship between issues and labels.

Columns:
- **`issue_id`** `UUID` not null, FK to `issues(id)` `ON DELETE CASCADE`
- **`label_id`** `UUID` not null, FK to `labels(id)` `ON DELETE CASCADE`
- **primary key** is the pair `(issue_id, label_id)`

Implications:
- Deleting an issue deletes its label links automatically.
- Deleting a label removes it from all issues automatically.
- The composite PK prevents duplicate label assignment to the same issue.

#### 5) `comments`

Purpose: comments attached to issues.

Columns:
- **`id`** `UUID` primary key, default `uuid_generate_v4()`
- **`issue_id`** `UUID` not null, FK to `issues(id)` `ON DELETE CASCADE`
- **`user_id`** `UUID` nullable, FK to `users(id)` `ON DELETE SET NULL`
- **`content`** `TEXT` not null
- **`created_at`** `TIMESTAMPTZ` not null, default `NOW()`

Implications:
- Deleting an issue deletes its comments.
- Deleting a user keeps comments but removes the author reference.

### Relationship diagram (conceptual)

- `users (1) -> (many) issues` via `issues.created_by`
- `users (1) -> (many) issues` via `issues.assignee_id` (optional)
- `issues (1) -> (many) comments`
- `users (1) -> (many) comments` (optional)
- `issues (many) <-> (many) labels` via `issue_labels`

---

## Backend documentation (Express API)

### How requests flow (simple mental model)

For a request like `GET /issues`:

1. **Route** matches in `Server/src/routes/issue.routes.ts`
2. **Auth middleware** checks the JWT (`Authorization: Bearer ...`)
3. **Controller** reads query/body + validates some parts
4. **Service** runs SQL queries with `pg` pool/client
5. **Controller** returns JSON response + HTTP status

### Base URL

By default (from `Server/src/app.ts`):

- **`http://localhost:3000`**

### Authentication

Protected endpoints require:

- Header: **`Authorization: Bearer <JWT>`**

JWT details:
- Generated in `Server/src/utils/jwt.ts`
- Expires in **7 days**

### Common error format

Most endpoints return JSON like:

```json
{ "message": "Some error message" }
```

Validation errors:
- `/auth/*` uses Zod and returns `errors: { field: [messages...] }`
- `/issues` create/update may return a Zod error object under `errors`

---

## API documentation (endpoints)

All endpoints below are defined by the server routes:

- `Server/src/routes/auth.routes.ts`
- `Server/src/routes/user.routes.ts`
- `Server/src/routes/issue.routes.ts`
- `Server/src/routes/label.routes.ts`
- `Server/src/routes/comment.routes.ts`

### Auth

#### `POST /auth/register`

Public: **Yes**

Body:

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "min 6 chars"
}
```

Responses:
- **201**: returns a wrapper object:

```json
{
  "message": "User registered successfully",
  "user": {
    "token": "<jwt>",
    "user": {
      "id": "<uuid>",
      "email": "user@example.com",
      "name": "User Name",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

- **409**: user already exists
- **400**: invalid body (Zod)

#### `POST /auth/login`

Public: **Yes**

Body:

```json
{
  "email": "user@example.com",
  "password": "plaintext password"
}
```

Response:
- **200**

```json
{
  "token": "<jwt>",
  "user": {
    "id": "<uuid>",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

- **401**: invalid email/password
- **400**: invalid body (Zod)

---

### Users

#### `GET /users`

Protected: **Yes**

Response:
- **200**

```json
[
  { "id": "<uuid>", "name": "Jane Smith", "email": "jane@test.com" },
  { "id": "<uuid>", "name": "John Doe", "email": "john@test.com" }
]
```

---

### Issues

#### `GET /issues`

Protected: **Yes**

Query params (all optional unless specified):
- **`page`**: number, default `1`
- **`limit`**: number, default `10` (max 100)
- **`search`**: string (matches issue title, case-insensitive “contains”)
- **`status`**: `todo | in_progress | done | cancelled`
- **`priority`**: `low | medium | high`
- **`assigneeId`**: UUID
- **`labelId`**: UUID (filters to issues that have this label)
- **`sortField`**: `updated_at | priority | status` (default `updated_at`)
- **`sortDirection`**: `asc | desc` (default `desc`)

Response:
- **200**

```json
{
  "data": [
    {
      "id": "<uuid>",
      "title": "Fix login page validation",
      "description": "...",
      "status": "todo",
      "priority": "high",
      "creator": { "id": "<uuid>", "name": "Jane Smith" },
      "assignee": { "id": "<uuid>", "name": "John Doe" },
      "labels": [{ "id": "<uuid>", "name": "bug", "color": "#ef4444" }],
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalIssues": 42,
    "totalPages": 5
  }
}
```

Notes:
- The server response uses `meta.totalIssues`, not `total`.

#### `GET /issues/:id`

Protected: **Yes**

Response:
- **200**: a single “expanded” issue object with creator/assignee/labels (same shape as `data[]` above)
- **404**: `Issue not found`

#### `POST /issues`

Protected: **Yes**

Body (validated with Zod in `Server/src/utils/validator.ts`):

```json
{
  "title": "Short title",
  "description": "Details",
  "status": "todo",
  "priority": "medium",
  "assigneeId": "<uuid or null>",
  "labelIds": ["<uuid>", "<uuid>"]
}
```

Response:
- **201**

```json
{ "id": "<new issue uuid>", "message": "Issue created successfully" }
```

#### `PUT /issues/:id`

Protected: **Yes**

Body: same fields as create, but each is optional.

Response:
- **200**

```json
{ "message": "Issue updated successfully" }
```

#### `DELETE /issues/:id`

Protected: **Yes**

Response:
- **200**

```json
{ "message": "Issue deleted successfully" }
```

---

### Labels

#### `GET /labels`

Protected: **Yes**

Response:

```json
[
  { "id": "<uuid>", "name": "bug", "color": "#ef4444" }
]
```

#### `POST /labels`

Protected: **Yes**

Body:

```json
{ "name": "bug", "color": "#ef4444" }
```

Response:
- **201**

```json
{ "id": "<uuid>", "name": "bug", "color": "#ef4444" }
```

#### `DELETE /labels/:id`

Protected: **Yes**

Response:

```json
{ "message": "Label deleted successfully" }
```

---

### Comments

#### `GET /issues/:id/comments`

Protected: **Yes**

Response:

```json
[
  {
    "id": "<uuid>",
    "content": "First!",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "author": { "id": "<uuid>", "name": "Jane Smith" }
  }
]
```

Note:
- If the comment’s `user_id` is null (user deleted), `author` becomes `null`.

#### `POST /issues/:id/comments`

Protected: **Yes**

Body:

```json
{ "content": "Hello there" }
```

Response:
- **201**

```json
{ "id": "<uuid>", "content": "Hello there", "created_at": "..." }
```

#### `DELETE /comments/:id`

Protected: **Yes**

Response:

```json
{ "message": "Comment deleted successfully" }
```

---

## Frontend documentation (React app)

### Routing

Client-side routes are defined in `Client/src/App.tsx`:

- **`/login`**: login page
- **`/register`**: register page
- Protected (requires auth):
  - **`/`**: issue list
  - **`/issues/new`**: create issue
  - **`/issues/:id`**: issue detail (includes comments)
  - **`/issues/:id/edit`**: edit issue
  - **`/labels`**: labels management

Protection is enforced by `Client/src/components/ProtectedRoute.tsx` and auth state from `Client/src/stores/authStore.ts`.

### How the frontend talks to the backend

- All HTTP requests go through `Client/src/api/client.ts`:
  - Base URL is **`http://localhost:3000`**
  - If `localStorage.token` exists, it automatically sends `Authorization: Bearer <token>`
  - Non-2xx responses are turned into thrown JS `Error`s

API modules:
- `Client/src/api/auth.ts` → `/auth/*`
- `Client/src/api/issues.ts` → `/issues`
- `Client/src/api/labels.ts` → `/labels`
- `Client/src/api/comments.ts` → `/issues/:id/comments` and `/comments/:id`
- `Client/src/api/users.ts` → `/users`

### Auth state (Zustand)

`Client/src/stores/authStore.ts` is responsible for:
- calling login/register API functions
- storing the token in `localStorage`
- keeping `isAuthenticated` + `token` for route protection

Implementation note (important when debugging):
- `/auth/login` returns `{ token, user }` (matches what the store expects).
- `/auth/register` returns `{ message, user: { token, user } }` (different shape).
  - If registration behaves oddly in the UI, this mismatch is the first thing to check.
- Issue list sorting:
  - The server expects `sortField=updated_at|priority|status`, but the UI currently sends `sortField=updatedAt|priority|status`.
  - Result: sorting “Updated” may silently fall back to the backend default (updated_at desc).

---

## Useful DB scripts (backend)

From `Server/src/scripts/`:

- **`initDB.ts`**: creates all tables (safe to run multiple times)
- **`seedData.ts`**: inserts sample users/labels/issues + link table data
- **`dropTables.ts`**: drops all tables (destructive)

Run them from `Server/`:

```bash
npx ts-node src/scripts/initDB.ts
npx ts-node src/scripts/seedData.ts
npx ts-node src/scripts/dropTables.ts
```

# Issue-Tracker

# TicketsFrontend

Angular 20 admin dashboard for the **TicketsCrud** Go API (technical-support tickets / "assistência técnica"). Provides login + full CRUD over all six entities: Tickets, Usuários, Categorias, Responsáveis, Comentários and Arquivos.

Stack: Angular 20 (standalone components + signals), Tailwind CSS with custom components (tables, dialogs, toasts), JWT auth.

## Prerequisites

- Node.js 20+ and npm
- The TicketsCrud API running and reachable (default `http://localhost:8080`)

## Run (development)

1. Make sure the TicketsCrud API is running. If it listens somewhere other than
   `http://localhost:8080`, set `BACKEND_URL` (see [Configuration](#configuration)).

2. Start the frontend:
   ```bash
   npm install
   npm start          # serves on FRONTEND_PORT (default 4200) with the dev proxy
   ```
   Open `http://localhost:4200`.

The dev server proxies `/api/*` to the backend (see `proxy.conf.js`), so the browser never hits a cross-origin request during development. The proxy target and other settings are configurable — see [Configuration](#configuration).

## Configuration

Configuration is driven by environment variables (read from a local `.env` file
if present — copy `.env.example` to `.env` to start). All are optional; the
defaults reproduce the standard local setup. You can also pass them inline, e.g.
`BACKEND_URL=http://localhost:9000 FRONTEND_PORT=4300 npm start`.

| Variable | Default | When it applies | Description |
|----------|---------|-----------------|-------------|
| `BACKEND_URL` | `http://localhost:8080` | dev serve | URL the dev-server proxy forwards `/api` to. Used by `proxy.conf.js`. |
| `FRONTEND_PORT` | `4200` | dev serve | Port the Angular dev server listens on. Used by `scripts/serve.js`. |
| `API_BASE_URL` | `/api` | build time | Base URL the app calls. Keep `/api` in dev (uses the proxy); set to the API origin for production, e.g. `https://api.example.com`. |
| `PRODUCTION` | `false` | build time | Marks the build as production (`true`/`false`). |

How it works: `BACKEND_URL`/`FRONTEND_PORT` are read at dev-serve time by the
Node config scripts. `API_BASE_URL`/`PRODUCTION` are baked into the bundle at
build time — `scripts/set-env.js` generates `src/environments/environment.ts`
from them, run automatically by the `prestart` / `prebuild` npm hooks (or
manually via `npm run set-env`).

## Build (production)

```bash
npm run build      # outputs to dist/TicketsFrontend (runs set-env first)
```

In production, either serve the static build behind a host that proxies `/api`
to the Go API (e.g. nginx) and keep `API_BASE_URL=/api`, or set
`API_BASE_URL` to the API origin before building.

## Project structure

```
src/app/
  core/
    models/        TypeScript interfaces + enum metadata (mirror the API, snake_case)
    auth/          AuthService, JWT interceptor, route guards
    interceptors/  error interceptor (surfaces plain-text API errors as toasts)
    services/      generic CrudService<T> + one service per entity
  layout/          MainLayout (sidenav + toolbar shell)
  shared/          ConfirmDialog, EntityListPage base class
  features/        login, dashboard, and <entity>/ list + form-dialog per entity
```

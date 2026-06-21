# TicketsFrontend

Angular 20 admin dashboard for the **TicketsCrud** Go API (technical-support tickets / "assistência técnica"). Provides login + full CRUD over all six entities: Tickets, Usuários, Categorias, Responsáveis, Comentários and Arquivos.

Stack: Angular 20 (standalone components + signals), Angular Material (tables, dialogs, selects), Tailwind CSS, JWT auth.

## Prerequisites

- Node.js 20+ and npm
- The TicketsCrud API running (Docker: `http://localhost:8085`)

## Run (development)

1. Start the backend from `../TicketsCrud`:
   ```bash
   docker compose up --build
   ```
   The API listens on `http://localhost:8085`. CORS for `http://localhost:4200` is enabled in the API (`go-chi/cors`, configurable via the `CORS_ORIGINS` env var).

2. Start the frontend:
   ```bash
   npm install
   npm start          # = ng serve, with the dev proxy
   ```
   Open `http://localhost:4200`.

The dev server proxies `/api/*` to `http://localhost:8085` (see `proxy.conf.json`), so the browser never hits a cross-origin request during development.

### Seed login

The database seed (`TicketsCrud/create e insert - assistencia técnica.sql`) creates users with plain-text passwords that the API accepts via its fallback. For example:

- **Email:** `fernanda.rocha@email.com` &nbsp; **Senha:** `hash_fernanda` (admin)

## Build (production)

```bash
npm run build      # outputs to dist/TicketsFrontend
```

In production, serve the static build behind a host that proxies `/api` to the Go API (e.g. nginx), or change `apiBaseUrl` in `src/environments/environment.ts`.

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

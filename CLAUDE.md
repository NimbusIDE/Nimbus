# Project Instructions

## Tech Stack

- **Monorepo**: npm workspaces (`nimbus`, `nimbus/server`), single root `package-lock.json`
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Monaco Editor
- **Backend**: Fastify 5, TypeScript, `tsx` for dev watch mode
- **Testing**: Vitest + React Testing Library (frontend only; no backend tests yet)
- **Node**: pinned to `22.23.1` via `.nvmrc`/`.node-version`, enforced by `engine-strict=true` in `.npmrc` — use `fnm`

## Code Style

- Prettier is the source of truth for formatting (`.prettierrc` is empty = all defaults); ESLint defers to it via `eslint-config-prettier`
- Frontend ESLint extends `next/core-web-vitals` + `next/typescript`
- Path alias `@/*` maps to `nimbus/` (e.g. `@/types/workspace`, `@/components/...`)
- Backend imports use explicit `.js` extensions (ESM, `"type": "module"` in `nimbus/server/package.json`)
- React state/logic is pulled out of components into custom hooks (`nimbus/components/hooks/`), each with a single clear responsibility — components stay declarative
- Comments explain *why*, not *what* — used sparingly on hooks/components to describe ownership boundaries (see `nimbus/app/page.tsx`)

## Testing

- Run tests: `npm run test --workspace nimbus` (or `cd nimbus && npm test`)
- Test pattern: co-located `*.test.tsx` next to the component (e.g. `FileTree.tsx` / `FileTree.test.tsx`)
- No coverage threshold configured

## Build & Run

From repo root:
- Install: `npm install` (installs both workspaces)
- Dev (both): `npm run dev`
- Dev (frontend only): `npm run dev:frontend` — Next.js on `http://localhost:3000`
- Dev (backend only): `npm run dev:server` — Fastify on `http://127.0.0.1:4000`
- Build: `npm run build`
- Lint: `npm run lint` (runs `lint/run.sh`, which lints both workspaces)
- Format: `npm run format` / `npm run format:check`
- Backend needs `nimbus/server/.env` copied from `nimbus/server/.env.example` before first run

## Project Structure

| Path | Purpose |
|------|---------|
| `nimbus/app/` | Next.js App Router pages (`/`, `/homepage`, `/login`, `/signup`) |
| `nimbus/components/` | React components; `hooks/` holds the stateful logic behind them |
| `nimbus/lib/workspaceApi.ts` | Frontend fetch wrappers for the backend API |
| `nimbus/types/workspace.ts` | Shared frontend types for workspace API responses |
| `nimbus/server/src/routes/` | Fastify HTTP route handlers |
| `nimbus/server/src/services/` | Backend business logic called by routes |
| `nimbus/server/src/config/env.ts` | Env var loading/validation |
| `nimbus/server/src/ws/` | Reserved for future WebSocket (terminal streaming) handlers |
| `lint/` | Shell scripts run by `npm run lint` |

## Conventions

- Commit messages: short, imperative, lowercase-first summary (e.g. "Add typecheck to frontend and server workspace")
- CI runs via GitHub Actions (`.github/workflows/`) with separate jobs per workspace plus a format/gate check
- The `nimbus` frontend origin (`http://localhost:3000`) is CORS-allowlisted on the backend via `CORS_ORIGIN` — update both sides if changing ports
- `workspaces/` (lowercase, root-level) is a *content* directory the backend serves as the IDE's file tree root — don't confuse with npm's `workspaces` config key in `package.json`

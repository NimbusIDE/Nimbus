# 🌩️ Nimbus Cloud IDE

Nimbus Cloud IDE is a browser-based development environment that brings a full coding workflow to the cloud. Write, run, and collaborate on projects from any device without local setup!

## 🚀 Features

### 🤝 Real-time collaboration

Collaborate in the same workspace with live, multi-user editing.

### 💻 Integrated terminal

Run commands directly in the browser alongside your editor.

### 📁 Project management

Organize files and projects within a structured workspace.

### ☁️ Scalable architecture

Built with a cloud-native architecture designed for performance and growth.

## 🏗️ Data Pipeline

<img width="4158" height="2222" alt="Nimbus" src="https://github.com/user-attachments/assets/688ba0e4-edb2-4cbd-a579-95dd9f276a66" />

## 🛠️ Setup

### Prerequisites

To keep everyone on an identical toolchain (and avoid `package-lock.json` churn between machines), Nimbus pins its **Node** version. npm ships with Node, so pinning Node also pins npm — there's no separate npm step.

- **Node.js `22.23.1`** (Node 22 LTS) — pinned via `.nvmrc` / `.node-version` (bundles npm `10.9.x`)

This is enforced: `.npmrc` sets `engine-strict=true`, so `npm install` fails fast if you're not on Node 22.x.

We recommend [**fnm**](https://github.com/Schniz/fnm) as the version manager — it's fast, cross-platform, and reads `.node-version` / `.nvmrc` automatically:

- **macOS:** `brew install fnm`, then add the shell hook to `~/.zshrc`:
  ```bash
  eval "$(fnm env --use-on-cd)"
  ```
- **Windows:** `winget install Schniz.fnm` (or `scoop install fnm`), then add the shell hook for whichever shell you use:
  - **PowerShell** — add to your `$PROFILE`:
    ```powershell
    fnm env --use-on-cd | Out-String | Invoke-Expression
    ```
  - **Git Bash** — add to `~/.bashrc`:
    ```bash
    eval "$(fnm env --use-on-cd --shell bash)"
    ```

With the hook in place, fnm switches to the pinned Node version automatically when you `cd` into the repo.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/R7nX/Nimbus.git
   cd Nimbus
   ```

2. Activate the pinned Node version (reads `.nvmrc` / `.node-version`):

   ```bash
   fnm install   # first time only — installs Node 22.23.1
   fnm use
   ```

3. Install all workspace dependencies from the repository root:

   ```bash
   npm install
   ```

   This installs dependencies for the frontend app in `nimbus/`, the backend API in `nimbus/server/`, and the root workspace tools.

4. Create a local backend environment file:

   ```bash
   cd nimbus/server
   cp .env.example .env
   ```

   On PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

### Running locally

Start the frontend and backend together from the repository root:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The API runs at [http://127.0.0.1:4000](http://127.0.0.1:4000) by default.

You can also run either side by itself from the repository root:

```bash
npm run dev:frontend
npm run dev:server
```

### Root workspace commands

Run these commands from the repository root.

| Command                  | Description                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `npm install`            | Install dependencies for all npm workspaces and create/update the root `package-lock.json` |
| `npm run dev`            | Start the frontend and backend development servers together                                |
| `npm run dev:frontend`   | Start only the Next.js frontend                                                            |
| `npm run dev:server`     | Start only the Fastify backend API                                                         |
| `npm run build`          | Build the frontend and backend                                                             |
| `npm run build:frontend` | Build only the frontend                                                                    |
| `npm run build:server`   | Build only the backend                                                                     |

### Frontend commands

Run these commands from `nimbus/`, or use the root workspace commands above.

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Start development server with hot reload       |
| `npm run build` | Build for production                           |
| `npm run start` | Start production server (requires build first) |
| `npm run lint`  | Run ESLint                                     |

### Backend commands

Run these commands from `nimbus/server/`, or use the root workspace commands above.

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start Fastify API server with watch mode |
| `npm run build` | Compile TypeScript into `dist/`          |
| `npm run start` | Start compiled API server                |

## 🗺️ Routes

### Frontend routes

| Path        | Description                        |
| ----------- | ---------------------------------- |
| `/`         | Simple editor demo                 |
| `/homepage` | Main IDE with full file management |
| `/login`    | User login                         |
| `/signup`   | User registration                  |

### Backend API routes

| Method | Path      | Description                             |
| ------ | --------- | --------------------------------------- |
| `GET`  | `/health` | Health check for the Fastify API server |

Check backend health:

```bash
curl http://127.0.0.1:4000/health
```

On PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:4000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "nimbus-api",
  "uptime": 12.34
}
```

## Backend API

The backend API lives in `nimbus/server` and provides the foundation for future terminal sessions, WebSockets, files, auth, and user sessions.

## Workspace layout

The repository uses npm workspaces from the top-level `package.json`.

| Path                         | Description                                                            |
| ---------------------------- | ---------------------------------------------------------------------- |
| `package.json`               | Root workspace scripts for installing, running, and building both apps |
| `package-lock.json`          | Single lockfile for all npm workspaces                                 |
| `nimbus/package.json`        | Frontend package manifest                                              |
| `nimbus/server/package.json` | Backend API package manifest                                           |

### Environment variables

The backend reads config from `nimbus/server/.env`.

| Variable      | Default                 | Description                             |
| ------------- | ----------------------- | --------------------------------------- |
| `NODE_ENV`    | `development`           | Runtime environment                     |
| `HOST`        | `127.0.0.1`             | Host address for the API server         |
| `PORT`        | `4000`                  | Port for the API server                 |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend origin allowed to call the API |

### Backend structure

| Path           | Description                                      |
| -------------- | ------------------------------------------------ |
| `src/config`   | Environment config loading                       |
| `src/routes`   | HTTP API routes                                  |
| `src/services` | Backend logic used by routes                     |
| `src/ws`       | Future WebSocket handlers for terminal streaming |

## 🌐 Browser Support

The File System Access API (used for native open/save dialogs) is only available in Chromium-based browsers.

| Browser               | Support                               |
| --------------------- | ------------------------------------- |
| Chrome / Edge / Opera | Full — native file open & save        |
| Safari / Firefox      | Limited — save falls back to download |

## 🧰 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Backend API**: Fastify 5
- **Editor**: Monaco Editor 0.52
- **UI**: React 19, Tailwind CSS, Framer Motion
- **Language**: TypeScript 5

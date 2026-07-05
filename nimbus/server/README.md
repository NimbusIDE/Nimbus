This is a [Fastify](https://fastify.dev/) API service for Nimbus.

The server provides the backend foundation for future terminal sessions, WebSockets, files, auth, and user sessions. The current API exposes a health check route and loads runtime config from environment variables.

## Getting Started

From the repository root, install all workspace dependencies:

```bash
cd C:\Nimbus
npm install
```

Create a local environment file from the example:

```bash
cd C:\Nimbus\nimbus\server
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Then run the frontend and backend together from the repository root:

```bash
cd C:\Nimbus
npm run dev
```

The API starts at [http://127.0.0.1:4000](http://127.0.0.1:4000) by default.

To run only the backend API from the repository root:

```bash
npm run dev:server
```

You can also run backend commands directly from this folder:

```bash
cd C:\Nimbus\nimbus\server
npm run dev
```

## Health Check

Check that the server is running:

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

## Environment Variables

The server reads config from `.env`.

| Variable      | Default                 | Description                             |
| ------------- | ----------------------- | --------------------------------------- |
| `NODE_ENV`    | `development`           | Runtime environment                     |
| `HOST`        | `127.0.0.1`             | Host address for the API server         |
| `PORT`        | `4000`                  | Port for the API server                 |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend origin allowed to call the API |

## Project Structure

```text
src/
  config/     Environment config loading
  routes/     HTTP API routes
  services/   Backend logic used by routes
  ws/         Future WebSocket handlers
```

The `ws` folder is reserved for terminal streaming work. Terminal sessions are not implemented yet.

## Available Commands

From the repository root:

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the frontend and backend together |
| `npm run dev:server`   | Start only this Fastify API server      |
| `npm run build:server` | Build only this API server              |

From `C:\Nimbus\nimbus\server`:

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the API server with watch mode |
| `npm run build` | Compile TypeScript into `dist/`      |
| `npm run start` | Run the compiled server from `dist/` |

## Learn More

To learn more about the tools used by this server:

- [Fastify Documentation](https://fastify.dev/docs/latest/) - learn about Fastify routes, plugins, and lifecycle hooks.
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - learn about TypeScript syntax and configuration.
- [dotenv Documentation](https://github.com/motdotla/dotenv) - learn how `.env` files are loaded.

import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

// This file lives at nimbus/server/src/config/env.ts, so the repo root is
// four directories up. Default to the bundled demo workspace there so
// `npm run dev` works out of the box on any OS without editing `.env`.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultWorkspaceRoot = path.resolve(
  __dirname,
  "../../../../workspaces/demo",
);

// Load environment variables from .env file and provide default values for configuration settings
export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  workspaceRoot: process.env.WORKSPACE_ROOT || defaultWorkspaceRoot,
};

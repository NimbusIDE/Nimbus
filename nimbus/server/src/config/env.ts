import "dotenv/config";

// Load environment variables from .env file and provide default values for configuration settings
export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  workspaceRoot: process.env.WORKSPACE_ROOT ?? "C:/Nimbus/workspaces/demo",
};
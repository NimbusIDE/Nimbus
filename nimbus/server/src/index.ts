import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";
import { fileTreeRoutes } from "./routes/fileTree.js";

// Initialize Fastify server
const app = Fastify({
  logger: true,
});

// Cross-Origin Resource Sharing (CORS) configuration.
// Allow frontend to access the API from a different origin.
// (frontend runs on: http://localhost:3000, backend runs on: http://127.0.0.1:4000)
await app.register(cors, {
  origin: config.corsOrigin,
  methods: ["GET", "POST", "PUT", "OPTIONS"],
});

// Register health check routes
await healthRoutes(app);

// Register file tree routes
await fileTreeRoutes(app);

// Start the server and listen on the specified host and port.
// Handle server startup errors
try {
  await app.listen({
    host: config.host,
    port: config.port,
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
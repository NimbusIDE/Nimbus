import type { FastifyInstance } from "fastify";
import { getHealthStatus } from "../services/healthService.js";

// Define health check routes for the Fastify server
export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return getHealthStatus();
  });
}

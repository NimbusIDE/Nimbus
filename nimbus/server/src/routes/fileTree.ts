import type { FastifyInstance } from "fastify";
import { getWorkspaceTree, readWorkspaceTree, writeWorkspaceTree } from "../services/fileTreeService.js";

// Define the file tree routes for the Fastify server.
export async function fileTreeRoutes(app: FastifyInstance) {
  // Handle GET request to retrieve the workspace tree structure.
  app.get("/workspace/tree", async () => {
    return getWorkspaceTree();
  });

  // Handle GET request to read a file from the workspace.
  app.get("/workspace/file", async (request, reply) => {
    const query = request.query as { path?: string };
    
    if (!query.path) {
      reply.status(400).send({ error: "Missing 'path' query parameter" });
      return;
    }

    return readWorkspaceTree(query.path);   
  });

  // Handle PUT request to save a file in the workspace.
  app.put("/workspace/file", async (request, reply) => {
    const body = request.body as { path?: string; content?: string };

    if (!body.path) {
      reply.status(400).send({ error: "Missing 'path' body parameter" });
      return;
    }

    if (typeof body.content !== "string") {
      reply.status(400).send({ error: "Invalid 'content' body parameter" });
      return;
    }

    return writeWorkspaceTree(body.path, body.content);
  });
}
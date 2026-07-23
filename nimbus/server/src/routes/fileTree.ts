import type { FastifyInstance } from "fastify";
import {
  getWorkspaceTree,
  readWorkspaceTree,
  writeWorkspaceTree,
  FileNotFoundError,
  InvalidPathError,
  moveWorkspaceNode,
} from "../services/fileTreeService.js";

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

    // Attempt to read the file and handle potential errors.
    try {
      return await readWorkspaceTree(query.path);
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        reply.status(404).send({ error: error.message });
        return;
      }
      if (error instanceof InvalidPathError) {
        reply.status(400).send({ error: error.message });
        return;
      }
      request.log.error(error);
      reply.status(500).send({ error: "Internal server error" });
      return;
    }
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

  // Handle POST request to move a file or folder within the workspace.
  app.post("/workspace/move", async (request, reply) => {
    const body = request.body as {
      sourcePath?: string;
      destinationFolderPath?: string;
    };

    if (
      typeof body.sourcePath !== "string" ||
      typeof body.destinationFolderPath !== "string"
    ) {
      return reply.status(400).send({ error: "Invalid move request" });
    }

    try {
      return await moveWorkspaceNode(
        body.sourcePath,
        body.destinationFolderPath,
      );
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        reply.status(404).send({ error: error.message });
        return;
      }
      if (error instanceof InvalidPathError) {
        reply.status(400).send({ error: error.message });
        return;
      }
      request.log.error(error);
      reply.status(500).send({ error: "Internal server error" });
      return;
    }
  });
}

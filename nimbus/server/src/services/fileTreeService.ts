import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config/env.js";

const ignoredNames = new Set(["node_modules", ".git", ".next", "dist"]);

// TODO: Add comment
export type TreeNode = {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: TreeNode[];
};

// Get the workspace tree structure.
export async function getWorkspaceTree() {
  const rootPath = path.resolve(config.workspaceRoot);
  const nodes = await readDirectoryTree(rootPath);

  return {
    nodes,
  };
}

// Read a file from the workspace tree.
export async function readWorkspaceTree(relativePath: string) {
  const absolutePath = resolveWorkspacePath(relativePath);
  try {
    const content = await readFile(absolutePath, "utf-8");

    return {
      path: relativePath,
      name: path.basename(relativePath),
      content,
    };
  } catch (error) {
    // If the error is a file not found error, throw a custom FileNotFoundError.
    if (error instanceof Error && error.message.includes("ENOENT")) {
      throw new FileNotFoundError(`File not found: ${relativePath}`);
    }
    throw error;
  }
}

// Custom error class for file not found errors.
export class FileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileNotFoundError";
  }
}

// Custom error class for invalid path errors.
export class InvalidPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPathError";
  }
}

// Write a file to the workspace tree.
export async function writeWorkspaceTree(
  relativePath: string,
  content: string,
) {
  const absolutePath = resolveWorkspacePath(relativePath);
  await writeFile(absolutePath, content, "utf-8");

  return {
    path: relativePath,
    name: path.basename(relativePath),
    saved: true,
  };
}

// Resolve a relative path within the workspace root to an absolute path.
function resolveWorkspacePath(relativePath: string) {
  const root = path.resolve(config.workspaceRoot);
  const target = path.resolve(root, relativePath);

  if (!target.startsWith(root)) {
    throw new InvalidPathError(`Invalid path: ${relativePath}`);
  }

  return target;
}

// Recursively read the directory tree and return a structured representation of files and folders.
async function readDirectoryTree(directoryPath: string): Promise<TreeNode[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nodes: TreeNode[] = [];

  for (const entry of entries) {
    if (ignoredNames.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);

    try {
      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          type: "folder",
          children: await readDirectoryTree(entryPath),
        });
      }

      if (entry.isFile()) {
        nodes.push({
          name: entry.name,
          type: "file",
          content: "",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("ENOENT")) {
        throw new FileNotFoundError(`File not found: ${entryPath}`);
      }
      throw error;
    }
  }

  return nodes;
}

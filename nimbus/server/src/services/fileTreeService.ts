import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config/env.js";

const ignoredNames = new Set(["node_modules", ".git", ".next", "dist"]);

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
    nodes
  };
}

// Read a file from the workspace tree.
export async function readWorkspaceTree(relativePath: string) {
  const absolutePath = resolveWorkspacePath(relativePath);
  const content = await readFile(absolutePath, "utf-8");

  return {
    path: relativePath,
    name: path.basename(relativePath),
    content
  };
}

// Write a file to the workspace tree.
export async function writeWorkspaceTree(relativePath: string, content: string) {
  const absolutePath = resolveWorkspacePath(relativePath);
  await writeFile(absolutePath, content, "utf-8");

  return {
    path: relativePath,
    name: path.basename(relativePath),
    saved: true,
  }
}

// Resolve a relative path within the workspace root to an absolute path.
function resolveWorkspacePath(relativePath: string) {
  const root = path.resolve(config.workspaceRoot);
  const target = path.resolve(root, relativePath);

  if (!target.startsWith(root)) {
    throw new Error("Invalid workspace path");
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
  }

  return nodes;
}
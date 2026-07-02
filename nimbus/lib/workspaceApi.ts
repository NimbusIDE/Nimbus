import type { FileTreeResponse, WorkspaceFileResponse } from "@/types/workspace";

// Single place for frontend workspace API calls.
//
// page.tsx and hooks should not need to know the exact backend URLs. When the
// API base URL moves to an environment variable later, this is the only file
// that should need to change.
const WORKSPACE_API_BASE_URL = "http://127.0.0.1:4000";

export async function fetchWorkspaceTree(): Promise<FileTreeResponse> {
  const response = await fetch(`${WORKSPACE_API_BASE_URL}/workspace/tree`);

  if (!response.ok) {
    throw new Error("Failed to load workspace files");
  }

  return (await response.json()) as FileTreeResponse;
}

export async function fetchWorkspaceFile(
  path: string
): Promise<WorkspaceFileResponse> {
  const response = await fetch(
    `${WORKSPACE_API_BASE_URL}/workspace/file?path=${encodeURIComponent(path)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load file contents");
  }

  return (await response.json()) as WorkspaceFileResponse;
}

export async function saveWorkspaceFile(path: string, content: string) {
  const response = await fetch(`${WORKSPACE_API_BASE_URL}/workspace/file`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path, content }),
  });

  if (!response.ok) {
    throw new Error("Failed to save file");
  }
}

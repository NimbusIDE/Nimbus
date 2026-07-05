import { useEffect, useState } from "react";
import { fetchWorkspaceTree } from "@/lib/workspaceApi";
import type { TreeNode } from "@/types/workspace";

type UseWorkspaceTreeOptions = {
  onTreeLoaded?: (nodes: TreeNode[]) => void;
};

// Loads the workspace directory tree from the backend.
//
// This hook owns only tree-fetch lifecycle state: nodes, loading, and error.
// It accepts an optional callback so page-level file caches can be seeded after
// the tree arrives without putting fetch logic back into page.tsx.
export function useWorkspaceTree({ onTreeLoaded }: UseWorkspaceTreeOptions = {}) {
  const [workspaceTree, setWorkspaceTree] = useState<TreeNode[]>([]);
  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspaceTree() {
      try {
        setIsTreeLoading(true);
        setTreeError(null);

        const data = await fetchWorkspaceTree();

        setWorkspaceTree(data.nodes);
        onTreeLoaded?.(data.nodes);
      } catch (error) {
        setTreeError(
          error instanceof Error ? error.message : "Failed to load workspace files"
        );
      } finally {
        setIsTreeLoading(false);
      }
    }

    void loadWorkspaceTree();
  }, [onTreeLoaded]);

  return {
    workspaceTree,
    isTreeLoading,
    treeError,
    setTreeError,
  };
}

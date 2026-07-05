import { FileTree } from "@/components/FileTree";
import type { TreeNode } from "@/types/workspace";

type ExplorerPanelProps = {
  nodes: TreeNode[];
  activePath?: string;
  isLoading: boolean;
  error: string | null;
  onSelectFile: (node: TreeNode, path: string) => void;
  onOpenFile: (node: TreeNode, path: string) => void;
};

// Sidebar presentation for the workspace explorer.
//
// Loading, error, and tree-rendering markup lives here so page.tsx does not own
// sidebar UI details. The actual fetch/load behavior still comes from hooks.
export function ExplorerPanel({
  nodes,
  activePath,
  isLoading,
  error,
  onSelectFile,
  onOpenFile,
}: ExplorerPanelProps) {
  return (
    <aside className="w-[15vw] shrink-0 bg-neutral-900 text-neutral-100">
      <header className="h-12 px-4 flex items-center border-b border-neutral-800">
        Explorer
      </header>

      {isLoading ? (
        <p className="px-4 py-3 text-sm text-neutral-400">Loading files...</p>
      ) : error ? (
        <p className="px-4 py-3 text-sm text-red-400">{error}</p>
      ) : (
        <FileTree
          nodes={nodes}
          activePath={activePath}
          onSelectFile={onSelectFile}
          onOpenFile={onOpenFile}
        />
      )}
    </aside>
  );
}

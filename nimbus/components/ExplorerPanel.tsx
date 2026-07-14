import { FileTree } from "@/components/FileTree";
import type { TreeNode } from "@/types/workspace";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";
import { useState } from "react";

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
  const [contextMenu, setContextMenu] = useState<{
    items: ContextMenuItem[];
    position: { x: number; y: number };
  } | null>(null);

  function handleFileContextMenu(
    node: TreeNode,
    path: string,
    position: { x: number; y: number },
  ) {
    setContextMenu({
      position,
      items: [
        { label: "Open", onClick: () => console.log("Open", path) },
        { label: "Rename", onClick: () => console.log("Rename", path) },
        { label: "Duplicate", onClick: () => console.log("Duplicate", path) },
        {
          label: "Delete",
          onClick: () => console.log("Delete", path),
          destructive: true,
        },
      ],
    });
  }

  function handleFolderContextMenu(
    node: TreeNode,
    path: string,
    position: { x: number; y: number },
  ) {
    setContextMenu({
      position,
      items: [
        { label: "New File", onClick: () => console.log("New File", path) },
        {
          label: "New Folder",
          onClick: () => console.log("New Folder", path),
        },
        { label: "Rename", onClick: () => console.log("Rename", path) },
        {
          label: "Delete",
          onClick: () => console.log("Delete", path),
          destructive: true,
        },
      ],
    });
  }

  function handleEmptyContextMenu(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    setContextMenu({
      position: { x: event.clientX, y: event.clientY },
      items: [
        {
          label: "New File",
          onClick: () => console.log("New File at root"),
        },
        {
          label: "New Folder",
          onClick: () => console.log("New Folder at root"),
        },
      ],
    });
  }

  return (
    <aside
      className="w-[15vw] shrink-0 bg-neutral-900 text-neutral-100"
      onContextMenu={handleEmptyContextMenu}
    >
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
          onFileContextMenu={handleFileContextMenu}
          onFolderContextMenu={handleFolderContextMenu}
        />
      )}

      {contextMenu ? (
        <ContextMenu
          position={contextMenu.position}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      ) : null}
    </aside>
  );
}

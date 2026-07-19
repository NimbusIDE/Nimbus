import { useEffect, useRef, useState } from "react";
import { File, FileCode, FileJson, Folder } from "lucide-react";
import type { ContextMenuHandler, TreeNode } from "@/types/workspace";

export type { TreeNode } from "@/types/workspace";

type FileTreeProps = {
  nodes: TreeNode[];
  activePath?: string;
  onSelectFile: (node: TreeNode, path: string) => void;
  onOpenFile?: (node: TreeNode, path: string) => void;
  // Right-click on a row. The parent (ExplorerPanel) decides what menu
  // items to show based on whether the row is a file or a folder.
  onFileContextMenu?: ContextMenuHandler;
  onFolderContextMenu?: ContextMenuHandler;
};

type TreeNodeRowProps = {
  node: TreeNode;
  depth: number;
  path: string;
  activePath?: string;
  onSelectFile: (node: TreeNode, path: string) => void;
  onOpenFile?: (node: TreeNode, path: string) => void;
  onFileContextMenu?: ContextMenuHandler;
  onFolderContextMenu?: ContextMenuHandler;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
};

function getFileIcon(name: string) {
  const extension = name.includes(".")
    ? name.split(".").pop()?.toLowerCase()
    : undefined;

  switch (extension) {
    case "json":
      return FileJson;
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return FileCode;
    default:
      return File;
  }
}

function getNodeIcon(node: TreeNode) {
  if (node.type === "folder") {
    return Folder;
  }
  return getFileIcon(node.name);
}

// Individual row in the file tree. It renders both folders and files, then
// recursively renders children when a folder is expanded.
function TreeNodeRow({
  node,
  depth,
  path,
  activePath,
  onSelectFile,
  onOpenFile,
  onFileContextMenu,
  onFolderContextMenu,
  expandedFolders,
  onToggleFolder,
}: TreeNodeRowProps) {
  const isFolder = node.type === "folder";
  const isActive = path === activePath;
  const isExpanded = expandedFolders.has(path);
  const label = node.name;

  // Used to separate single click from double click:
  // single click previews a file after a short delay, while double click cancels
  // that preview and opens the file as a normal/persistent tab.
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const Icon = getNodeIcon(node);

  return (
    <li>
      <button
        type="button"
        className={`flex w-full items-center rounded py-1 pr-2 text-left text-sm transition-colors ${
          isActive
            ? "bg-sky-900/50 text-sky-100"
            : "text-neutral-300 hover:bg-neutral-800/70 hover:text-neutral-100"
        } ${isFolder ? "font-semibold" : "font-normal"}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          // Folders only expand/collapse. They do not open editor tabs.
          if (isFolder) {
            onToggleFolder(path);
            return;
          }

          if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
          }

          clickTimerRef.current = setTimeout(() => {
            onSelectFile(node, path);
            clickTimerRef.current = null;
          }, 200);
        }}
        onDoubleClick={() => {
          if (isFolder) return;

          if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
          }

          onOpenFile?.(node, path);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          // stopPropagation so ExplorerPanel's empty-space handler doesn't
          // also fire for a click that landed on a row.
          event.stopPropagation();

          const position = { x: event.clientX, y: event.clientY };

          if (isFolder) {
            onFolderContextMenu?.(node, path, position);
          } else {
            onFileContextMenu?.(node, path, position);
          }
        }}
        aria-expanded={isFolder ? isExpanded : undefined}
      >
        <span className="mr-2 flex h-4 w-4 items-center justify-center">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>{label}</span>
        {isFolder ? (
          <span className="ml-auto text-neutral-500" aria-hidden="true">
            {isExpanded ? "" : ">"}
          </span>
        ) : null}
      </button>

      {isFolder && isExpanded && node.children?.length ? (
        <ul aria-label={`${path} contents`}>
          {node.children.map((child) => (
            <TreeNodeRow
              key={`${path}/${child.name}`}
              node={child}
              depth={depth + 1}
              path={`${path}/${child.name}`}
              activePath={activePath}
              onSelectFile={onSelectFile}
              onOpenFile={onOpenFile}
              onFileContextMenu={onFileContextMenu}
              onFolderContextMenu={onFolderContextMenu}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function getInitialExpandedFolders(
  nodes: TreeNode[],
  parentPath = "",
): string[] {
  // Expand all folders by default so the hardcoded demo tree is immediately visible.
  return nodes.flatMap((node) => {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;

    if (node.type !== "folder") {
      return [];
    }

    return [path, ...getInitialExpandedFolders(node.children ?? [], path)];
  });
}

export function FileTree({
  nodes,
  activePath,
  onSelectFile,
  onOpenFile,
  onFileContextMenu,
  onFolderContextMenu,
}: FileTreeProps) {
  // Track expanded folders locally because folder open/closed UI belongs to the tree.
  const [expandedFolders, setExpandedFolders] = useState(
    () => new Set(getInitialExpandedFolders(nodes)),
  );

  // The workspace tree arrives asynchronously from the backend. When the nodes
  // change, expand folders again so the loaded project is visible immediately.
  useEffect(() => {
    setExpandedFolders(new Set(getInitialExpandedFolders(nodes)));
  }, [nodes]);

  // Toggle a folder path while preserving all other expanded/collapsed folders.
  const handleToggleFolder = (path: string) => {
    setExpandedFolders((current) => {
      const next = new Set(current);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  };
  return (
    <nav aria-label="Project files">
      <ul className="space-y-0.5">
        {nodes.map((node) => (
          <TreeNodeRow
            key={node.name}
            node={node}
            depth={0}
            path={node.name}
            activePath={activePath}
            onSelectFile={onSelectFile}
            onOpenFile={onOpenFile}
            onFileContextMenu={onFileContextMenu}
            onFolderContextMenu={onFolderContextMenu}
            expandedFolders={expandedFolders}
            onToggleFolder={handleToggleFolder}
          />
        ))}
      </ul>
    </nav>
  );
}

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { File, FileCode, FileJson, Folder } from "lucide-react";
import type { ContextMenuHandler, TreeNode } from "@/types/workspace";

export type { TreeNode } from "@/types/workspace";

// The workspace root is represented by an empty target path. Dropping onto the
// tree background uses this value to mean "move this item out to the root".
const ROOT_DROP_TARGET_PATH = "";

type FileTreeProps = {
  nodes: TreeNode[];
  activePath?: string;
  onSelectFile: (node: TreeNode, path: string) => void;
  onOpenFile?: (node: TreeNode, path: string) => void;
  // Right-click on a row. The parent (ExplorerPanel) decides what menu
  // items to show based on whether the row is a file or a folder.
  onFileContextMenu?: ContextMenuHandler;
  onFolderContextMenu?: ContextMenuHandler;
  onMoveNode?: (sourcePath: string, targetFolderPath: string) => void;
};

type FileTreeContextValue = {
  draggingPath: string | null;
  dropTargetPath: string | null;
  onDragStartNode: (path: string) => void;
  onDragEndNode: () => void;
  onDragOverFolder: (path: string) => void;
  onDropOnFolder: (targetFolderPath: string) => void;
};

type TreeNodeRowProps = {
  node: TreeNode;
  // Nesting level, used to compute indentation.
  depth: number;
  // Full slash-joined path from the tree root (e.g. "app/page.tsx"),
  // used as the row's identity for selection, expansion, and context menus.
  path: string;
  activePath?: string;
  onSelectFile: (node: TreeNode, path: string) => void;
  onOpenFile?: (node: TreeNode, path: string) => void;
  onFileContextMenu?: ContextMenuHandler;
  onFolderContextMenu?: ContextMenuHandler;
  // Expansion state lives in the parent FileTree and is passed down so all
  // rows share one source of truth instead of tracking their own.
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
};

// Context for drag state. FileTree owns the state, but TreeNodeRow components
// need to read it and update it during drag events. This context avoids passing
// the state through many props.
const FileTreeContext = createContext<FileTreeContextValue | null>(null);

// Custom hook to access the FileTreeContext. Throws an error if used outside
function useFileTreeContext() {
  const context = useContext(FileTreeContext);

  if (!context) {
    throw new Error("useFileTreeContext must be used within a FileTreeContext");
  }

  return context;
}

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
  // Drag state is shared through context so all rows can read/write it without
  // passing props through many levels of recursion.
  const {
    draggingPath,
    dropTargetPath,
    onDragStartNode,
    onDragEndNode,
    onDragOverFolder,
    onDropOnFolder,
  } = useFileTreeContext();

  const isFolder = node.type === "folder";
  const isActive = path === activePath;
  const isExpanded = expandedFolders.has(path);
  // These booleans only control drag/drop visuals for this row: the item being
  // dragged fades out, and a folder being hovered as a drop target turns blue.
  const isDragging = draggingPath === path;
  const isDropTarget = isFolder && dropTargetPath === path;
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
        draggable
        className={`flex w-full items-center rounded py-1 pr-2 text-left text-sm transition-colors ${
          isDropTarget
            ? "bg-blue-900/70 text-blue-100"
            : isActive
              ? "bg-sky-900/50 text-sky-100"
              : "text-neutral-300 hover:bg-neutral-800/70 hover:text-neutral-100"
        } ${isDragging ? "opacity-50" : ""} ${
          isFolder ? "font-semibold" : "font-normal"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onDragStart={(event) => {
          // Start dragging this visible tree row. The browser dataTransfer value
          // carries the path for native drag behavior, while React state drives
          // the UI highlight/fade state inside FileTree.
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", path);
          onDragStartNode(path);
        }}
        onDragEnd={onDragEndNode}
        onDragOver={(event) => {
          // Files can be dragged, but only folders accept nested drops.
          if (!isFolder) {
            return;
          }

          // A drop target must call preventDefault during drag-over, otherwise
          // the browser refuses to fire a drop event on that element.
          event.preventDefault();
          // Folder rows are inside the root drop area. Stop propagation so a
          // folder hover does not get overwritten by the root hover handler.
          event.stopPropagation();
          event.dataTransfer.dropEffect = "move";
          onDragOverFolder(path);
        }}
        onDrop={(event) => {
          // Dropping onto a folder reports "move source into this folder" to the
          // parent. FileTree does not perform the filesystem move itself.
          if (!isFolder) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          onDropOnFolder(path);
        }}
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
  onMoveNode,
}: FileTreeProps) {
  // Track expanded folders locally because folder open/closed UI belongs to the tree.
  const [expandedFolders, setExpandedFolders] = useState(
    () => new Set(getInitialExpandedFolders(nodes)),
  );
  // Drag state is owned by FileTree because the dragged item and drop target can
  // be different TreeNodeRow components, including deeply nested rows.
  const [draggingPath, setDraggingPath] = useState<string | null>(null);
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null);
  const isRootDropTarget = dropTargetPath === ROOT_DROP_TARGET_PATH;

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

  const handleDragStartNode = (path: string) => {
    // Remember which path is currently being dragged so targets can decide
    // whether to highlight and what source path to report on drop.
    setDraggingPath(path);
  };

  const handleDragEndNode = () => {
    // Drag end fires when the user drops, cancels, or releases outside a target.
    // Clearing both values removes all temporary drag styling.
    setDraggingPath(null);
    setDropTargetPath(null);
  };

  const handleDragOverFolder = (path: string) => {
    // Highlight the folder currently under the pointer. Dropping an item onto
    // itself is ignored because it would be a no-op.
    if (!draggingPath || draggingPath === path) {
      return;
    }

    setDropTargetPath(path);
  };

  const handleDropOnFolder = (targetFolderPath: string) => {
    // A valid folder drop sends the source path and destination folder path up
    // through onMoveNode. Backend/file-tree refresh work can plug in there.
    if (!draggingPath || draggingPath === targetFolderPath) {
      return;
    }

    onMoveNode?.(draggingPath, targetFolderPath);
    setDraggingPath(null);
    setDropTargetPath(null);
  };

  const handleDragOverRoot = (event: DragEvent<HTMLElement>) => {
    // The root target is the empty space/background of the tree. It lets users
    // move files or folders out of a folder and back to the workspace root.
    if (!draggingPath) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetPath(ROOT_DROP_TARGET_PATH);
  };

  const handleDropOnRoot = (event: DragEvent<HTMLElement>) => {
    // Dropping on root reports an empty destination path. Later backend code can
    // interpret that as the workspace root directory.
    if (!draggingPath) {
      return;
    }

    event.preventDefault();
    onMoveNode?.(draggingPath, ROOT_DROP_TARGET_PATH);
    setDraggingPath(null);
    setDropTargetPath(null);
  };

  // Provide drag state and handlers to all TreeNodeRow children through context.
  const contextValue: FileTreeContextValue = {
    draggingPath,
    dropTargetPath,
    onDragStartNode: handleDragStartNode,
    onDragEndNode: handleDragEndNode,
    onDragOverFolder: handleDragOverFolder,
    onDropOnFolder: handleDropOnFolder,
  };

  return (
    // File explorer section:
    // --------------------------------------------------------------------------------
    // Renders the project tree and delegates file selection/opening behavior to page.tsx.
    <FileTreeContext.Provider value={contextValue}>
      <nav
        aria-label="Project files"
        onDragOver={handleDragOverRoot}
        onDrop={handleDropOnRoot}
        className={`min-h-full rounded transition-colors ${
          isRootDropTarget ? "bg-blue-950/40 ring-1 ring-blue-700/70" : ""
        }`}
      >
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
    </FileTreeContext.Provider>
  );
}

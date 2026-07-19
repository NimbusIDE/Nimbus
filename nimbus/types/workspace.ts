// Shared workspace types for the frontend.
//
// These shapes are used by the file tree, tab bar, editor state, and workspace
// API helpers. Keeping them here avoids importing UI components just to reuse
// their types, and gives the frontend one shared contract for backend data.

export type TreeNode = {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: TreeNode[];
};

// Flat editor cache keyed by workspace-relative path, for example:
// "app/page.tsx". The sidebar renders TreeNode[], but editor/tab behavior needs
// fast lookup by path so edits survive while users switch tabs.
export type FileMap = Record<
  string,
  {
    name: string;
    contents: string;
    isDirty: boolean;
    // Tree data may create a file entry before its full contents have been
    // fetched. Once true, tab switches can use the cached contents directly.
    isLoaded: boolean;
  }
>;

// Tabs are intentionally lightweight. They identify which files are open, while
// file contents and dirty state stay in FileMap.
export type OpenTab = {
  id: string;
  name: string;
  isPreview: boolean;
};

export type FileTreeResponse = {
  nodes: TreeNode[];
};

export type WorkspaceFileResponse = {
  path: string;
  name: string;
  content: string;
};

// Viewport coordinates for a floating UI element (currently just the
// right-click context menu).
export type Position = {
  x: number;
  y: number;
};

// Right-click handler for a file/folder tree row. Shared by FileTree (which
// calls it) and ExplorerPanel (which implements it) so the signature only
// needs to change in one place.
export type ContextMenuHandler = (
  node: TreeNode,
  path: string,
  position: Position,
) => void;

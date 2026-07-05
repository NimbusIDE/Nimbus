"use client";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { FileTree, type TreeNode } from "@/components/FileTree";
import { TabBar } from "@/components/TabBar";
import { useFileManager } from "@/components/hooks/useFileManager";
import Link from "next/link";

// Single source of truth for all placeholder files loaded in the editor.
// Keyed by file path (e.g. "app/page.tsx") so switching tabs is O(1) and each
// file keeps its own contents string, preventing edits from bleeding across files.
type FileMap = Record<
  string,
  {
    name: string;
    contents: string;
    isDirty: boolean;
  }
>;

// Lightweight tab metadata. Tabs do not store file contents or dirty state;
// those live in FileMap. The dirty dot is derived from FileMap at render time.
type OpenTab = {
  id: string;
  name: string;
  isPreview: boolean;
};

// Walks the demo file tree and flattens every file into a FileMap entry.
// Folders are recursed into; only files are added, keyed by their full path.
function treeToMap(
  nodes: TreeNode[],
  parentPath = "",
  map: FileMap = {},
): FileMap {
  for (const node of nodes) {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.type === "file") {
      map[currentPath] = {
        name: node.name,
        contents: node.content ?? "",
        isDirty: false,
      };
    } else if (node.type === "folder" && node.children) {
      treeToMap(node.children, currentPath, map);
    }
  }

  return map;
}

// File structure for the file explorer. In a real app, this would come from the backend or filesystem.
const sampleFileTree: TreeNode[] = [
  {
    name: "app",
    type: "folder",
    children: [
      {
        name: "page.tsx",
        type: "file",
        content: `export default function HomePage() {
  return <main>Welcome to Nimbus.</main>;
}
`,
      },
      {
        name: "layout.tsx",
        type: "file",
        content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <html lang="en"><body>{children}</body></html>;
}
`,
      },
      {
        name: "login",
        type: "folder",
        children: [
          {
            name: "page.tsx",
            type: "file",
            content: `export default function LoginPage() {
  return <form>Log in to Nimbus</form>;
}
`,
          },
        ],
      },
    ],
  },
  {
    name: "components",
    type: "folder",
    children: [
      {
        name: "FileTree.tsx",
        type: "file",
        content: `export function FileTree() {
  return <nav aria-label="Project files" />;
}
`,
      },
      {
        name: "FileToolbar.tsx",
        type: "file",
        content: `export function FileToolbar() {
  return <div>File actions</div>;
}
`,
      },
      {
        name: "hooks",
        type: "folder",
        children: [
          {
            name: "useFileManager.ts",
            type: "file",
            content: `export function useFileManager() {
  return { fileName: "temp.py" };
}
`,
          },
        ],
      },
    ],
  },
  {
    name: "package.json",
    type: "file",
    content: `{
  "name": "nimbus",
  "private": true
}
`,
  },
  {
    name: "tailwind.config.ts",
    type: "file",
    content: `import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
} satisfies Config;
`,
  },
];

export default function App() {
  const {
    code,
    setCode, // call this in Editor onChange; it marks buffer dirty
    isDirty,
    setIsDirty,
    language, // inferred from file extension on open/save-as
    isVirtualFile,
    openFile,
    openVirtualFile,
    saveFile,
    saveFileAs,
    fileInputProps, // spread onto a hidden <input> for non-Chromium fallback
  } = useFileManager();

  const [theme] = useState<string>("vs-dark");

  // Holds the in-memory contents and dirty state for every placeholder file.
  // Initialized once from the demo tree plus the default temp.py tab that is
  // open on first render.
  const [files, setFiles] = useState<FileMap>(() => ({
    ...treeToMap(sampleFileTree),
    "temp.py": {
      name: "temp.py",
      contents: "def helloWorld():\n  return 'Hello World'\n",
      isDirty: false,
    },
  }));

  const [activeFilePath, setActiveFilePath] = useState<string>();

  // File tree section:
  // --------------------------------------------------------------------------------
  // Single-click a file in the tree: open it as a preview tab (replacing any
  // existing preview) or activate it if already open. Contents always come from
  // the FileMap, never the original tree constant, so in-memory edits survive.
  const handleSelectFile = (node: TreeNode, path: string) => {
    const nextTab: OpenTab = {
      id: path,
      name: node.name,
      isPreview: true,
    };

    // If already open, keep as is (e.g., if already open as preview, keep as preview; if open as normal, keep as normal).
    setOpenFiles((tabs) => {
      const alreadyOpen = tabs.some((tab) => tab.id === path);

      if (alreadyOpen) {
        return tabs;
      }

      const activeTab = tabs.find((tab) => tab.id === activeFileId);

      // If not already open, open as preview (which may replace an existing preview)
      if (activeTab?.isPreview) {
        return tabs.map((tab) => (tab.id === activeFileId ? nextTab : tab));
      }

      return [...tabs, nextTab];
    });

    LoadFileHelper(path);
  };

  // Double-click a file in the tree: open it as a pinned tab. If it is already
  // open, convert it from preview to pinned. Like handleSelectFile, contents are
  // read from the FileMap so in-memory edits are preserved.
  const handleOpenFile = (node: TreeNode, path: string) => {
    const nextTab: OpenTab = {
      id: path,
      name: node.name,
      isPreview: false,
    };

    setOpenFiles((tabs) => {
      const alreadyOpen = tabs.some((tab) => tab.id === path);

      if (alreadyOpen) {
        return tabs.map((tab) =>
          tab.id === path ? { ...tab, isPreview: false } : tab,
        );
      }

      return [...tabs, nextTab];
    });

    LoadFileHelper(path);
  };

  // Activates a file in the editor. Reads the latest contents and dirty state
  // from the FileMap and loads them into useFileManager so Monaco and the Save
  // button stay in sync with the active tab.
  function LoadFileHelper(path: string) {
    const file = files[path];
    if (!file) return;

    setActiveFileId(path);
    setActiveFilePath(path);

    openVirtualFile(
      {
        name: file.name,
        contents: file.contents,
      },
      file.isDirty,
    );
  }

  // Tab bar section:
  // --------------------------------------------------------------------------------
  const [openFiles, setOpenFiles] = useState<OpenTab[]>([
    {
      id: "temp.py",
      name: "temp.py",
      isPreview: false,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState<string>("temp.py");

  // Click a tab: activate that file by loading its stored contents and dirty
  // state from the FileMap.
  const handleSelectTab = (id: string) => {
    LoadFileHelper(id);
  };

  // Save section:
  // --------------------------------------------------------------------------------
  // Placeholder files are saved in-memory only: clear the dirty marker in both
  // the FileMap and the hook. Real files opened from disk still use the File
  // System Access API (or download fallback) via saveFile().
  const handleSave = async () => {
    if (isVirtualFile) {
      setFiles((prev) => ({
        ...prev,
        [activeFileId]: {
          ...prev[activeFileId],
          isDirty: false,
        },
      }));
      // Keep the hook's dirty flag in sync so the Save button disables itself.
      setIsDirty(false);
    } else {
      await saveFile();
    }
  };

  // Basic layout: sidebar for file explorer + main editor area with header
  // No 'New' button because hook is load/save-only per your request
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Static sidebar for file explorer */}
      <aside className="w-[15vw] shrink-0 bg-neutral-900 text-neutral-100">
        <header className="h-12 px-4 flex items-center border-b border-neutral-800">
          Explorer
        </header>
        <FileTree
          nodes={sampleFileTree}
          activePath={activeFilePath}
          onSelectFile={handleSelectFile}
          onOpenFile={handleOpenFile}
        />
      </aside>

      {/* Main editor area */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="p-3 border-b flex items-center gap-2">
          <span className="font-semibold">VS Lite — Editor</span>

          <div className="ml-auto flex items-center gap-2">
            <button className="px-3 py-1 border rounded" onClick={openFile}>
              Open
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={handleSave}
              disabled={!isDirty} // Save enabled only when there are changes
              title={isDirty ? "Save (changes present)" : "Nothing to save"}
            >
              Save
            </button>
            <button className="px-3 py-1 border rounded" onClick={saveFileAs}>
              Save As
            </button>
            <Link href="/login" className="underline ml-2">
              Log In
            </Link>
          </div>

          {/* Hidden input for Safari/Firefox open fallback */}
          <input {...fileInputProps} suppressHydrationWarning />
        </header>

        {/* Tab bar for open files */}
        {/* Derive the dirty dot from the FileMap so it survives tab switches. */}
        <TabBar
          files={openFiles.map((tab) => ({
            ...tab,
            isDirty: files[tab.id]?.isDirty ?? false,
          }))}
          activeFileId={activeFileId ?? ""}
          onSelectFile={handleSelectTab}
        />

        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={language} // tracks extension (e.g., .py -> python)
            theme={theme}
            value={code}
            onChange={(v) => {
              // Update both the live Monaco buffer and the persisted FileMap
              // entry for the active file so edits survive tab switches.
              const nextCode = v ?? "";
              setCode(nextCode);
              setFiles((prev) => ({
                ...prev,
                [activeFileId]: {
                  ...prev[activeFileId],
                  contents: nextCode,
                  isDirty: true,
                },
              }));
            }}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>
      </main>
    </div>
  );
}

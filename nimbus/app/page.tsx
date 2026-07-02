"use client";

import { useState } from "react";
import Link from "next/link";
// Refactor note:
// The old sidebar JSX that lived directly in this file moved to ExplorerPanel.
// The old Monaco editor wrapper JSX moved to EditorArea.
// The shared workspace shapes that used to be local types in this file moved to
// types/workspace.ts, so page.tsx no longer owns TreeNode, FileMap, or OpenTab.
import { EditorArea } from "@/components/EditorArea";
import { ExplorerPanel } from "@/components/ExplorerPanel";
import { TabBar } from "@/components/TabBar";
import { useFileManager } from "@/components/hooks/useFileManager";
// Refactor note:
// The old page-level tab state and file tree handlers moved to useOpenTabs.
// The old page-level FileMap, file loading, file saving, and treeToMap usage
// moved to useWorkspaceFiles, lib/workspaceApi.ts, and lib/treeToMap.ts.
// The old useEffect that fetched /workspace/tree moved to useWorkspaceTree.
import { useOpenTabs } from "@/components/hooks/useOpenTabs";
import { useWorkspaceFiles } from "@/components/hooks/useWorkspaceFiles";
import { useWorkspaceTree } from "@/components/hooks/useWorkspaceTree";

export default function App() {
  const {
    code,
    setCode,          // call this in Editor onChange; it marks buffer dirty
    isDirty,
    setIsDirty,
    language,         // inferred from file extension on open/save-as
    isVirtualFile,
    openFile,
    openVirtualFile,
    saveFile,
    saveFileAs,
    fileInputProps,   // spread onto a hidden <input> for non-Chromium fallback
  } = useFileManager({
    initialCode: "",
    initialLanguage: "unknown",
    initialName: "",
  });

  const [theme] = useState("vs-dark");

  // This replaces the old local `files`, `setFiles`, `activeFilePath`, and
  // `LoadFileHelper` code that used to live in page.tsx. That behavior now
  // lives in components/hooks/useWorkspaceFiles.ts.
  //
  // useWorkspaceFiles keeps the editor's in-memory cache for backend-loaded
  // files, preserves unsaved edits, and exposes save/load helpers for tabs.
  const workspaceFiles = useWorkspaceFiles({
    openVirtualFile,
    setIsDirty,
  });

  // This replaces the old local `openFiles`, `activeFileId`,
  // `handleSelectFile`, `handleOpenFile`, and `handleSelectTab` code. The tab
  // behavior now lives in components/hooks/useOpenTabs.ts.
  //
  // Open tabs are separate from file contents. A tab only says "this file is
  // visible in the tab strip"; workspaceFiles owns what the editor should show.
  const tabs = useOpenTabs({
    loadFile: workspaceFiles.loadWorkspaceFile,
  });

  // This replaces the old useEffect in page.tsx that fetched
  // http://127.0.0.1:4000/workspace/tree directly. The fetch lifecycle now
  // lives in components/hooks/useWorkspaceTree.ts, and the raw fetch helper
  // lives in lib/workspaceApi.ts.
  //
  // After the tree loads, useWorkspaceFiles seeds the cache with lightweight
  // entries so dirty-state lookups are safe before full file contents load.
  const workspaceTree = useWorkspaceTree({
    onTreeLoaded: workspaceFiles.seedFilesFromTree,
  });

  // This combines the old tree error and file error display paths into one
  // value for ExplorerPanel. Tree errors come from useWorkspaceTree; file
  // load/save errors come from useWorkspaceFiles.
  const activeError = workspaceTree.treeError ?? workspaceFiles.fileError;

  // This replaces the old inline backend save fetch in page.tsx. Backend file
  // saves now go through useWorkspaceFiles -> lib/workspaceApi.ts. Local browser
  // files still use saveFile from useFileManager.
  const handleSave = async () => {
    if (!tabs.activeFileId) {
      return;
    }

    if (isVirtualFile) {
      await workspaceFiles.saveActiveWorkspaceFile(tabs.activeFileId, code);
      return;
    }

    await saveFile();
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* The old inline <aside> sidebar moved to components/ExplorerPanel.tsx. */}
      <ExplorerPanel
        nodes={workspaceTree.workspaceTree}
        activePath={workspaceFiles.activeFilePath}
        isLoading={workspaceTree.isTreeLoading}
        error={activeError}
        onSelectFile={tabs.selectFile}
        onOpenFile={tabs.openFile}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* This header stayed in page.tsx because it coordinates page actions. */}
        <header className="p-3 border-b flex items-center gap-2">
          <span className="font-semibold">VS Lite - Editor</span>

          <div className="ml-auto flex items-center gap-2">
            <button className="px-3 py-1 border rounded" onClick={openFile}>
              Open
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={handleSave}
              disabled={!tabs.hasActiveFile || !isDirty}
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

          {/* Hidden input used by useFileManager as a fallback for file opening. */}
          <input {...fileInputProps} suppressHydrationWarning />
        </header>

        {/* TabBar stayed presentational; tab state and selection behavior moved
            to components/hooks/useOpenTabs.ts. Dirty state comes from the
            workspace file cache in components/hooks/useWorkspaceFiles.ts. */}
        <TabBar
          files={tabs.openFiles.map((tab) => ({
            ...tab,
            isDirty: workspaceFiles.files[tab.id]?.isDirty ?? false,
          }))}
          activeFileId={tabs.activeFileId}
          onSelectFile={tabs.selectTab}
        />

        {/* The old inline <Editor> block moved to components/EditorArea.tsx.
            page.tsx still passes the current editor state and keeps the cache
            updated when Monaco changes. */}
        <EditorArea
          code={code}
          language={language}
          theme={theme}
          hasActiveFile={tabs.hasActiveFile}
          onChange={(value) => {
            if (!tabs.activeFileId) {
              return;
            }

            // Keep Monaco and the workspace cache in sync so switching away
            // from this tab and back restores the user's unsaved edits.
            const nextCode = value ?? "";
            setCode(nextCode);
            workspaceFiles.updateActiveFileContents(tabs.activeFileId, nextCode);
          }}
        />
      </main>
    </div>
  );
}

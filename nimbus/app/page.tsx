"use client";

import { useState } from "react";
import Link from "next/link";
import { EditorArea } from "@/components/EditorArea";
import { ExplorerPanel } from "@/components/ExplorerPanel";
import { TabBar } from "@/components/TabBar";
import { useFileManager } from "@/components/hooks/useFileManager";
import { useOpenTabs } from "@/components/hooks/useOpenTabs";
import { useWorkspaceFiles } from "@/components/hooks/useWorkspaceFiles";
import { useWorkspaceTree } from "@/components/hooks/useWorkspaceTree";
import { ConfirmCloseTabDialog } from "@/components/ConfirmCloseTabDialog";
import { Modal } from "@/components/Modal";
import { moveWorkspaceNode } from "@/lib/workspaceApi";

export default function App() {
  // useFileManager owns the currently displayed editor buffer and the browser
  // file actions. It tracks the code text, dirty state, detected language, and
  // the hidden input used when the File System Access API is not available.
  const {
    code,
    setCode,
    isDirty,
    setIsDirty,
    language,
    isVirtualFile,
    openFile,
    openVirtualFile,
    saveFile,
    saveFileAs,
    fileInputProps,
    clearFile,
  } = useFileManager({
    initialCode: "",
    initialLanguage: "unknown",
    initialName: "",
  });

  // pendingCloseFile is set when the user attempts to close a tab with unsaved changes.
  // It is cleared when the user saves, discards, or cancels the close action.
  const [pendingCloseFile, setPendingCloseFile] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Monaco receives the theme name as a string. Keeping it in state makes it
  // easy to add a theme switcher later without changing the editor component.
  const [theme] = useState("vs-dark");

  // useWorkspaceFiles manages backend workspace files after they are selected.
  // It caches file contents by path, remembers which file is active in the
  // explorer, preserves unsaved edits between tab switches, and exposes helpers
  // for loading, editing, and saving workspace files.
  const workspaceFiles = useWorkspaceFiles({
    openVirtualFile,
    setIsDirty,
  });

  // useOpenTabs manages the tab strip state. It decides which files are visible
  // as tabs, which tab is active, and how single-click preview tabs differ from
  // double-click opened tabs. When a tab needs content, it asks workspaceFiles
  // to load that file into the editor.
  const tabs = useOpenTabs({
    loadFile: workspaceFiles.loadWorkspaceFile,
    clearFile: () => {
      workspaceFiles.clearActiveFile();
      clearFile();
    },
  });

  // useWorkspaceTree loads the explorer tree from the backend. Once the tree is
  // available, the file cache is seeded with lightweight file entries so the UI
  // can safely look up names and dirty state before full contents are fetched.
  const workspaceTree = useWorkspaceTree({
    onTreeLoaded: workspaceFiles.seedFilesFromTree,
  });

  // Save only runs when a tab is active. Workspace files are saved through the
  // backend API, while browser-opened files still use useFileManager's saveFile.
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

  // When a tab is closed, check if the file has unsaved changes. If it does, show
  // the confirmation dialog. If not, close the tab immediately.
  const handleRequestCloseTab = (id: string) => {
    const file = tabs.openFiles.find((tab) => tab.id === id);
    const isFileDirty = workspaceFiles.files[id]?.isDirty ?? false;

    if (file && isFileDirty) {
      setPendingCloseFile({
        id,
        name: file.name,
      });
      return;
    }

    tabs.closeTab(id);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ExplorerPanel renders the left sidebar, including loading/error states
          and the clickable workspace file tree. */}
      <ExplorerPanel
        nodes={workspaceTree.workspaceTree}
        activePath={workspaceFiles.activeFilePath}
        isLoading={workspaceTree.isTreeLoading}
        error={workspaceTree.treeError}
        onSelectFile={tabs.selectFile}
        onOpenFile={tabs.openFile}
        onMoveNode={async (sourcePath, targetFolderPath) => {
          try {
            await moveWorkspaceNode(sourcePath, targetFolderPath);
            await workspaceTree.reloadWorkspaceTree();
          } catch (error) {
            workspaceTree.setTreeError(
              error instanceof Error
                ? error.message
                : "Failed to move file or folder",
            );
          }
        }}
      />

      {/* Modal is used for file errors, which can occur when a file is missing, */}
      <Modal
        isOpen={workspaceFiles.fileError !== null}
        title={workspaceFiles.fileError?.title ?? ""}
        message={workspaceFiles.fileError?.message ?? ""}
        onClose={workspaceFiles.clearFileError}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header actions operate on the current editor state: open a local file,
            save the active file, save a local copy, or navigate to login. */}
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

          {/* Hidden input used by useFileManager as a fallback file picker. */}
          <input {...fileInputProps} suppressHydrationWarning />
        </header>

        {/* TabBar receives display-ready tab data. Dirty state is derived from
            the file cache so each tab can show whether its file has unsaved
            changes without storing the full file contents inside the tab. */}
        <TabBar
          files={tabs.openFiles.map((tab) => ({
            ...tab,
            isDirty: workspaceFiles.files[tab.id]?.isDirty ?? false,
          }))}
          activeFileId={tabs.activeFileId}
          onSelectFile={tabs.selectTab}
          onCloseFile={handleRequestCloseTab}
        />

        {/* EditorArea renders Monaco and disables editing until a file is active.
            Every edit updates both Monaco's live buffer and the workspace file
            cache so switching tabs restores the latest unsaved text. */}
        <EditorArea
          code={code}
          language={language}
          theme={theme}
          hasActiveFile={tabs.hasActiveFile}
          onChange={(value, event) => {
            if (event.isFlush) {
              return;
            }

            if (!tabs.activeFileId) {
              return;
            }

            // Keep Monaco and the workspace cache in sync so switching away
            // from this tab and back restores the user's unsaved edits.
            const nextCode = value ?? "";
            setCode(nextCode);
            workspaceFiles.updateActiveFileContents(
              tabs.activeFileId,
              nextCode,
            );
          }}
        />
      </main>

      {/* Confirm Close Tab Dialog */}
      {pendingCloseFile ? (
        <ConfirmCloseTabDialog
          fileName={pendingCloseFile.name}
          onCancel={() => {
            setPendingCloseFile(null);
          }}
          onDiscard={async () => {
            await workspaceFiles.discardWorkspaceFileChanges(
              pendingCloseFile.id,
            );
            tabs.closeTab(pendingCloseFile.id);
            setPendingCloseFile(null);
          }}
          onSave={async () => {
            await workspaceFiles.saveWorkspaceFileByPath(pendingCloseFile.id);

            tabs.closeTab(pendingCloseFile.id);
            setPendingCloseFile(null);
          }}
        />
      ) : null}
    </div>
  );
}

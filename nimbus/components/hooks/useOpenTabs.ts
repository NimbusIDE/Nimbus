import { useCallback, useRef, useState } from "react";
import type { OpenTab, TreeNode } from "@/types/workspace";

type UseOpenTabsOptions = {
  loadFile: (path: string) => Promise<boolean>;
  clearFile: () => void;
};

// Owns tab state and the preview-vs-opened behavior.
// FileTree remains a visual component. This hook decides what a single click
// and double click mean for tabs, then delegates file loading to the caller.
export function useOpenTabs({ loadFile, clearFile }: UseOpenTabsOptions) {
  const [openFiles, setOpenFiles] = useState<OpenTab[]>([]);
  const [activeFileId, setActiveFileId] = useState("");
  const hasActiveFile = Boolean(activeFileId);

  // Paths that have successfully loaded at least once. A real double click
  // always fires a native click *and* dblclick, so selectFile and openFile
  // can end up racing to load the same path. Tracking confirmed loads lets a
  // failed load roll back by filtering the path out of the tab list, which
  // is safe to apply from either call in any order, instead of restoring a
  // stale full snapshot that could resurrect a tab the other call already
  // removed.
  const loadedPathsRef = useRef(new Set<string>());

  // Roll back a failed load: drop the tab entirely if the path never
  // actually succeeded before, otherwise just stop treating it as active.
  const rollBackFailedLoad = useCallback(
    (path: string, previousActiveFileId: string) => {
      if (!loadedPathsRef.current.has(path)) {
        setOpenFiles((tabs) => tabs.filter((tab) => tab.id !== path));
      }

      setActiveFileId((current) =>
        current === path ? previousActiveFileId : current,
      );
    },
    [],
  );

  // Select a file. This is used when clicking on an already-open tab.
  //
  // The tab/active-file switch happens optimistically, but if loadFile fails
  // (e.g. the file was deleted), we roll back to whatever was open before so
  // a failed load never leaves a broken tab active or clears editor content.
  const selectFile = useCallback(
    async (node: TreeNode, path: string) => {
      const previousActiveFileId = activeFileId;
      const nextTab: OpenTab = {
        id: path,
        name: node.name,
        isPreview: true,
      };

      setOpenFiles((tabs) => {
        const alreadyOpen = tabs.some((tab) => tab.id === path);

        if (alreadyOpen) {
          return tabs;
        }

        const activeTab = tabs.find((tab) => tab.id === activeFileId);

        if (activeTab?.isPreview) {
          return tabs.map((tab) => (tab.id === activeFileId ? nextTab : tab));
        }

        return [...tabs, nextTab];
      });

      setActiveFileId(path);

      const success = await loadFile(path);
      if (success) {
        loadedPathsRef.current.add(path);
      } else {
        rollBackFailedLoad(path, previousActiveFileId);
      }
    },
    [activeFileId, loadFile, rollBackFailedLoad],
  );

  // Open a file in a new tab. This is used when double-clicking a file in the
  // tree. Same rollback behavior as selectFile if loadFile fails.
  const openFile = useCallback(
    async (node: TreeNode, path: string) => {
      const previousActiveFileId = activeFileId;
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

      setActiveFileId(path);

      const success = await loadFile(path);
      if (success) {
        loadedPathsRef.current.add(path);
      } else {
        rollBackFailedLoad(path, previousActiveFileId);
      }
    },
    [activeFileId, loadFile, rollBackFailedLoad],
  );

  // Select a tab. This is used when clicking on an already-open tab. Only the
  // active id needs to roll back here since the tab list itself doesn't change.
  const selectTab = useCallback(
    async (id: string) => {
      const previousActiveFileId = activeFileId;
      setActiveFileId(id);

      const success = await loadFile(id);
      if (success) {
        loadedPathsRef.current.add(id);
      } else {
        setActiveFileId(previousActiveFileId);
      }
    },
    [activeFileId, loadFile],
  );

  // Close a tab. If the closed tab is active, select the next tab in the list.
  const closeTab = useCallback(
    (id: string) => {
      setOpenFiles((tabs) => {
        const closingIndex = tabs.findIndex((tab) => tab.id === id);

        if (closingIndex === -1) {
          return tabs;
        }

        // Forget that this path previously loaded successfully so that if it
        // gets reopened later (e.g. the file was deleted in the meantime) a
        // failed load removes the tab again instead of assuming it's fine.
        loadedPathsRef.current.delete(id);

        const nextTabs = tabs.filter((tab) => tab.id !== id);

        if (id !== activeFileId) {
          return nextTabs;
        }

        const nextActiveTab = tabs[closingIndex + 1] ?? tabs[closingIndex - 1];

        if (!nextActiveTab) {
          setActiveFileId("");
          clearFile();
          return nextTabs;
        }

        setActiveFileId(nextActiveTab.id);
        void loadFile(nextActiveTab.id);

        return nextTabs;
      });
    },
    [activeFileId, clearFile, loadFile],
  );

  return {
    openFiles,
    activeFileId,
    hasActiveFile,
    selectFile,
    openFile,
    selectTab,
    closeTab,
  };
}

import { useCallback, useState } from "react";
import type { OpenTab, TreeNode } from "@/types/workspace";

type UseOpenTabsOptions = {
  loadFile: (path: string) => void | Promise<void>;
  clearFile: () => void;
};

// Owns tab state and the preview-vs-opened behavior.
// FileTree remains a visual component. This hook decides what a single click
// and double click mean for tabs, then delegates file loading to the caller.
export function useOpenTabs({ loadFile, clearFile }: UseOpenTabsOptions) {
  const [openFiles, setOpenFiles] = useState<OpenTab[]>([]);
  const [activeFileId, setActiveFileId] = useState("");
  const hasActiveFile = Boolean(activeFileId);

  // Select a file. This is used when clicking on an already-open tab.
  const selectFile = useCallback((node: TreeNode, path: string) => {
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
    void loadFile(path);
  }, [activeFileId, loadFile]);

  // Open a file in a new tab. This is used when double-clicking a file in the tree.
  const openFile = useCallback((node: TreeNode, path: string) => {
    const nextTab: OpenTab = {
      id: path,
      name: node.name,
      isPreview: false,
    };

    setOpenFiles((tabs) => {
      const alreadyOpen = tabs.some((tab) => tab.id === path);

      if (alreadyOpen) {
        return tabs.map((tab) =>
          tab.id === path ? { ...tab, isPreview: false } : tab
        );
      }

      return [...tabs, nextTab];
    });

    setActiveFileId(path);
    void loadFile(path);
  }, [loadFile]);

  // Select a tab. This is used when clicking on an already-open tab.
  const selectTab = useCallback((id: string) => {
    setActiveFileId(id);
    void loadFile(id);
  }, [loadFile]);

  // Close a tab. If the closed tab is active, select the next tab in the list.
  const closeTab = useCallback(
    (id: string) => {
      setOpenFiles((tabs) => {
        const closingIndex = tabs.findIndex((tab) => tab.id === id);

        if (closingIndex === -1) {
          return tabs;
        }

        const nextTabs = tabs.filter((tab) => tab.id !== id);

        if (id !== activeFileId) {
          return nextTabs;
        }

        const nextActiveTab =
          tabs[closingIndex + 1] ?? tabs[closingIndex - 1];

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
    [activeFileId, clearFile, loadFile]
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

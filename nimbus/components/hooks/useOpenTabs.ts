import { useCallback, useState } from "react";
import type { OpenTab, TreeNode } from "@/types/workspace";

type UseOpenTabsOptions = {
  loadFile: (path: string) => void | Promise<void>;
};

// Owns tab state and the preview-vs-opened behavior.
//
// FileTree remains a visual component. This hook decides what a single click
// and double click mean for tabs, then delegates file loading to the caller.
export function useOpenTabs({ loadFile }: UseOpenTabsOptions) {
  const [openFiles, setOpenFiles] = useState<OpenTab[]>([]);
  const [activeFileId, setActiveFileId] = useState("");
  const hasActiveFile = Boolean(activeFileId);

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

  const selectTab = useCallback((id: string) => {
    setActiveFileId(id);
    void loadFile(id);
  }, [loadFile]);

  return {
    openFiles,
    activeFileId,
    hasActiveFile,
    selectFile,
    openFile,
    selectTab,
  };
}

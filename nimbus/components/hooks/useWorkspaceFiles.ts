import { useCallback, useState } from "react";
import { fetchWorkspaceFile, saveWorkspaceFile } from "@/lib/workspaceApi";
import { treeToMap } from "@/lib/treeToMap";
import type { FileMap, TreeNode } from "@/types/workspace";
import type { VirtualFile } from "@/components/hooks/useFileManager/fileManager.type";

type UseWorkspaceFilesOptions = {
  openVirtualFile: (file: VirtualFile, isDirty?: boolean) => void;
  setIsDirty: (isDirty: boolean) => void;
};

// Owns the editor's backend-workspace file cache.
//
// The backend tree tells us what files exist, but file contents are fetched one
// file at a time. This hook keeps those loaded contents and dirty flags in a
// FileMap so tab switches can restore unsaved edits.
export function useWorkspaceFiles({
  openVirtualFile,
  setIsDirty,
}: UseWorkspaceFilesOptions) {
  const [files, setFiles] = useState<FileMap>(() => ({}));
  const [activeFilePath, setActiveFilePath] = useState<string>();
  const [fileError, setFileError] = useState<string | null>(null);

  const seedFilesFromTree = useCallback((nodes: TreeNode[]) => {
    setFiles((currentFiles) => ({
      ...currentFiles,
      ...treeToMap(nodes),
    }));
  }, []);

  const loadWorkspaceFile = useCallback(
    async (path: string) => {
      try {
        setFileError(null);

        const cachedFile = files[path];

        // If the file is already loaded, use the in-memory version. This keeps
        // unsaved edits intact and avoids a backend refetch on every tab switch.
        if (cachedFile?.isLoaded) {
          setActiveFilePath(path);
          openVirtualFile(
            {
              name: cachedFile.name,
              contents: cachedFile.contents,
            },
            cachedFile.isDirty
          );
          return;
        }

        const data = await fetchWorkspaceFile(path);
        const isDirty = cachedFile?.isDirty ?? false;
        const contents = isDirty ? cachedFile.contents : data.content;

        setFiles((currentFiles) => ({
          ...currentFiles,
          [path]: {
            name: data.name,
            contents,
            isDirty,
            isLoaded: true,
          },
        }));

        setActiveFilePath(path);
        openVirtualFile(
          {
            name: data.name,
            contents,
          },
          isDirty
        );
      } catch (error) {
        setFileError(
          error instanceof Error ? error.message : "Failed to load file contents"
        );
      }
    },
    [files, openVirtualFile]
  );

  const updateActiveFileContents = useCallback((path: string, contents: string) => {
    setFiles((currentFiles) => ({
      ...currentFiles,
      [path]: {
        name: currentFiles[path]?.name ?? path.split("/").pop() ?? path,
        contents,
        isDirty: true,
        isLoaded: true,
      },
    }));
  }, []);

  const saveActiveWorkspaceFile = useCallback(
    async (path: string, contents: string) => {
      try {
        setFileError(null);
        await saveWorkspaceFile(path, contents);

        setFiles((currentFiles) => ({
          ...currentFiles,
          [path]: {
            name: currentFiles[path]?.name ?? path.split("/").pop() ?? path,
            contents,
            isDirty: false,
            isLoaded: true,
          },
        }));

        setIsDirty(false);
      } catch (error) {
        setFileError(error instanceof Error ? error.message : "Failed to save file");
      }
    },
    [setIsDirty]
  );

  return {
    files,
    activeFilePath,
    fileError,
    seedFilesFromTree,
    loadWorkspaceFile,
    updateActiveFileContents,
    saveActiveWorkspaceFile,
  };
}

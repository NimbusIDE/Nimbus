import { useCallback, useState } from "react";
import {
  fetchWorkspaceFile,
  saveWorkspaceFile,
  FileNotFoundError,
} from "@/lib/workspaceApi";
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

  type FileError = {
    title: string;
    message: string;
  };
  const [fileError, setFileError] = useState<FileError | null>(null);

  const seedFilesFromTree = useCallback((nodes: TreeNode[]) => {
    setFiles((currentFiles) => ({
      ...currentFiles,
      ...treeToMap(nodes),
    }));
  }, []);

  const clearFileError = useCallback(() => setFileError(null), []);

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
            cachedFile.isDirty,
          );
          return true;
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
          isDirty,
        );
        return true;
      } catch (error) {
        if (error instanceof FileNotFoundError) {
          setFileError({
            title: "File Not Found",
            message: `The file at path "${path}" could not be found.`,
          });
          return false;
        } else {
          setFileError({
            title: "Error Loading File",
            message:
              error instanceof Error
                ? error.message
                : "An unknown error occurred.",
          });
          return false;
        }
      }
    },
    [files, openVirtualFile],
  );

  const updateActiveFileContents = useCallback(
    (path: string, contents: string) => {
      setFiles((currentFiles) => ({
        ...currentFiles,
        [path]: {
          name: currentFiles[path]?.name ?? path.split("/").pop() ?? path,
          contents,
          isDirty: true,
          isLoaded: true,
        },
      }));
    },
    [],
  );

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

        if (path === activeFilePath) {
          setIsDirty(false);
        }
      } catch (error) {
        setFileError({
          title: "Error Saving File",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        });
      }
    },
    [activeFilePath, setIsDirty],
  );

  // Saves a file by path, using the cached contents. This is useful for saving
  // files that are not currently active in the editor, such as when the user
  // clicks "Save All" or closes a tab with unsaved changes.
  const saveWorkspaceFileByPath = useCallback(
    async (path: string) => {
      const file = files[path];

      if (!file?.isLoaded) {
        throw new Error("Cannot save a file before it has been loaded");
      }

      await saveActiveWorkspaceFile(path, file.contents);
    },
    [files, saveActiveWorkspaceFile],
  );

  // Discards unsaved changes to a file by path, resetting its contents to an
  // empty string and marking it as not dirty. If the discarded file is currently active,
  // the editor's dirty state is also reset.
  const discardWorkspaceFileChanges = useCallback(
    (path: string) => {
      setFiles((currentFiles) => {
        const currentFile = currentFiles[path];

        if (!currentFile) {
          return currentFiles;
        }

        return {
          ...currentFiles,
          [path]: {
            ...currentFile,
            contents: "",
            isDirty: false,
            isLoaded: false,
          },
        };
      });

      if (path === activeFilePath) {
        setIsDirty(false);
      }
    },
    [activeFilePath, setIsDirty],
  );

  // Clear the active file and reset the state to a new virtual file
  const clearActiveFile = useCallback(() => {
    setActiveFilePath(undefined);
    setFileError(null);
  }, []);

  return {
    files,
    activeFilePath,
    fileError,
    seedFilesFromTree,
    loadWorkspaceFile,
    updateActiveFileContents,
    saveActiveWorkspaceFile,
    saveWorkspaceFileByPath,
    discardWorkspaceFileChanges,
    clearActiveFile,
    clearFileError,
  };
}

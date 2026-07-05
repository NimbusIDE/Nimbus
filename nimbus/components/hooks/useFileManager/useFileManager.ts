import React, {
  useCallback,
  useState,
  useRef,
  useMemo,
  useEffect,
} from "react";
import type {
  FileManagerAPI,
  FileManagerOptions,
  VirtualFile,
} from "./fileManager.type";
import { FILE_EXTENSIONS, PICKER_TYPES, defaultExt } from "./fileManager.const";
import { inferLanguageFromName, downloadBlob } from "./fileManager.utils";
import { Language } from "./fileManager.language";

type FilePickerWindow = Window &
  typeof globalThis & {
    showOpenFilePicker: (options: {
      types: typeof PICKER_TYPES;
      excludeAcceptAllOptions: boolean;
      multiple: false;
    }) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker: (options: {
      suggestedName: string;
      types: typeof PICKER_TYPES;
    }) => Promise<FileSystemFileHandle>;
  };

export function useFileManager(opts: FileManagerOptions = {}): FileManagerAPI {
  // Default when creating new file
  const {
    initialCode = "def helloWorld():\n  return 'Hello World'\n",
    initialLanguage = "python",
    initialName = "temp.py",
  } = opts;

  const [code, setCodeState] = useState<string>(initialCode); // current code content
  const [isDirty, setIsDirty] = useState<boolean>(false); // is changed since last open/save
  const [fileName, setFileName] = useState<string>(initialName); // current file name (for save as and fallback download)
  const [language, setLanguage] = useState<Language>(initialLanguage); // inferred from file extension, used for syntax highlighting and default save as name
  // Distinguishes placeholder/in-memory buffers (true) from files backed by a
  // real File System Access API handle (false). Determines the Save behavior
  // in the UI: virtual files clear dirty in memory; real files write to disk.
  const [isVirtualFile, setIsVirtualFile] = useState<boolean>(true);

  /** Handle to the file picked via FS Access API; null = fallback or unsaved buffer */
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  /** Hidden input for non-Chromium fallback open */
  const hiddenFileInputRef = useRef<HTMLInputElement>(null!);

  const supportsFileSystemAccess = useMemo(
    () => typeof window != "undefined" && "showOpenFilePicker" in window,
    [],
  );

  // save code
  const setCode = useCallback((newCode: string) => {
    setCodeState(newCode);
    setIsDirty(true);
  }, []);

  type FileHandleWithPermission = FileSystemFileHandle & {
    requestPermission?: (options?: {
      mode?: "read" | "readwrite";
    }) => Promise<"granted" | "denied" | "prompt">;
  };

  // write to file via FS Access API, with permission handling
  const writeToFileHandle = useCallback(
    async (handle: FileSystemFileHandle, contents: string) => {
      const permission = await (
        handle as FileHandleWithPermission
      ).requestPermission?.({ mode: "readwrite" });

      if (permission === "denied") {
        throw new Error("Permission to write was denied");
      }

      const writable = await handle.createWritable();
      await writable.write(contents);
      await writable.close();
    },
    [],
  );

  const openFile = useCallback(async () => {
    try {
      if (supportsFileSystemAccess) {
        const pickerWindow = window as FilePickerWindow;
        const [handle] = await pickerWindow.showOpenFilePicker({
          types: PICKER_TYPES,
          excludeAcceptAllOptions: false,
          multiple: false,
        });
        const file = await handle.getFile();
        const text = await file.text();

        fileHandleRef.current = handle; // Remember where we open the file from
        setFileName(file.name);
        setCodeState(text);
        setIsDirty(false);
        setLanguage(inferLanguageFromName(file.name));
        setIsVirtualFile(false);
        return;
      }

      // Fallback path (Safari/Firefox): trigger hidden <input type="file">
      hiddenFileInputRef.current?.click();
    } catch (e) {
      console.error("openFile error", e);
    }
  }, [supportsFileSystemAccess]);

  const onHiddenFilePicked = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;

      const reader = new FileReader();
      reader.onload = () => {
        setCodeState(String(reader.result ?? ""));
        setFileName(f.name);
        setIsDirty(false);
        setLanguage(inferLanguageFromName(f.name));
        setIsVirtualFile(false);
      };
      reader.readAsText(f);

      e.target.value = "";
      fileHandleRef.current = null;
    },
    [],
  );

  const openVirtualFile = useCallback((file: VirtualFile, isDirty = false) => {
    // isDirty is optional so callers can restore a file's previous dirty
    // state when switching back to an already-edited tab.
    fileHandleRef.current = null;
    setFileName(file.name);
    setLanguage(inferLanguageFromName(file.name));
    setCodeState(file.contents);
    setIsDirty(isDirty);
    setIsVirtualFile(true);
  }, []);

  const saveFileAs = useCallback(async () => {
    try {
      if (supportsFileSystemAccess) {
        const pickerWindow = window as FilePickerWindow;
        const handle = await pickerWindow.showSaveFilePicker({
          suggestedName: fileName || `untitled${defaultExt(language)}`,
          types: PICKER_TYPES,
        });
        await writeToFileHandle(handle, code);
        fileHandleRef.current = handle;
        const f = await handle.getFile();
        setFileName(f.name);
        setIsDirty(false);
        setIsVirtualFile(false);
      } else {
        downloadBlob(code, fileName || `untitled${defaultExt(language)}`);
        setIsDirty(false);
      }
    } catch (e) {
      console.error("saveFileAs error", e);
    }
  }, [supportsFileSystemAccess, code, fileName, language, writeToFileHandle]);

  const saveFile = useCallback(async () => {
    try {
      if (supportsFileSystemAccess) {
        if (fileHandleRef.current) {
          await writeToFileHandle(fileHandleRef.current, code);
          setIsDirty(false);
        } else {
          await saveFileAs();
        }
      } else {
        downloadBlob(code, fileName || `untitled${defaultExt(language)}`);
        setIsDirty(false);
      }
    } catch (e) {
      console.error("saveFile error", e);
    }
  }, [
    supportsFileSystemAccess,
    code,
    fileName,
    language,
    saveFileAs,
    writeToFileHandle,
  ]);

  // Warn on navigation if there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const fileInputProps = useMemo(
    () => ({
      ref: hiddenFileInputRef,
      type: "file" as const,
      accept: FILE_EXTENSIONS.join(","),
      onChange: onHiddenFilePicked,
      className: "hidden",
    }),
    [onHiddenFilePicked],
  );

  return {
    code,
    setCode,
    isDirty,
    setIsDirty,
    fileName,
    language,
    isVirtualFile,
    openFile,
    openVirtualFile,
    saveFile,
    saveFileAs,
    fileInputProps,
  };
}

// Types for `useFileManager`.
//
// `FileManagerOptions`:
// - Initial values for the editor buffer + file context.
//
// `FileManagerAPI` (hook return):
// - State: current code, filename, language, dirty flag
// - Actions: open / save / save-as
// - Fallback DOM props: hidden <input type="file" /> for browsers without FS Access API

import type { Language } from "./fileManager.language";

export type FileManagerOptions = {
    // Initial editor code (default: "") 
    initialCode?: string;

    // Initial language for Monaco ("unknown" = plain text)
    initialLanguage?: Language;

    //Initial filename shown in the UI (default: "untitled")
    initialName?: string;
}

export type VirtualFile = {
    name: string;
    contents: string;
};

export type FileManagerAPI = {
    //state 
    code: string; // editor buffer(code)
    setCode: (s: string) => void; // update buffer + marks dirty
    isDirty: boolean; // unsaved changes
    setIsDirty: (dirty: boolean) => void; // allows the UI to clear dirty after an in-memory save
    fileName: string; // current file name

    // a supported Language (also the Monaco language id); "unknown" = plain text
    language: NonNullable<FileManagerOptions["initialLanguage"]>; 

    // true for placeholder / in-memory buffers; false for files backed by a real file handle
    isVirtualFile: boolean;

    //actions
    openFile: () => Promise<void>;
    openVirtualFile: (file: VirtualFile, isDirty?: boolean) => void;
    clearFile: () => void;
    saveFile: () => Promise<void>;
    saveFileAs: () => Promise<void>;

    //DOM helpers for exception to backup in case your browser don't support File System Access API
    fileInputProps: {
        ref: React.RefObject<HTMLInputElement>;
        type: "file";
        accept: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        className: string;
    };
}

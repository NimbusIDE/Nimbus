import { Language, LANGUAGE_META } from "./fileManager.language";

// File extension
export const FILE_EXTENSIONS = [
  ".py",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".html",
  ".htm",
  ".css",
  ".md",
  ".markdown",
  ".yaml",
  ".yml",
  ".txt",
] as const;

export const PICKER_TYPES = [
  {
    description: "Code files",
    accept: { "text/plain": FILE_EXTENSIONS },
  },
] as const;

// Default file extensions
export function defaultExt(lang: Language): string {
  return LANGUAGE_META[lang].defaultExt;
}

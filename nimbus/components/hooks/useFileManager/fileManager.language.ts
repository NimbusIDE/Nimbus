// hooks/useFileManager/fileManger.language.ts:
// Define language support + metadata
//
// Scope (current):
// - Nimbus Editor supports a handful of common languages for testing.
//
// IMPORTANT: each `Language` value is passed directly to Monaco as its
// language id (see page.tsx <Editor language={...} />), so every key here
// must be a valid Monaco language id. "unknown" is the lone exception:
// Monaco treats an unregistered id as plain text, which is the fallback we want.
//
// Types:
// - `Language`: supported languages.
//
// Metadata (`LANGUAGE_META`):
// Single source of truth mapping each Language to UI + Monaco config:
// - label: display name shown in the UI
// - icon: path to the language icon asset
// - monacoId: Monaco language id used for syntax highlighting
// - defaultExt: default file extension used for Save As / new files

export type Language =
  | "python"
  | "javascript"
  | "typescript"
  | "json"
  | "html"
  | "css"
  | "markdown"
  | "yaml"
  | "unknown";

export type LanguageMeta = {
  label: string;
  icon: string;
  monacoId: string;
  defaultExt: string;
};

export const LANGUAGE_META: Record<Language, LanguageMeta> = {
  python: {
    label: "Python",
    icon: "/icons/python.svg",
    monacoId: "python",
    defaultExt: ".py",
  },
  javascript: {
    label: "JavaScript",
    icon: "/icons/javascript.svg",
    monacoId: "javascript",
    defaultExt: ".js",
  },
  typescript: {
    label: "TypeScript",
    icon: "/icons/typescript.svg",
    monacoId: "typescript",
    defaultExt: ".ts",
  },
  json: {
    label: "JSON",
    icon: "/icons/json.svg",
    monacoId: "json",
    defaultExt: ".json",
  },
  html: {
    label: "HTML",
    icon: "/icons/html.svg",
    monacoId: "html",
    defaultExt: ".html",
  },
  css: {
    label: "CSS",
    icon: "/icons/css.svg",
    monacoId: "css",
    defaultExt: ".css",
  },
  markdown: {
    label: "Markdown",
    icon: "/icons/markdown.svg",
    monacoId: "markdown",
    defaultExt: ".md",
  },
  yaml: {
    label: "YAML",
    icon: "/icons/yaml.svg",
    monacoId: "yaml",
    defaultExt: ".yaml",
  },
  unknown: {
    label: "Unknown",
    icon: "/icons/unknown.svg",
    monacoId: "plaintext",
    defaultExt: ".txt",
  },
};

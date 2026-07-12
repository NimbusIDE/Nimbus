import Editor, { type OnChange } from "@monaco-editor/react";
import type { Language } from "@/components/hooks/useFileManager/fileManager.language";

type EditorAreaProps = {
  code: string;
  language: Language;
  theme: string;
  hasActiveFile: boolean;
  onChange: OnChange;
};

// Monaco editor presentation plus the "no active file" overlay.
// The parent still owns code state and save behavior. This component only
// controls the visual editor shell and read-only state.
export function EditorArea({
  code,
  language,
  theme,
  hasActiveFile,
  onChange,
}: EditorAreaProps) {
  return (
    <div className="relative flex-1 min-h-0">
      {!hasActiveFile ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-neutral-500 font-bold pointer-events-none">
          Select a file to start editing
        </div>
      ) : null}

      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={code}
        onChange={onChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          readOnly: !hasActiveFile,
        }}
      />
    </div>
  );
}

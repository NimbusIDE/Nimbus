import type { OpenTab } from "@/types/workspace";

// Render-only shape for a tab. It intentionally does not store file contents;
// contents are managed by the parent and loaded into the editor on selection.
export type OpenFileTab = OpenTab & {
  isDirty: boolean;
};

type TabBarProps = {
  files: OpenFileTab[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCloseFile: (id: string) => void;
};

// This is a simple tab bar component that displays open files and their dirty state.
// It also allows switching between files by clicking on the tabs.
export function TabBar({ files, activeFileId, onSelectFile, onCloseFile }: TabBarProps) {

  // Helper to get files with duplicate names
  const duplicatedNames = new Set(
    files
      .filter((file) =>
        files.some((otherFile) =>
          otherFile.id !== file.id && otherFile.name === file.name
        )
      )
      .map((file) => file.name)
  );

  // Helper to get the folder path of a file
  const getFolderPath = (file: OpenFileTab) => {
    if (!file.id.endsWith(file.name)) {
      return file.id;
    }

    return file.id.slice(0, -file.name.length);
  };

  return (
    <div className="flex overflow-x-auto border-b border-neutral-800 bg-neutral-900">
      {/* Map through the files and create a tab for each one */}
      {files.map((file) => {
        const isActive = file.id === activeFileId;

        const showPath = duplicatedNames.has(file.name);
        const folderPath = getFolderPath(file);

        return (
          <div 
            key={file.id}
            onAuxClick={(event) => {
              if (event.button === 1) {
                event.preventDefault();
                onCloseFile(file.id);
              }
            }}
            className={[
              "h-10 shrink-0 text-sm border-r border-neutral-800",
              "flex items-center",
            ].join(" ")}
          >
            <button
              key={file.id}
              type="button"
              onClick={() => onSelectFile(file.id)}
              className={[
                "h-10 shrink-0 px-4 text-sm border-r border-neutral-800",
                "flex items-center gap-1",
                isActive
                  ? "bg-neutral-800 text-white border-b-2 border-b-blue-500"
                  : "bg-neutral-900 text-neutral-400 hover:text-white",
              ].join(" ")}
            >
              <span>{file.name}</span>

              {showPath && folderPath ? (
                <span className="text-xs text-neutral-500">
                  {folderPath}
                </span>
              ) : null}

              {file.isDirty ? <span>•</span> : null}
            </button>
            
            {/* Close button */}
            <button
              type="button"
              aria-label={`Close ${file.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onCloseFile(file.id);
              }}
              className="ml-2 rounded px-1 text-neutral-500 hover:bg-neutral-700 hover:text-white"
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}

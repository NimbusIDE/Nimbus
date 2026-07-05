// Render-only shape for a tab. It intentionally does not store file contents;
// contents are managed by the parent and loaded into the editor on selection.
export type OpenFileTab = {
  id: string;
  name: string;
  isDirty: boolean;
  isPreview: boolean;
};

type TabBarProps = {
  files: OpenFileTab[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
};

// This is a simple tab bar component that displays open files and their dirty state.
// It also allows switching between files by clicking on the tabs.
export function TabBar({ files, activeFileId, onSelectFile }: TabBarProps) {
  // Helper to get files with duplicate names
  const duplicatedNames = new Set(
    files
      .filter((file) =>
        files.some(
          (otherFile) =>
            otherFile.id !== file.id && otherFile.name === file.name,
        ),
      )
      .map((file) => file.name),
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
              <span className="text-xs text-neutral-500">{folderPath}</span>
            ) : null}

            {file.isDirty ? <span>•</span> : null}
          </button>
        );
      })}
    </div>
  );
}

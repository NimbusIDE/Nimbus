// This component is used to confirm if the user wants to save changes before closing a tab.
// It displays a dialog with options to save, discard, or cancel the action.

// This is a prop type definition for the ConfirmCloseTabDialog component.
// It specifies the expected props and their types for this close tab dialog component.
type ConfirmCloseTabDialogProps = {
  fileName: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

// This is the ConfirmCloseTabDialog component definition.
// It takes in props defined by ConfirmCloseTabDialogProps and renders a modal dialog.
export function ConfirmCloseTabDialog({
  fileName,
  onSave,
  onDiscard,
  onCancel,
}: ConfirmCloseTabDialogProps) {
  // The component returns a JSX structure that represents the modal dialog.
  // The dialog is centered on the screen and has a semi-transparent background.
  // It contains a title, a message, and three buttons for user actions.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-dialog-title"
        className="w-[420px] rounded border border-neutral-700 bg-neutral-900 p-5 text-neutral-100 shadow-xl"
      >
        <h2 id="close-dialog-title" className="text-lg font-semibold">
          Save changes to {fileName}?
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Your changes will be lost if you do not save them.
        </p>

        {/*Save, Cancel, and Don't Save buttons section inside the dialog */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onDiscard}
            className="rounded border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
          >
            Don&apos;t Save
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

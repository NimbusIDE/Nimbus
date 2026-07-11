import { X } from "lucide-react";
// Generic for displaying a modal dialog with a title, message, and close button.
// Can be reused for error messages, confirmations, or any other modal content.

type ModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export function Modal({ isOpen, title, message, onClose }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-sm font-semibold text-red-400">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-500 hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-neutral-500 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-2 text-sm text-neutral-300">{message}</p>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-800 bg-neutral-900 text-neutral-100 rounded hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-neutral-500"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

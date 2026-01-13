import { X } from "lucide-react";

interface DeletePostModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeletePostModal({
  onClose,
  onConfirm,
  isDeleting,
}: DeletePostModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black mb-4">Delete Post</h2>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 border text-white border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

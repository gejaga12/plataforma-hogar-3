import { Trash2 } from "lucide-react";
import { LoadingSpinner } from "./loading-spinner";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Eliminación",
  message = "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isLoading = false,
}: ConfirmDeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="text-red-500 dark:text-red-400" size={24} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

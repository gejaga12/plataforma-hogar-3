import { Trash2 } from "lucide-react";
import React from "react";
import { LoadingSpinner } from "../ui/loading-spinner";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roleName: string;
  isLoading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  roleName,
  isLoading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4 justify-center">
          <Trash2 className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">
            Confirmar Eliminación
          </h3>
        </div>

        <p className="text-gray-600 mb-6 text-center">
          ¿Estás seguro de que deseas eliminar <br />
          <strong>{roleName}</strong>? <br />
          Esta acción no se puede deshacer.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

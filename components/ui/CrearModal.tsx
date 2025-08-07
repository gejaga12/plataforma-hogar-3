import React, { useState } from "react";
import { MapPinPlus, X } from "lucide-react";

interface ZonaCrearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nombre: string) => void;
  title: string;
  placeholder?: string;
}

const CrearModal: React.FC<ZonaCrearModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  title,
  placeholder = "Nombre",
}) => {
  const [nombre, setNombre] = useState("");

  const handleCreate = () => {
    const nombreFinal = nombre.trim().toUpperCase();
    if (!nombreFinal) return;
    onCreate(nombreFinal);
    setNombre("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md h-64 max-h-80 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <X />
        </button>

        <div className="p-6 space-y-12">
          <div className="flex items-center space-x-2 mb-4 mt-5">
            <MapPinPlus className="text-red-500 dark:text-red-400" size={24} />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-400">
              {title}
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 uppercase dark:bg-gray-700 dark:focus:border-blue-800"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <button
              onClick={handleCreate}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              disabled={!nombre.trim()}
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearModal;

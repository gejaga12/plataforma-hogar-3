import { MapPinPlus, X } from "lucide-react";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nombre: string, direccion: string) => void;
}

const SucursalHogarModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGuardar = async () => {
    setIsSubmitting(true);
    onSubmit(nombre.trim(), direccion.trim());
    setIsSubmitting(false);
    setNombre("");
    setDireccion("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full dark:bg-gray-900">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPinPlus
                className="text-red-500 dark:text-red-400"
                size={26}
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-400">
                Crear Nueva Sucursal
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-400 mb-1">
                Nombre de la sucursal
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700"
                placeholder="Sucursal Centro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-400 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700"
                placeholder="Av. Siempre Viva 123"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={isSubmitting || !nombre.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creando..." : "Crear Sucursal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SucursalHogarModal;

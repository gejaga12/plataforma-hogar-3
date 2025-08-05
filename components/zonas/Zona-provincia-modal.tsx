import { Provincia, Zona } from "@/utils/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPinCheck, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Props {
  zonas: Zona[];
  isOpen: boolean;
  onClose: () => void;
  zonaId: string | null;
  provincias: Provincia[];
  onSubmit: (zonaId: string, provinciaIds: string[]) => void;
}

const ProvinciaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  zonaId,
  provincias,
  onSubmit,
  zonas,
}) => {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [preAsignadas, setPreAsignadas] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && zonaId) {
      const zonaActual = zonas.find((zona) => zona.id === zonaId);
      if (zonaActual?.provincias) {
        const ids = zonaActual.provincias.map((prov) => prov.id);
        setSeleccionadas(ids);
         setPreAsignadas(ids);
      }
    }
  }, [isOpen, zonaId, zonas]);

  const handleConfirmar = () => {
    if (zonaId && seleccionadas.length > 0) {
      onSubmit(zonaId, seleccionadas);
      setSeleccionadas([]); // limpiar después de enviar
    }
  };

  const handleSeleccionProvincia = (id: string) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <MapPinCheck
                size={26}
                className="text-red-500 dark:text-red-400"
              />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Asignar Provincias a:{" "}
                {zonas.find((zona) => zona.id === zonaId)?.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>

          <label className="block text-sm font-medium text-gray-900 dark:text-gray-400 mb-2">
            Selecciona las provincias:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
            {provincias.length === 0 ? (
              <p className="text-gray-500">No hay provincias disponibles.</p>
            ) : (
              provincias.map((provincia) => {
                const isPreAsignada = preAsignadas.includes(provincia.id);
                const isSeleccionada = seleccionadas.includes(provincia.id);

                return (
                  <label
                    key={provincia.id}
                    className={`flex items-center gap-2 cursor-pointer text-[13px] text-gray-900 dark:text-gray-400 ${
                      isPreAsignada ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={provincia.id}
                      checked={isPreAsignada || isSeleccionada}
                      disabled={isPreAsignada}
                      onChange={() =>
                        !isPreAsignada && handleSeleccionProvincia(provincia.id)
                      }
                      className="accent-blue-600 dark:accent-violet-600"
                    />
                    <span>{provincia.name}</span>
                  </label>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!zonaId || seleccionadas.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvinciaModal;

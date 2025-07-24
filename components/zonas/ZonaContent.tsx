import { MapPinned, Plus } from "lucide-react";
import React from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Zona } from "@/utils/types";
import { CreateZonaData } from "@/app/zonas/page";
import ZonaModals from "./ZonaModals";

interface Props {
  zonas: Zona[]; // array de zonas
  isLoading: boolean;
  modalState: {
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    zona?: Zona;
  };
  setModalState: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      mode: "create" | "edit" | "view";
      zona?: Zona;
    }>
  >;
  toggleMutation: (id: string) => void;
  createZona: (data: CreateZonaData) => void;
}

const ZonaContent: React.FC<Props> = ({
  zonas,
  isLoading,
  modalState,
  setModalState,
  createZona,
  toggleMutation,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando zonas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zonas</h1>
          <p className="text-gray-600 mt-1">Gestiona las zonas del sistema</p>
        </div>

        <button
          onClick={() => setModalState({ isOpen: true, mode: "create" })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Crear Zona</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase tracking-wider">
                  Nombre de la zona
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {zonas.map((zona) => (
                <tr
                  key={zona.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 uppercase">
                    <div className="flex items-center">
                      <MapPinned className="text-orange-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-900">
                        {zona.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
                        <input
                          type="checkbox"
                          checked={zona.active}
                          onChange={() => toggleMutation(zona.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-red-500 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-5"></div>
                      </label>
                      <span
                        className={`text-xs ${
                          zona.active ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {zona.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {zonas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPinned className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No hay zonas</h3>
          </div>
        )}
      </div>

      {/* Modals */}
      <ZonaModals
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: "create" })}
        mode={modalState.mode}
        isloading={isLoading}
        onSubmit={createZona}
      />
    </div>
  );
};

export default ZonaContent;

import { MapPinned, Plus, PlusCircleIcon } from "lucide-react";
import React, { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Pais, Provincia, Zona } from "@/utils/types";
import ZonaModals from "./ZonaModals";
import { CreateRegionDto } from "@/api/apiZonas";
import ProvinciaModal from "./Zona-provincia-modal";

interface Props {
  zonas: Zona[];
  paises: Pais[];
  provincias: Provincia[];
  isLoading: boolean;
  modalState: {
    isOpen: boolean;
    mode: "create";
    zona?: Zona;
  };
  setModalState: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      mode: "create";
      zona?: Zona;
    }>
  >;
  toggleMutation: (id: string) => void;
  createZona: (data: CreateRegionDto) => void;
  createPaisMutation: (name: string) => void;
  createPronvinciaMutation: (name: string) => void;
}

const ZonaContent: React.FC<Props> = ({
  zonas,
  paises,
  provincias,
  isLoading,
  modalState,
  setModalState,
  createZona,
  toggleMutation,
  createPaisMutation,
  createPronvinciaMutation,
}) => {
  const [showModalProvincias, setShowModalProvincias] = useState(false);
  const [selectedZonaId, setSelectedZonaId] = useState<string | null>(null);

  const handleAbrirModalProvincias = (zonaId: string) => {
    setSelectedZonaId(zonaId);
    setShowModalProvincias(true);
  };

  const handleAsignarProvincias = (zonaId: string, provinciaIds: string[]) => {
    console.log("🛰️ Asignando provincias", { zonaId, provinciaIds });
    
    setShowModalProvincias(false);
    setSelectedZonaId(null);
  };

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre de la zona
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pais
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provincias
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y dark:divide-gray-800 divide-gray-200">
              {zonas.map((zona) => (
                <tr
                  key={zona.id}
                  className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 uppercase">
                    <div className="flex items-center">
                      <MapPinned
                        className="text-orange-500 dark:text-orange-400 mr-2"
                        size={16}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-400">
                        {zona.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 uppercase">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-400">
                        {zona.pais?.name || "Sin país asignado"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center justify-center">
                      <button
                        onClick={() => handleAbrirModalProvincias(zona.id)}
                        className="rounded-full text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200"
                        title="Asignar provincias"
                      >
                        <PlusCircleIcon size={16} />
                      </button>
                      <span className="text-sm font-light text-gray-900 dark:text-gray-400 truncate">
                        {zona.provincias
                          ?.map((provincia) => provincia.name)
                          .join(", ") || "Sin provincias asignadas"}
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
                        <div className="w-11 h-6 bg-red-500 rounded-full peer-checked:bg-green-500 transition-colors dark:bg-red-400 dark:peer-checked:bg-green-400"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-5"></div>
                      </label>
                      <span
                        className={`text-xs ${
                          zona.active
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
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
        createPaisMutation={createPaisMutation}
        createPronvinciaMutation={createPronvinciaMutation}
        paises={paises}
        provincias={provincias}
      />

      {showModalProvincias && (
        <ProvinciaModal
          provincias={provincias}
          isOpen={showModalProvincias}
          onClose={() => {
            setShowModalProvincias(false);
            setSelectedZonaId(null);
          }}
          zonaId={selectedZonaId}
          onSubmit={handleAsignarProvincias}
        />
      )}
    </div>
  );
};

export default ZonaContent;

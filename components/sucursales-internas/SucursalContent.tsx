import { SucursalHogar } from "@/utils/types";
import { Building2, Plus, Trash2 } from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useState } from "react";
import SucursalHogarModal from "./SucursalHogarModal";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

interface SucursalProps {
  sucursales: SucursalHogar[];
  isLoadingSucursales: boolean;
  onCrearSucursal: (data: { name: string; address: string }) => void;
  deleteSucursal: (data: string) => void;
}

const SucursalesContent: React.FC<SucursalProps> = ({
  sucursales,
  isLoadingSucursales,
  onCrearSucursal,
  deleteSucursal,
}) => {
  const [modalSucursal, setModalSucursal] = useState({ isOpen: false });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<SucursalHogar | null>(null);

  const handleCrearSucursal = async (nombre: string, direccion: string) => {
    onCrearSucursal({ name: nombre.trim(), address: direccion.trim() });
  };

  const handleConfirmEliminar = () => {
    if (sucursalSeleccionada) {
      deleteSucursal(sucursalSeleccionada.id!);
      setIsDeleteModalOpen(false);
      setSucursalSeleccionada(null);
    }
  };

  if (isLoadingSucursales) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex gap-5 items-center">
            <Building2 size={30} className="text-red-500 hover:text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Gestión de sucursales físicas y puntos de atención
          </p>
        </div>
        <button
          onClick={() => setModalSucursal({ isOpen: true })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Sucursal</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre sucursal
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Direccion
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y dark:divide-gray-800 divide-gray-200">
              {sucursales.map((sucursal) => (
                <tr
                  key={sucursal.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-400">
                    {sucursal.name}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-400">
                    {sucursal.address ?? "Sin direccion"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center items-center gap-3">
                      {/* Aquí podrías colocar tus botones de editar/eliminar si los necesitás */}
                      <button
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          setSucursalSeleccionada(sucursal);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sucursales.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building2 className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              No hay sucursales
            </h3>
          </div>
        )}
      </div>

      <SucursalHogarModal
        isOpen={modalSucursal.isOpen}
        onClose={() => setModalSucursal({ isOpen: false })}
        onSubmit={handleCrearSucursal}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSucursalSeleccionada(null);
        }}
        onConfirm={handleConfirmEliminar}
        title="Eliminar sucursal"
        message={`¿Estás seguro de que deseas eliminar la sucursal "${sucursalSeleccionada?.name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default SucursalesContent;

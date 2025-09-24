import { ZonaService } from "@/utils/api/apiZonas";
import { CrearProvinciaInput } from "@/app/provincias/page";
import { useQuery } from "@tanstack/react-query";
import { Globe, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import CrearModal from "../ui/CrearModal";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

interface ProvinciaContentProps {
  createPronvincia: (data: CrearProvinciaInput) => void;
  deleteProvincia: (id: string) => void;
}

const ProvinciasContent: React.FC<ProvinciaContentProps> = ({
  createPronvincia,
  deleteProvincia,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["provincias"],
    queryFn: () => ZonaService.allInfoZona(),
  });
  const provincias = data?.provincias ?? [];
  const paises = data?.paises ?? [];

  const [modalCreate, setModalCreate] = useState({
    isOpen: false,
    paisId: "",
    regionId: "",
    title: "",
    placeholder: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateClick = (
    paisId: string,
    regionId: string,
    paisName: string
  ) => {
    setModalCreate({
      isOpen: true,
      paisId,
      regionId,
      title: `Crear Provincia en ${paisName}`,
      placeholder: "Ej: Buenos Aires",
    });
  };

  const handleCreateProvincia = (name: string) => {
    createPronvincia({
      name,
      paisId: modalCreate.paisId,
      regionId: modalCreate.regionId,
    });
    setModalCreate({ ...modalCreate, isOpen: false });
  };

  const abrirModalEliminarProvincia = (provincia: any) => {
    setProvinciaSeleccionada(provincia);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProvincia = async () => {
    if (!provinciaSeleccionada) return;

    setIsDeleting(true);
    console.log("Provincia a eliminar:", provinciaSeleccionada);
    try {
      deleteProvincia(provinciaSeleccionada);
    } catch (error) {
      console.error("Error al eliminar provincia:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setProvinciaSeleccionada(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex gap-5 items-center">
            <Globe size={26} className="text-red-500 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-400">
              Provincias
            </h2>
          </div>
          <p className="text-gray-600 mt-1">Lista de provincias por pais</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  País
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provincias
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y dark:divide-gray-800 divide-gray-200">
              {paises.map((pais: any) => {
                const provinciasDelPais = provincias.filter((p: any) =>
                  pais.provincias?.includes(p.id)
                );

                return (
                  <tr key={pais.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 font-semibold">
                      {pais.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {provinciasDelPais.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {provinciasDelPais.map((prov: any) => (
                            <div
                              key={prov.id}
                              className="group relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs overflow-hidden"
                            >
                              {/* Nombre centrado */}
                              <span className="transition-transform duration-200 group-hover:-translate-x-4 text-center w-full z-10 text-gray-900 dark:text-gray-400">
                                {prov.name}
                              </span>

                              {/* Botón eliminar, oculto al principio */}
                              <button
                                onClick={() =>
                                  abrirModalEliminarProvincia(prov.id)
                                }
                                className="absolute top-0 right-0 h-full w-[28px] bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                                title="Eliminar"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-gray-400">
                          Sin provincias
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 mx-auto"
                        onClick={() =>
                          handleCreateClick(pais.id, pais.regionId, pais.name)
                        }
                      >
                        <Plus size={14} /> Agregar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paises.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-4 text-sm text-gray-500"
                  >
                    No se encontraron países ni provincias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CrearModal
        isOpen={modalCreate.isOpen}
        onClose={() => setModalCreate({ ...modalCreate, isOpen: false })}
        onCreate={handleCreateProvincia}
        title={modalCreate.title}
        placeholder={modalCreate.placeholder}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProvincia}
        isLoading={isDeleting}
        title="Eliminar Provincia"
        message={`¿Estás seguro de que deseas eliminar la provincia "${provinciaSeleccionada?.name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ProvinciasContent;

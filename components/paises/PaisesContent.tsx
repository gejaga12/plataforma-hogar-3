import { ZonaService } from "@/api/apiZonas";
import { useQuery } from "@tanstack/react-query";
import { Globe, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import CrearModal from "../ui/CrearModal";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

interface PaisesContentProps {
  createPais: (name: string) => void;
  deletePais: (id: string) => void;
}

const PaisesContent: React.FC<PaisesContentProps> = ({
  createPais,
  deletePais,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["paises"],
    queryFn: () => ZonaService.allInfoZona(),
  });
  const paises = data?.paises ?? [];

  console.log('paises:', paises);

  const [modalCreate, setModalCreate] = useState({
    isOpen: false,
    title: "",
    placeholder: "",
    onCreate: (name: string) => {},
  });
  const [paisSeleccionado, setPaisSeleccionado] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const abrirModalCrear = () => {
    setModalCreate({
      isOpen: true,
      title: "Crear País",
      placeholder: "Argentina",
      onCreate: createPais,
    });
  };

  const abrirModalEliminarPais = (pais: any) => {
    setPaisSeleccionado(pais);
    setIsDeleteModalOpen(true);
  };

  const handleDeletePais = async () => {
    if (!paisSeleccionado) return;

    setIsDeleting(true);
    try {
      console.log('pais a eliminar:', paisSeleccionado );
      deletePais(paisSeleccionado.id); // ✅ función pasada por props
    } catch (error) {
      console.error("Error al eliminar país:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setPaisSeleccionado(null);
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
              Países
            </h2>
          </div>
          <p className="text-gray-600 mt-1">
            Catálogo de países disponibles en el sistema
          </p>
        </div>
        <button
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={abrirModalCrear}
        >
          <Plus size={20} />
          <span>Nuevo País</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre País
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
              {paises.map((pais: any) => {
                return (
                  <tr
                    key={pais.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Nombre país */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">
                      {pais.name}
                    </td>

                    {/* Provincias (podés mostrar cantidad o nombres si tenés) */}
                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                      {pais.provincias?.length}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          className="text-red-500 hover:text-red-600"
                          onClick={() => abrirModalEliminarPais(pais)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
                    No se encontraron países.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CrearModal
        isOpen={modalCreate.isOpen}
        onClose={() => setModalCreate((prev) => ({ ...prev, isOpen: false }))}
        onCreate={modalCreate.onCreate}
        title={modalCreate.title}
        placeholder={modalCreate.placeholder}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePais}
        isLoading={isDeleting}
        title="Eliminar País"
        message={`¿Estás seguro de que deseas eliminar el país "${paisSeleccionado?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default PaisesContent;

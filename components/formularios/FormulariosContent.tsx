import { useState } from "react";
import FormulariosModal from "./FormulariosModal";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  Eye,
  FileCheck,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Task } from "@/utils/types";

type SortField = "code";
type SortDirection = "asc" | "desc";

interface FormulariosContentProps {
  // datos obligatorios para que el componente renderice la tabla
  formularios: Task[];
  isLoadingTasks: boolean;
  // --- OPCIONALES: para integrarte con TaskService desde el padre ---
  onCreateTask?: (payload: Task) => void;
  limit?: number;
  offset?: number;
  setLimit?: React.Dispatch<React.SetStateAction<number>>;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  refetchTasks?: () => void;
}

const FormulariosContent: React.FC<FormulariosContentProps> = ({
  formularios,
  isLoadingTasks,
  limit,
  offset,
  setLimit,
  onNextPage,
  onPrevPage,
  refetchTasks,
  onCreateTask,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormularios, setSelectedFormularios] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    formulario?: Task;
  }>({
    isOpen: false,
    mode: "create",
  });

  const filteredFormularios =
    formularios?.filter((formulario: any) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        formulario.nombre.toLowerCase().includes(searchLower) ||
        formulario.titulo.toLowerCase().includes(searchLower) ||
        formulario.descripcion.toLowerCase().includes(searchLower)
      );
    }) || [];

  const sortedFormularios = [...filteredFormularios].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFormularios(
        sortedFormularios.map((formulario) => formulario.id ?? "")
      );
    } else {
      setSelectedFormularios([]);
    }
  };

  const handleSelectFormulario = (formularioId: string, checked: boolean) => {
    if (checked) {
      setSelectedFormularios((prev) => [...prev, formularioId]);
    } else {
      setSelectedFormularios((prev) =>
        prev.filter((id) => id !== formularioId)
      );
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
    >
      <span>{children}</span>
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ChevronUp size={14} />
        ) : (
          <ChevronDown size={14} />
        ))}
    </button>
  );

  if (isLoadingTasks) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando formularios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Formularios</h1>
          <p className="text-gray-600 mt-1">
            Crea y administra formularios personalizados
          </p>
        </div>

        <button
          onClick={() => setModalState({ isOpen: true, mode: "create" })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Formulario</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar formularios por nombre, título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedFormularios.length === sortedFormularios.length &&
                      sortedFormularios.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="nombre">Nombre</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="titulo">Título</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Express
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compra de materiales
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="modulos"># Módulos incluidos</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFormularios.map((formulario, index) => (
                <tr
                  key={formulario.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selectedFormularios.includes(formulario.id ?? "") &&
                      "bg-orange-50",
                    index % 2 === 1 && "bg-gray-25"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedFormularios.includes(formulario.id)}
                      onChange={(e) =>
                        handleSelectFormulario(formulario.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <FileCheck className="text-orange-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        {formulario.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {formulario.titulo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        formulario.express
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {formulario.express ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        formulario.compraMateriales
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {formulario.compraMateriales ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {formulario.modulos.length}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        módulos
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setModalState({
                            isOpen: true,
                            mode: "view",
                            formulario,
                          })
                        }
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setModalState({
                            isOpen: true,
                            mode: "edit",
                            formulario,
                          })
                        }
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => console.log("clicked")}
                        className="text-red-600 hover:text-red-800 transition-colors"
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

        {sortedFormularios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileCheck className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              No hay formularios
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "No se encontraron formularios con el término de búsqueda."
                : "Comienza creando un nuevo formulario."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedFormularios.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando{" "}
            <span className="font-medium">{sortedFormularios.length}</span>{" "}
            formularios
            {selectedFormularios.length > 0 && (
              <span className="ml-2">
                (
                <span className="font-medium">
                  {selectedFormularios.length}
                </span>{" "}
                seleccionados)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">Página 1 de 1</div>
        </div>
      )}

      {/* Modals */}
      <FormulariosModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: "create" })}
        formulario={modalState.formulario}
        mode={modalState.mode}
      />
    </div>
  );
};

export default FormulariosContent;

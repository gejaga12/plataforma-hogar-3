import React, { useRef, useState } from "react";
import NodeDetailModal from "./NodeDetailModal";
import JobSearchModal from "./JobsSearchModal";
import OrgNode from "./OrgNode";
import {
  Minus,
  Plus,
  RotateCcw,
  Route,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  CrearJerarquiaConUsuario,
  crearJerarquiaData,
  JerarquiaNodo,
  JerarquiaService,
} from "@/api/apiJerarquia";
import { useJerarquia } from "@/hooks/useJerarquia";
import { AddEmployeeModal } from "./add-employee-modal";
import { CrearJerarquiaModal } from "./CrearJerarquiaModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

const OrganigramaContent = () => {
  const queryClient = useQueryClient();

  const { jerarquia, areas, isLoading } = useJerarquia();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<JerarquiaNodo | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showJobSearchModal, setShowJobSearchModal] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [nodoId, setNodoId] = useState<string | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const [modalDeleteType, setModalDeleteType] = useState<
    "nodo" | "asociacion" | null
  >(null);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    userid?: number;
    fullName?: string;
  } | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  //busqueda con filtros
  const filtrarJerarquia = (
    nodos: JerarquiaNodo[],
    areaSeleccionada: string,
    searchTerm: string
  ): JerarquiaNodo[] => {
    const termino = searchTerm.trim().toLowerCase();

    return nodos.reduce<JerarquiaNodo[]>((resultado, nodo) => {
      const subordinadosFiltrados = filtrarJerarquia(
        nodo.subordinados ?? [],
        areaSeleccionada,
        searchTerm
      );

      const perteneceAlArea =
        !areaSeleccionada ||
        nodo.area.toLowerCase() === areaSeleccionada.toLowerCase();

      const coincideConBusqueda =
        !termino ||
        nodo.fullName?.toLowerCase().includes(termino) ||
        nodo.puesto?.some((p) => p.toLowerCase().includes(termino));

      const incluirNodo = perteneceAlArea && coincideConBusqueda;

      if (incluirNodo || subordinadosFiltrados.length > 0) {
        resultado.push({
          ...nodo,
          subordinados: subordinadosFiltrados,
        });
      }

      return resultado;
    }, []);
  };

  const crearJerarquiaMutation = useMutation({
    mutationFn: (data: crearJerarquiaData) => {
      console.log("📦 Enviando nuevo nodo:", data);
      return JerarquiaService.crearJerarquia(data);
    },
    onSuccess: () => {
      toast.success("Nodo creado con exito!");
      queryClient.invalidateQueries({ queryKey: ["jerarquia"] });
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
    onError: (error: any) => {
      console.error("Error al crear jerarquía:", error.message);
    },
  });

  const asociarUsuarioMutation = useMutation({
    mutationFn: ({ orgid, userid }: { orgid: string; userid: number }) =>
      JerarquiaService.asociarUsuarioANodo(orgid, userid),
    onSuccess: () => {
      toast.success("Usuario asignado al nuevo nodo");
      queryClient.invalidateQueries({ queryKey: ["jerarquia"] });
    },
    onError: (error: any) => {
      console.error("Error al asociar usuario:", error?.message);
      toast.error("No se pudo asociar el usuario");
    },
  });

  const eliminarNodo = useMutation({
    mutationFn: (id: string) => {
      return JerarquiaService.removerNodoDeJerarquia(id);
    },
    onSuccess: () => {
      toast.success("Nodo eliminado con exito.");
      queryClient.invalidateQueries({ queryKey: ["jerarquia"] });
    },
    onError: (error: any) => {
      toast.error("Ocurrio un error al eliminar el nodo.");
      console.log("Error:", error.message);
    },
  });

  const eliminarAsociacion = useMutation({
    mutationFn: ({ id, userid }: { id: string; userid: number }) => {
      return JerarquiaService.removerUsuarioDeNodo(userid, id);
    },
    onSuccess: () => {
      toast.success("Se elimino el usuario del nodo con exito.");
      queryClient.invalidateQueries({ queryKey: ["jerarquia"] });
    },
    onError: () => {
      toast.error("Ocurrio un error al eliminar el usuario.");
    },
  });

  const handleReset = () => {
    setSearchTerm("");
    setSelectedArea("");
    setSelectedRole("");
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleClickNodo = (nodo: JerarquiaNodo) => {
    if (nodo.user === true) {
      setSelectedEmployee(nodo);
      setShowNodeModal(true);
    } else {
      setNodoId(nodo.id);
      setShowAddEmployeeModal(true);
    }
  };

  const handleCrearJerarquia = async (data: CrearJerarquiaConUsuario) => {
    try {
      const { parentId, usuarioId, ...rest } = data as any;

      const payload: crearJerarquiaData = {
        ...rest,
        ...(nodoId ? { parent: nodoId } : {}), // incluir parent solo si hay padre
      };

      const response = await crearJerarquiaMutation.mutateAsync(payload);

      if (usuarioId && response?.id) {
        await asociarUsuarioMutation.mutateAsync({
          orgid: response.id,
          userid: usuarioId,
        });
      }

      setShowCrearModal(false);
      setNodoId(undefined);
    } catch (e: any) {
      toast.error(e.message || "Error al crear la jerarquía");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando organigrama...
          </p>
        </div>
      </div>
    );
  }

  const orgData = filtrarJerarquia(jerarquia, selectedArea, searchTerm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <div className="flex gap-2 items-center">
            <Route size={26} className="text-red-600 dark:text-red-500 -rotate-45"/>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Organigrama Empresarial
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualiza la estructura organizacional de la empresa
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <Users size={16} />
              <span> empleados</span>
            </span>
            <span className="flex items-center space-x-1">
              <UserPlus size={16} />
              <span> vacantes</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setShowCrearModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Crear Nodo</span>
          </button>
        </div>
      </div>

      {/* Filtros compactos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          {/* filtro de area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {/* input busqueda */}
          <div className="relative flex gap-5">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />

            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Organigrama */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden relative">
        {/* Controles de Zoom */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Custom Organigrama */}
        <div
          ref={chartContainerRef}
          className="p-8 min-h-[600px] bg-gray-50 dark:bg-gray-900 overflow-auto"
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease",
            }}
          >
            {orgData.length > 0 && (
              <div className="flex justify-center">
                {orgData.map((root) => (
                  <OrgNode
                    key={root.id}
                    node={root}
                    onNodeClick={handleClickNodo}
                    onOpenCrearModal={(parentId) => {
                      setNodoId(parentId);
                      setShowCrearModal(true);
                    }}
                    onSolicitarEliminarNodo={(id) => {
                      setModalDeleteType("nodo");
                      setItemToDelete({ id });
                    }}
                    onSolicitarEliminarAsociacion={(id, userid) => {
                      setModalDeleteType("asociacion");
                      setItemToDelete({ id, userid });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Leyenda
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Empleado
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border-2 border-dashed border-orange-500 dark:border-orange-400 dark:bg-gray-800 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Vacante
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NodeDetailModal
        isOpen={showNodeModal}
        onClose={() => setShowNodeModal(false)}
        employee={selectedEmployee || undefined}
      />

      <AddEmployeeModal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        nodoId={nodoId}
      />

      <JobSearchModal
        isOpen={showJobSearchModal}
        onClose={() => setShowJobSearchModal(false)}
      />

      <CrearJerarquiaModal
        isOpen={showCrearModal}
        onClose={() => {
          setShowCrearModal(false);
          setNodoId(undefined);
        }}
        onSubmit={handleCrearJerarquia}
        areas={areas}
        areasLoading={isLoading}
      />

      <ConfirmDeleteModal
        isOpen={modalDeleteType !== null}
        onClose={() => {
          setModalDeleteType(null);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (!itemToDelete) return;

          if (modalDeleteType === "nodo") {
            eliminarNodo.mutate(itemToDelete.id);
          } else if (modalDeleteType === "asociacion" && itemToDelete.userid) {
            eliminarAsociacion.mutate({
              id: itemToDelete.id,
              userid: itemToDelete.userid,
            });
          }
          setModalDeleteType(null);
          setItemToDelete(null);
        }}
        title={modalDeleteType === "nodo" ? "Eliminar nodo" : "Liberar nodo"}
        message={
          modalDeleteType === "nodo"
            ? "¿Seguro que deseas eliminar este nodo?"
            : "¿Deseas liberar este nodo? El usuario ya no estará asociado a esta posición."
        }
        confirmText={modalDeleteType === "nodo" ? "Eliminar" : "Liberar"}
        cancelText="Cancelar"
      />
    </div>
  );
};

export default OrganigramaContent;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  PlayCircle,
  Plus,
  Search,
  User,
  UserPlus,
  XCircle,
} from "lucide-react";
import { cn } from "@/utils/cn";
import CreateProcesoModal from "./CreateProcesoModal";
import {
  ProcesoIngresoService,
  ProcessPayload,
} from "@/utils/api/apiProcesoIngreso";
import toast from "react-hot-toast";

const IngresosContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: flujosIngreso = [] } = useQuery({
    queryKey: ["flujos-ingresos", "ingreso"],
    queryFn: () => ProcesoIngresoService.listarFlujosType("ingreso"),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: procesosResp, isLoading } = useQuery({
    queryKey: ["procesos-ingreso"],
    queryFn: () => ProcesoIngresoService.listarProcesos("ingreso", 10, 0),
  });

  const procesos: any[] =
    (procesosResp as any)?.procesos ?? (procesosResp as any) ?? [];

  console.log("procesos:", procesos);

  const { mutate: crearProcesoMutate, isPending: creandoProceso } = useMutation(
    {
      mutationFn: ({
        flowId,
        payload,
      }: {
        flowId: string;
        payload: ProcessPayload;
      }) => ProcesoIngresoService.crearProceso(flowId, payload),
      onSuccess: () => {
        toast.success("Proceso creado correctamente");
        queryClient.invalidateQueries({ queryKey: ["procesos-ingreso"] });
        setShowCreateModal(false);
      },
      onError: (e: any) => {
        toast.error(e?.message ?? "Error al crear el proceso");
      },
    }
  );

  const getEstadoConfig = (estado: string) => {
    const configs = {
      iniciado: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        icon: PlayCircle,
      },
      en_progreso: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        icon: Clock,
      },
      completado: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        icon: CheckCircle,
      },
      detenido: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        icon: XCircle,
      },
    };
    return configs[estado as keyof typeof configs] || configs.iniciado;
  };

  const handleViewFlujo = (procesoId: string) => {
    router.push(`/ingresos/${procesoId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando procesos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            👥 Procesos de Induccion
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los procesos de incorporación de nuevo personal
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Ingreso</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por nombre, puesto o área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value="iniciado">Iniciado</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
              <option value="detenido">Detenido</option>
            </select>

            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Procesos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {procesos.map((proceso: any) => {
          // campos del backend
          const d = proceso.data ?? {};
          const f = proceso.flujo ?? {};

          const estado =
            d.estadoGeneral ??
            (proceso.active === false ? "detenido" : "iniciado");
          const estadoConfig = getEstadoConfig(estado);
          const EstadoIcon = estadoConfig.icon;

          // posibles formas de _id en Mongo
          const procesoId: string =
            (proceso?._id &&
              (proceso._id.toString?.() ||
                proceso._id.$oid ||
                `${proceso._id}`)) ||
            proceso?.id ||
            "";

          // contar nodos (excluyendo "end")
          const nodosCount = f.nodes
            ? Object.values(f.nodes).filter((n: any) => n?.type !== "end")
                .length
            : 0;

          return (
            <div
              key={
                procesoId || `${f.code}-${proceso.refCurrentNode || "noRef"}`
              }
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1",
                      estadoConfig.color
                    )}
                    title={proceso.active ? "Activo" : "Inactivo"}
                  >
                    <EstadoIcon size={14} />
                    <span className="capitalize">
                      {estado.replace("_", " ")}
                    </span>
                  </span>

                  {/* tipo de flujo */}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(f.type || "tipo").toUpperCase?.() || "TIPO"}
                  </span>
                </div>

                {/* título: código del flujo */}
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {f.code ?? "(sin código)"}
                </h3>

                {/* usuario / ingresante */}
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Ingresante:{" "}
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {d.usuario ?? "(sin usuario)"}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                    <span>{d.puesto ?? "(sin puesto)"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Building className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                    <span>{d.areaDestino ?? "(sin área)"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                    <span>Inicio: {d.fechaInicio ?? "-"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                    <span>
                      Ingreso estimado: {d.fechaEstimadaIngreso ?? "-"}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                    <span className="px-2 py-0.5 rounded-full border bg-gray-50 dark:bg-gray-900/30">
                      {nodosCount} nodo{nodosCount !== 1 ? "s" : ""}
                    </span>
                    <span
                      className="font-mono truncate"
                      title={`Starter: ${f.StarterNode ?? "-"}`}
                    >
                      Starter: {f.StarterNode ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Creado:{" "}
                    {d.createdAt
                      ? new Date(d.createdAt).toLocaleDateString()
                      : "-"}
                  </div>
                  <button
                    onClick={() => procesoId && handleViewFlujo(procesoId)}
                    disabled={!procesoId}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors",
                      procesoId
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    )}
                    title={procesoId ? "Ver Flujo" : "Sin ID de proceso"}
                  >
                    <Eye size={16} />
                    <span>Ver Flujo</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {procesos.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No hay procesos
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || estadoFilter
              ? "No se encontraron procesos con los filtros aplicados."
              : "Comienza creando un nuevo proceso de ingreso."}
          </p>
        </div>
      )}

      {/* Create Modal */}
      <CreateProcesoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        isLoading={creandoProceso}
        flujos={flujosIngreso} // 👈 para elegir flujo en el modal
        onSubmit={({ flowId, payload }) =>
          crearProcesoMutate({ flowId, payload })
        }
      />
    </div>
  );
};

export default IngresosContent;

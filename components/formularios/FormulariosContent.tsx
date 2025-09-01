import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileCheck,
  Search,
  Plus,
  X,
} from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { PlanTasks } from "@/utils/types";
import FormulariosModal from "./FormulariosModal";
import { useQuery } from "@tanstack/react-query";
import { TaskServices } from "@/api/apiFormularios";

type SortField = "nombre" | "descripcion";
type SortDirection = "asc" | "desc";

interface FormulariosContentProps {
  formularios: PlanTasks[];
  isLoadingPlanTasks: boolean;
  onCreateTask?: (payload: PlanTasks) => void;
  isCreating?: boolean;
}

const FormulariosContent: React.FC<FormulariosContentProps> = ({
  formularios,
  isLoadingPlanTasks,
  onCreateTask,
  isCreating,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("nombre");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const { data: tasks, isLoading: isLoadingtasks } = useQuery({
    queryKey: ["tasks", expandedTaskId],
    queryFn: () => TaskServices.getPlanTaskbyId(expandedTaskId!),
    enabled: !!expandedTaskId,
  });

  // console.log('data task traida:', tasks);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return formularios ?? [];
    return (formularios ?? []).filter((f: any) => {
      const nom = (f?.nombre ?? "").toString().toLowerCase();
      const des = (f?.descripcion ?? "").toString().toLowerCase();
      return nom.includes(q) || des.includes(q);
    });
  }, [formularios, searchTerm]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a: any, b: any) => {
      const av = (a?.[sortField] ?? "").toString().toLowerCase();
      const bv = (b?.[sortField] ?? "").toString().toLowerCase();
      if (av < bv) return sortDirection === "asc" ? -1 : 1;
      if (av > bv) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
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
      type="button"
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      title={`Ordenar por ${field}`}
    >
      <span>{children}</span>
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ChevronUp size={14} />
        ) : (
          <ChevronDown size={14} />
        )
      ) : null}
    </button>
  );

  if (isLoadingPlanTasks) {
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
            Lista de planes (nombre y descripción)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Nuevo
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-xl">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla simple: Nombre / Descripción */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[260px]">
                  <SortButton field="nombre">Nombre</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="descripcion">Descripción</SortButton>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.map((f: any) => (
                <React.Fragment key={f?.id}>
                  <tr
                    className="cursor-pointer hover:bg-orange-50 transition"
                    onClick={() => {
                      setExpandedTaskId(
                        expandedTaskId === f?.id ? null : f?.id
                      );
                    }}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start">
                        <FileCheck
                          className="text-orange-500 mr-2 mt-0.5"
                          size={16}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {f?.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {f?.description ?? "—"}
                      </span>
                    </td>
                  </tr>

                  {/* Subtasks */}
                  {expandedTaskId === f?.id && (
                    <tr>
                      <td colSpan={2} className="bg-gray-50 px-6 py-4">
                        {isLoadingtasks ? (
                          <div className="text-sm text-gray-500">
                            Cargando tareas asociadas...
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(tasks?.tasks ?? []).map((task: any) => (
                              <div
                                key={task.id}
                                className="ml-6 border-l-4 border-orange-500 pl-4 py-2 bg-white shadow-sm rounded-md"
                              >
                                <div className="text-sm font-semibold text-gray-800">
                                  🧩 {task.code}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Prioridad: {task.priority} -- Duración:{" "}
                                  {task.duration.horas}h {task.duration.minutos}
                                  m
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileCheck className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              No hay formularios
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "No se encontraron resultados para tu búsqueda."
                : "Aún no hay formularios cargados."}
            </p>
          </div>
        )}
      </div>

      {/* Modal Crear */}
      <FormulariosModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        onSubmit={(payload) => {
          onCreateTask?.(payload);
          setCreateOpen(false);
        }}
        isSubmitting={isCreating ?? false}
      />
    </div>
  );
};

export default FormulariosContent;

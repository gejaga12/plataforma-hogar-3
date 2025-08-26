import { Task } from "@/utils/types";
import { ChevronDown, ChevronUp, Edit, Eye, Filter, Search, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";

type SortField = "code" | "priority" | "duration";
type SortDirection = "asc" | "desc";
type Subtask = Task["subtasks"][number];

interface TaskBusquedaYTablaProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskBusquedaYTabla: React.FC<TaskBusquedaYTablaProps> = ({
  tasks,
  onView,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredTasks = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return (tasks ?? []).filter((task) => {
      const code = task.code?.toLowerCase?.() ?? "";
      // Si en el futuro agregás "descripcion" a Task, esto ya queda listo:
      const desc = (task as any)?.descripcion?.toLowerCase?.() ?? "";
      return code.includes(q) || desc.includes(q);
    });
  }, [tasks, searchTerm]);

  const sortedTasks = useMemo(() => {
    const arr = [...filteredTasks];
    const getVal = (t: Task, f: SortField) => {
      if (f === "code") return t.code ?? "";
      if (f === "priority") return t.priority ?? "";
      if (f === "duration") return durationToMinutes(t.duration);
      return "";
    };
    arr.sort((a, b) => {
      const av = getVal(a, sortField);
      const bv = getVal(b, sortField);
      if (av < bv) return sortDirection === "asc" ? -1 : 1;
      if (av > bv) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filteredTasks, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
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

  return (
    <>
      {/* Buscador + Orden */}
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
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SortButton field="code">Código</SortButton>
            <SortButton field="priority">Prioridad</SortButton>
            <SortButton field="duration">Duración</SortButton>

            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla estilo lista con encabezados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">
              {searchTerm
                ? "No se encontraron tasks con ese término."
                : "Aún no hay tasks cargadas."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <span>Nombre</span>
              <span>Prioridad</span>
              <span>Tiempo</span>
              <span className="text-right">Acciones</span>
            </div>

            <ul className="divide-y divide-gray-200">
              {sortedTasks.map((task) => {
                const rowId = task.id || task.code;
                const isOpen = expanded.has(rowId!);

                return (
                  <li key={rowId}>
                    {/* Fila principal */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpen}
                      onClick={() => toggleExpand(rowId!)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleExpand(rowId!);
                        }
                      }}
                      className="grid grid-cols-4 gap-4 items-center px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer select-none"
                    >
                      {/* Columna Nombre */}
                      <div className="flex items-start gap-2 min-w-0">
                        <ChevronDown
                          size={18}
                          className={`mt-0.5 shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                        <div className="min-w-0">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            {task.code}
                          </span>
                        </div>
                      </div>

                      {/* Columna Prioridad */}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getPriorityClasses(
                          task.priority
                        )}`}
                      >
                        {capitalize(task.priority ?? "sin dato")}
                      </span>

                      {/* Columna Tiempo */}
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 w-fit">
                        {formatDuration(task.duration)}
                      </span>

                      {/* Columna Acciones */}
                      <div className="flex justify-end items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(task);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                          }}
                          className="text-orange-600 hover:text-orange-800 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Subtasks */}
                    {isOpen && task.subtasks?.length > 0 && (
                      <div className="ml-10 pl-4 pr-4 pb-4 border-l-2 border-gray-200">
                        <ul className="mt-2 space-y-2">
                          {task.subtasks.map((st: Subtask, idx: number) => (
                            <li
                              key={`${rowId}-st-${idx}`}
                              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {st.description}
                              </p>
                              <span className="px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700 shrink-0">
                                {st.group}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
};

export default TaskBusquedaYTabla;


//HELPERS
function capitalize(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// Acepta { horas, minutos }, minutos como number, o string legible
function formatDuration(d: any): string {
  if (!d && d !== 0) return "-";
  if (typeof d === "string") return d;
  if (typeof d === "number") {
    const h = Math.floor(d / 60);
    const m = d % 60;
    return `${h}h ${m}m`;
  }
  const h = Number(d?.horas ?? 0);
  const m = Number(d?.minutos ?? 0);
  return `${h}h ${m}m`;
}

function durationToMinutes(d: any): number {
  if (typeof d === "number") return d;
  if (typeof d === "string") return Number.MAX_SAFE_INTEGER; // para que strings queden al final
  const h = Number(d?.horas ?? 0);
  const m = Number(d?.minutos ?? 0);
  return h * 60 + m;
}

function getPriorityClasses(p: string): string {
  const key = (p ?? "").toLowerCase();
  if (key === "alta")
    return "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200";
  if (key === "media")
    return "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200";
  if (key === "baja")
    return "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  return "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200";
}
// TODO: reemplazar por tu servicio real
async function handleDeleteTask(task: any) {
  const ok = confirm(`¿Eliminar la task ${task?.code ?? ""}?`);
  if (!ok) return;
  // await TaskService.delete(task.id);
  // await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  // (inyectá queryClient vía cierre o mové esta función adentro del componente si preferís)
}
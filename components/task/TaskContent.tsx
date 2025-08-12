import { Task } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";

import TaskBusquedaYTabla from "./TaskBusquedaYTabla";
import TaskCrear from "./TaskCrear";

// Varias tasks para listar y probar orden/filtros
export const MOCK_TASKS: Task[] = [
  {
    id: "tsk_0002",
    code: "HVAC-PR-004",
    priority: "media",
    duration: { horas: 2, minutos: 0 },
    Activator: [
      {
        cadencia: 1,
        repition: 1,
        lastRepitionDay: "2025-07-28T10:00:00Z",
        frecuencia: "month",
        repiter: 1,
        repiterCount: 12,
        fijo: true,
      },
    ],
    subtasks: [
      {
        description: "Limpieza de filtros",
        options: [{ title: "Split muro", depends: [] }],
        group: "HVAC",
        required: true,
        FilesRequired: false,
      },
    ],
    ptId: "9f2cb1b2-5a12-4c73-8b1b-4f8a9c6e3d21",
  },
  {
    id: "tsk_0003",
    code: "SEG-EXT-010",
    priority: "baja",
    duration: { horas: 0, minutos: 40 },
    Activator: [
      {
        cadencia: 2,
        repition: 0,
        lastRepitionDay: "2025-08-05T12:00:00Z",
        frecuencia: "week",
        repiter: 2,
        repiterCount: 6,
        fijo: false,
      },
    ],
    subtasks: [
      {
        description: "Chequeo de matafuegos",
        options: [{ title: "Vencimiento/Presión", depends: [] }],
        group: "Seguridad",
        required: true,
        FilesRequired: true,
      },
    ],
  },
  {
    id: "tsk_0004",
    code: "PLMB-FUG-003",
    priority: "alta",
    duration: { horas: 0, minutos: 55 },
    paro: { horas: 0, minutos: 30 },
    Activator: [
      {
        cadencia: 1,
        repition: 0,
        lastRepitionDay: "2025-08-10T14:30:00Z",
        frecuencia: "day",
        repiter: 1,
        repiterCount: 10,
        fijo: false,
      },
    ],
    subtasks: [
      {
        description: "Detección de fugas",
        options: [{ title: "Prueba de presión", depends: [] }],
        group: "Plomería",
        required: true,
        FilesRequired: false,
      },
    ],
  },
  {
    id: "tsk_0005",
    code: "CCT-LUZ-021",
    priority: "baja",
    duration: { horas: 0, minutos: 20 },
    Activator: [],
    subtasks: [
      {
        description: "Reemplazo de luminaria LED",
        options: [{ title: "12W 4000K", depends: [] }],
        group: "Eléctrico",
        required: false,
        FilesRequired: false,
      },
    ],
  },
];

interface TaskContentProps {}

const TaskContent: React.FC<TaskContentProps> = ({}) => {
  // Estado del modal (layout sólo decide si muestra modal o tabla)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    task?: Task;
  }>({
    isOpen: false,
    mode: "create",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => MOCK_TASKS, // <-- acá van los mocks
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const tasks = data ?? MOCK_TASKS;
  const showingCreateModal = modalState.isOpen && modalState.mode === "create";

  // Acciones que se pasan a la tabla
  const handleView = (task: Task) =>
    setModalState({ isOpen: true, mode: "view", task });
  const handleEdit = (task: Task) =>
    setModalState({ isOpen: true, mode: "edit", task });
  const handleDelete = async (task: Task) => {
    const ok = confirm(`¿Eliminar la task ${task.code}?`);
    if (!ok) return;
    // TODO: integrar con servicio real y/o invalidar query
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando campos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗂️ Tareas</h1>
          <p className="text-gray-600 mt-1">Crea y gestiona las task</p>
        </div>

        {/* Botón que alterna entre "Nueva Task" y "Volver" */}
        {!showingCreateModal ? (
          <button
            onClick={() => setModalState({ isOpen: true, mode: "create" })}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nueva Task</span>
          </button>
        ) : (
          <button
            onClick={() =>
              setModalState({ isOpen: false, mode: "create", task: undefined })
            }
            className="border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
        )}
      </div>

      {/* Contenido condicional */}
      {!showingCreateModal ? (
        <TaskBusquedaYTabla
          tasks={tasks}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          // Podés agregar más props si tu componente las espera:
          // onCreateClick={() => setModalState({ isOpen: true, mode: "create" })}
        />
      ) : (
        <TaskCrear
          isOpen={modalState.isOpen}
          onClose={() =>
            setModalState({ isOpen: false, mode: "create", task: undefined })
          }
          campo={modalState.task}
          mode={modalState.mode}
        />
      )}
    </div>
  );
};

export default TaskContent;
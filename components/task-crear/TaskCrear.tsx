"use client";

import { useMemo, useState } from "react";
import type { Task, Subtasks, PlanTasks } from "@/utils/types";
import FlowArea from "@/components/flowArea/FlowArea";
import { TaskServices } from "@/api/apiFormularios";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface TaskFormModalProps {
  campo?: Task;
}

const LIMIT = 50;

const TaskCrear = ({ campo }: TaskFormModalProps) => {
  const [formData, setFormData] = useState<Task>(() => ({
    id: campo?.id,
    code: campo?.code ?? "",
    priority: campo?.priority ?? "media",
    duration: campo?.duration ?? { horas: 0, minutos: 0 },
    paro: campo?.paro ?? { horas: 0, minutos: 0 },
    Activator: campo?.Activator ?? [],
    subtasks: campo?.subtasks ?? [],
    ptId: campo?.ptId,
  }));
  const [showCanvas, setShowCanvas] = useState(false);

  const {
    data: planTasksResp,
    isLoading: loadingPlans,
    isError: errorPlans,
  } = useQuery({
    queryKey: ["planTasks", LIMIT, 0],
    queryFn: () => TaskServices.fetchPlanTask(LIMIT, 0),
    staleTime: 60_000,
  });

  // 👇 NUEVO
  const createTask = useMutation({
    mutationFn: (payload: Task) => TaskServices.crearTask(payload),
  });

  // ✅ Normalizo la forma de respuesta (array directo, {items}, {data}, etc.)
  const planTasks: PlanTasks[] = useMemo(() => {
    const r: any = planTasksResp;
    if (Array.isArray(r)) return r as PlanTasks[];
    if (Array.isArray(r?.items)) return r.items as PlanTasks[];
    if (Array.isArray(r?.data)) return r.data as PlanTasks[];
    return [];
  }, [planTasksResp]);

  const handleBuildSubtasks = async (subtasks: Subtasks[]) => {
    setFormData((p) => ({ ...p, subtasks }));

    const payload: Task = { ...formData, subtasks };
    console.log("Payload Task listo →", payload);

    await toast.promise(createTask.mutateAsync(payload), {
      loading: "Creando task...",
      success: "Task creada con exito.",
      error: (err: any) =>
        `Error al crear la task ${
          err?.response?.data?.message ? `: ${err.response.data.message}` : ""
        }`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗂️ Tareas</h1>
          <p className="text-gray-600 mt-1">Crea y gestiona las task</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Nueva Task (Canvas)
            </h2>
          </div>
        </div>

        {/* Form raíz */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowCanvas(true);
          }}
          className="p-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Plan Tasks */}
            <div>
              <label
                htmlFor="ptId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Plan Task *
              </label>
              <select
                id="ptId"
                value={formData.ptId ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    ptId: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={loadingPlans || errorPlans}
                required
              >
                <option value="" disabled>
                  {loadingPlans
                    ? "Cargando planes…"
                    : errorPlans
                    ? "Error al cargar"
                    : "Seleccioná un Plan Task"}
                </option>
                {planTasks
                  .filter((pt) => !!pt.id)
                  .map((pt) => (
                    <option key={pt.id} value={pt.id!}>
                      {pt.name}
                    </option>
                  ))}
              </select>
              {errorPlans && (
                <p className="text-xs text-red-600 mt-1">
                  No se pudo cargar la lista de Plan Tasks.
                </p>
              )}
            </div>

            {/* Código */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre / Código *
              </label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, code: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ej: HVAC-PR-004"
                required
              />
            </div>

            {/* Prioridad */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prioridad *
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    priority: e.target.value as Task["priority"],
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            {/* Duración */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (aprox.) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={formData.duration.horas}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      duration: {
                        ...p.duration,
                        horas: Math.max(0, Number(e.target.value) || 0),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Horas"
                  aria-label="Duración horas"
                />
                <span className="text-gray-500 text-sm">h</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={formData.duration.minutos}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      duration: {
                        ...p.duration,
                        minutos: Math.min(
                          59,
                          Math.max(0, Number(e.target.value) || 0)
                        ),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Minutos"
                  aria-label="Duración minutos"
                />
                <span className="text-gray-500 text-sm">m</span>
              </div>
            </div>

            {/* Paro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paro (aprox.)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={formData.paro?.horas ?? 0}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      paro: {
                        horas: Math.max(0, Number(e.target.value) || 0),
                        minutos: p.paro?.minutos ?? 0,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Horas"
                  aria-label="Paro horas"
                />
                <span className="text-gray-500 text-sm">h</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={formData.paro?.minutos ?? 0}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      paro: {
                        horas: p.paro?.horas ?? 0,
                        minutos: Math.min(
                          59,
                          Math.max(0, Number(e.target.value) || 0)
                        ),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Minutos"
                  aria-label="Paro minutos"
                />
                <span className="text-gray-500 text-sm">m</span>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={!formData.code.trim() || !formData.ptId}
              onClick={() => setShowCanvas(true)}
              title={
                !formData.code.trim()
                  ? "Ingresá un código para habilitar el canvas"
                  : !formData.ptId
                  ? "Seleccioná un Plan Task"
                  : "Abrir canvas"
              }
            >
              + Agregar (abrir canvas)
            </button>
          </div>
        </form>

        {showCanvas && (
          <div className="p-3">
            <FlowArea
              onBuildSubtasks={handleBuildSubtasks}
              rootLabel={formData.code || "TASK"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCrear;

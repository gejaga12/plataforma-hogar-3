"use client";

import { Task, Subtasks } from "@/utils/types";
import { useState } from "react";
import { Plus } from "lucide-react";

interface TaskFormModalProps {
  campo?: Task;
}

const TaskCrearDos = ({ campo }: TaskFormModalProps) => {
  // -----------------------------
  // Estado del formulario de Task raíz
  // -----------------------------
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Crear Nueva Task (Canvas)
          </h2>
        </div>
      </div>

      {/* Form raíz + Quick add SubTask */}
      <form onSubmit={() => console.log("clicked")} className="p-6 space-y-4">
        {/* Encabezado compacto: Task raíz */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Guardar Task (mostrar en lienzo)
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskCrearDos;

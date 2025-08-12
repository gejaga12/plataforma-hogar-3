import { Plus, Trash2 } from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useState } from "react";
import { Task } from "@/utils/types";

const TIPOS = [
  { value: "texto", label: "Texto" },
  { value: "foto", label: "Foto" },
  { value: "si_no", label: "Sí / No" },
  { value: "multi-choice", label: "Multi-choice" },
  { value: "qr", label: "QR" },
] as const;

type Subtask = Task["subtasks"][number];

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  campo?: Task;
  mode: "create" | "edit" | "view";
}

const TaskCrear = ({ isOpen, onClose, campo, mode }: TaskFormModalProps) => {
  const [formData, setFormData] = useState<Task>(() => ({
    id: campo?.id,
    code: campo?.code ?? "",
    priority: campo?.priority ?? "media",
    duration: campo?.duration ?? { horas: 0, minutos: 0 },
    paro: campo?.paro,
    Activator: campo?.Activator ?? [],
    subtasks: campo?.subtasks ?? [],
    ptId: campo?.ptId,
  }));

  // Sólo para multi-choice: qué subtasks tienen "anidados por opción" activado
  const [multiNested, setMultiNested] = useState<Set<number>>(new Set());

  if (!isOpen) return null;
  const isReadOnly = mode === "view";
  const isLoading = false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Task enviada:", formData);
    onClose();
  };

  /* ---------------- Helpers ---------------- */
  const defaultSubtask = (): Subtask => ({
    description: "",
    type: "",
    options: [],
    group: "",
    required: false,
    FilesRequired: false,
  });

  /* ---------------- Subtasks CRUD ---------------- */
  const addSubtask = () => {
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, defaultSubtask()],
    }));
  };

  const removeSubtask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
    setMultiNested((prev) => {
      const cp = new Set(prev);
      cp.delete(index);
      return cp;
    });
  };

  const updateSubtask = <K extends keyof Subtask>(
    index: number,
    field: K,
    value: Subtask[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st, i) =>
        i === index ? { ...st, [field]: value } : st
      ),
    }));
  };

  /* ---------------- Tipo y Opciones ---------------- */
  const onSubtaskTypeChange = (idx: number, tipo: string) => {
    setFormData((prev) => {
      const next = [...prev.subtasks];
      const st = { ...next[idx], type: tipo };

      if (tipo === "si_no") {
        st.options = [
          { title: "Sí", depends: [] },
          { title: "No", depends: [] },
        ];
        // si/no no usa checkbox
        setMultiNested((prevSet) => {
          const cp = new Set(prevSet);
          cp.delete(idx);
          return cp;
        });
      } else if (tipo === "multi-choice") {
        st.options = [{ title: "", depends: [] }]; // una opción vacía
        setMultiNested((prevSet) => {
          const cp = new Set(prevSet);
          cp.delete(idx); // arranca sin anidados
          return cp;
        });
      } else {
        // texto/foto/qr
        st.options = [];
        setMultiNested((prevSet) => {
          const cp = new Set(prevSet);
          cp.delete(idx);
          return cp;
        });
      }

      next[idx] = st;
      return { ...prev, subtasks: next };
    });
  };

  // Multi-choice: opciones
  const addOption = (idx: number) => {
    setFormData((prev) => {
      const next = [...prev.subtasks];
      const st = { ...next[idx] };
      st.options = [...(st.options ?? []), { title: "", depends: [] }];
      next[idx] = st;
      return { ...prev, subtasks: next };
    });
  };

  const removeOption = (idx: number, optIdx: number) => {
    setFormData((prev) => {
      const next = [...prev.subtasks];
      const st = { ...next[idx] };
      st.options = (st.options ?? []).filter((_, i) => i !== optIdx);
      next[idx] = st;
      return { ...prev, subtasks: next };
    });
  };

  // Multi-choice: subtasks anidados por opción
  const addNestedOptSubtask = (idx: number, optIdx: number) => {
    setFormData((prev) => {
      const next = [...prev.subtasks];
      const st = { ...next[idx] };
      const opts = [...(st.options ?? [])];
      const depends = [...(opts[optIdx].depends ?? [])];
      depends.push(defaultSubtask());
      opts[optIdx] = { ...opts[optIdx], depends };
      st.options = opts;
      next[idx] = st;
      return { ...prev, subtasks: next };
    });
  };

  const updateNestedOptSubtask = <K extends keyof Subtask>(
    idx: number,
    optIdx: number,
    depIdx: number,
    field: K,
    value: Subtask[K]
  ) => {
    setFormData((prev) => {
      const next = [...prev.subtasks];
      const st = { ...next[idx] };
      const opts = [...(st.options ?? [])];
      const depends = [...(opts[optIdx].depends ?? [])];
      depends[depIdx] = { ...depends[depIdx], [field]: value };
      opts[optIdx] = { ...opts[optIdx], depends };
      st.options = opts;
      next[idx] = st;
      return { ...prev, subtasks: next };
    });
  };

  const removeNestedOptSubtask = (
    idx: number,
    optIdx: number,
    depIdx: number
  ) => {
    setFormData((prev) => {
      const next = [...prev.subtasks];
      const st = { ...next[idx] };
      const opts = [...(st.options ?? [])];
      const depends = (opts[optIdx].depends ?? []).filter(
        (_, i) => i !== depIdx
      );
      opts[optIdx] = { ...opts[optIdx], depends };
      st.options = opts;
      next[idx] = st;
      return { ...prev, subtasks: next };
    });
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" && "Crear Nueva Task"}
            {mode === "edit" && "Editar Task"}
            {mode === "view" && "Detalles de la Task"}
          </h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Encabezado compacto */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Nombre / Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre / Código *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, code: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: HVAC-PR-004"
              required
              disabled={isReadOnly}
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad *
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as Task["priority"],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              disabled={isReadOnly}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración * (aprox.)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={formData.duration.horas}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: {
                      ...prev.duration,
                      horas: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Horas"
                disabled={isReadOnly}
              />
              <span className="text-gray-500 text-sm">h</span>
              <input
                type="number"
                min={0}
                max={59}
                value={formData.duration.minutos}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: {
                      ...prev.duration,
                      minutos: Math.min(
                        59,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Minutos"
                disabled={isReadOnly}
              />
              <span className="text-gray-500 text-sm">m</span>
            </div>
          </div>
          {/* Paro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paro * (aprox.)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={formData.paro?.horas ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paro: {
                      horas: Math.max(0, Number(e.target.value) || 0),
                      minutos: prev.paro?.minutos ?? 0,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Horas"
                disabled={isReadOnly}
              />
              <span className="text-gray-500 text-sm">h</span>
              <input
                type="number"
                min={0}
                max={59}
                value={formData.paro?.minutos ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paro: {
                      horas: prev.paro?.horas ?? 0,
                      minutos: Math.min(
                        59,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Minutos"
                disabled={isReadOnly}
              />
              <span className="text-gray-500 text-sm">m</span>
            </div>
          </div>
        </div>

        {/* Subtasks */}
        <div>
          {!isReadOnly && (
            <button
              type="button"
              onClick={addSubtask}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium mb-3 inline-flex items-center gap-1"
            >
              <Plus size={16} /> Agregar SubTask
            </button>
          )}

          {formData.subtasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay SubTasks. Hacé clic en “Agregar SubTask”.
            </p>
          ) : (
            <div className="space-y-3">
              {formData.subtasks.map((st, index) => {
                const isMulti = st.type === "multi-choice";
                const isSiNo = st.type === "si_no";
                const showOptions = isMulti || isSiNo;
                const nestedOn = multiNested.has(index); // sólo multi

                return (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Descripción */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción *
                        </label>
                        <input
                          type="text"
                          value={st.description}
                          onChange={(e) =>
                            updateSubtask(index, "description", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ej: Limpieza de filtros"
                          disabled={isReadOnly}
                          required
                        />
                      </div>

                      {/* Tipo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          value={(st.type as any) ?? ""}
                          onChange={(e) =>
                            onSubtaskTypeChange(index, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled={isReadOnly}
                        >
                          <option value="">— Seleccionar —</option>
                          {TIPOS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Opciones (si/no o multi-choice) */}
                    {showOptions && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase text-gray-500">
                            Opciones
                          </p>
                          {!isReadOnly && isMulti && (
                            <button
                              type="button"
                              onClick={() => addOption(index)}
                              className="text-orange-600 hover:text-orange-700 text-sm font-medium inline-flex items-center gap-1"
                            >
                              <Plus size={14} /> Agregar opción
                            </button>
                          )}
                        </div>

                        {(st.options ?? []).map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="p-3 border border-gray-200 rounded-lg bg-white"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={opt.title}
                                onChange={(e) => {
                                  const newOpts = [...(st.options ?? [])];
                                  newOpts[optIdx] = {
                                    ...newOpts[optIdx],
                                    title: e.target.value,
                                  };
                                  updateSubtask(index, "options", newOpts);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder={
                                  isSiNo
                                    ? optIdx === 0
                                      ? "Sí"
                                      : "No"
                                    : "Título de la opción"
                                }
                                disabled={isReadOnly || isSiNo} // en si/no, títulos fijos
                              />

                              {/* Quitar opción: solo multi y si hay >1 */}
                              {!isReadOnly &&
                                isMulti &&
                                (st.options?.length ?? 0) > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(index, optIdx)}
                                    className="text-red-600 hover:text-red-700 text-sm"
                                  >
                                    Quitar
                                  </button>
                                )}
                            </div>

                            {/* Subtasks anidados por opción (sólo multi con checkbox activo) */}
                            {(isSiNo || (isMulti && nestedOn)) && (
                              <div className="mt-3 ml-6 pl-4 border-l-2 border-gray-200 space-y-2">
                                <p className="text-xs uppercase text-gray-500">
                                  Subtasks anidados
                                </p>

                                {(opt.depends ?? []).map((dep, depIdx) => (
                                  <div
                                    key={depIdx}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-md bg-gray-50 border border-gray-200"
                                  >
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción *
                                      </label>
                                      <input
                                        type="text"
                                        value={dep.description}
                                        onChange={(e) =>
                                          updateNestedOptSubtask(
                                            index,
                                            optIdx,
                                            depIdx,
                                            "description",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Descripción del subtask anidado"
                                        disabled={isReadOnly}
                                        required
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo
                                      </label>
                                      <select
                                        value={(dep.type as any) ?? ""}
                                        onChange={(e) =>
                                          updateNestedOptSubtask(
                                            index,
                                            optIdx,
                                            depIdx,
                                            "type",
                                            e.target.value as any
                                          )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        disabled={isReadOnly}
                                      >
                                        <option value="">
                                          — Seleccionar —
                                        </option>
                                        {TIPOS.map((t) => (
                                          <option key={t.value} value={t.value}>
                                            {t.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    {!isReadOnly && (
                                      <div className="md:col-span-3 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeNestedOptSubtask(
                                              index,
                                              optIdx,
                                              depIdx
                                            )
                                          }
                                          className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
                                        >
                                          <Trash2 size={16} />
                                          Eliminar
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {!isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addNestedOptSubtask(index, optIdx)
                                    }
                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium inline-flex items-center gap-1"
                                  >
                                    <Plus size={14} /> Agregar subtask anidado
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón eliminar subtask principal */}
                    {!isReadOnly && (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          className="text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                          title="Eliminar SubTask"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm">Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer acciones */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {mode === "create" ? "Creando..." : "Guardando..."}
                  </span>
                </>
              ) : mode === "create" ? (
                "Crear Task"
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskCrear;

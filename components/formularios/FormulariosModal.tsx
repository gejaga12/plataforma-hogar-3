"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { X } from "lucide-react";
import { PlanTasks } from "@/utils/types";

interface FormulariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "view"; // por ahora usaremos "create"
  onSubmit: (payload: PlanTasks) => void; // enviamos { nombre, descripcion }
  isSubmitting: boolean;
  defaultValues?: Partial<Pick<PlanTasks, "name" | "description">>;
}

const FormulariosModal = ({
  isOpen,
  onClose,
  mode,
  onSubmit,
  isSubmitting,
  defaultValues,
}: FormulariosModalProps) => {
  // Solo los campos que necesitamos para crear
  const [formData, setFormData] = useState<
    Pick<PlanTasks, "name" | "description">
  >({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    });
  }, [isOpen, defaultValues?.name, defaultValues?.description]);

  if (!isOpen) return null;

  const isReadOnly = mode === "view";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const payload = {
      name: formData.name,
      description: formData.description,
    } as PlanTasks;
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create" && "Crear nuevo plan"}
              {mode === "edit" && "Editar plan"}
              {mode === "view" && "Detalle del plan"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
              aria-label="Cerrar"
            >
              <X />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: Mantenimiento de rutina"
              required
              disabled={isReadOnly || isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Breve descripción del plan"
              disabled={isReadOnly || isSubmitting}
            />
          </div>

          {!isReadOnly && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-60 flex items-center"
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creando…</span>
                  </>
                ) : (
                  "Crear"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FormulariosModal;

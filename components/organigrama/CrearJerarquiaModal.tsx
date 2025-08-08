// components/organigrama/CrearJerarquiaModal.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Info, InfoIcon, X } from "lucide-react";
import {
  CrearJerarquiaConUsuario,
  crearJerarquiaData,
} from "@/api/apiJerarquia";
import { LoadingSpinner } from "../ui/loading-spinner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CrearJerarquiaConUsuario,
    actualizarExistente?: boolean
  ) => void;
  nodoId?: string;
  initialData?: {
    id: string;
    cargo: string;
    area: string;
  };
  areas?: string[];
  areasLoading?: boolean;
}

export const CrearJerarquiaModal = ({
  isOpen,
  onClose,
  onSubmit,
  nodoId,
  initialData,
  areas,
  areasLoading,
}: Props) => {
  const [form, setForm] = useState<crearJerarquiaData>({
    cargo: initialData?.cargo ?? "",
    area: initialData?.area ?? "",
    parent: nodoId,
  });
  const [selectedArea, setSelectedArea] = useState<string | null>(
    initialData?.area ?? null
  );

  const resetForm = useCallback(() => {
    setForm({
      cargo: initialData?.cargo ?? "",
      area: initialData?.area ?? "",
      parent: nodoId,
    });
    setSelectedArea(initialData?.area ?? null);
  }, [nodoId, initialData?.cargo, initialData?.area]);

  // 👉 al abrir (o si cambian nodoId/initialData) resetea
  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, resetForm]);

  const handleClose = () => {
    resetForm(); // limpia antes de cerrar
    onClose();
  };

  const handleAreaInputChange = (value: string) => {
    setSelectedArea(null);
    setForm((prev) => ({ ...prev, area: value }));
  };

  const handleToggleArea = (areaName: string, checked: boolean) => {
    if (checked) {
      setSelectedArea(areaName);
      setForm((prev) => ({ ...prev, area: areaName }));
    } else {
      setSelectedArea(null);
      setForm((prev) => ({ ...prev, area: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 relative">
        <button className="absolute top-2 right-2" onClick={handleClose}>
          <X />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {initialData ? "Editar / Asignar Nodo" : "Crear nuevo Nodo"}
        </h2>

        <div className="space-y-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Cargo *
          </label>
          <input
            type="text"
            value={form.cargo ?? ""}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />

          {/* Área: input + lista de áreas con checkbox */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300">
              Área *
            </label>

            {/* Input libre (se rellena cuando marcás una checkbox) */}
            <input
              type="text"
              value={form.area ?? ""}
              onChange={(e) => handleAreaInputChange(e.target.value)}
              placeholder={
                (areas?.length ?? 0) > 0
                  ? "Escribe un área o tilda una de la lista"
                  : "Escribe un área (no hay sugerencias)"
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <span className="flex gap-2 items-center">
              <InfoIcon size={15} className="text-red-500"/>
              <p className="text-xs text-gray-800 dark:text-gray-400">
                Selecciona un area existente o crea una nueva
              </p>
            </span>
            {/* Lista de áreas con checkbox (single-select behavior) */}
            <div className="mt-2 max-h-40 overflow-auto rounded border border-gray-200 dark:border-gray-700 p-2">
              {areasLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <LoadingSpinner size="sm" />
                  Cargando áreas...
                </div>
              ) : (areas?.length ?? 0) === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No hay áreas disponibles. Podés escribir una nueva arriba.
                </div>
              ) : (
                <ul className="space-y-1">
                  {areas!.map((a) => {
                    const isChecked = selectedArea === a;
                    return (
                      <li key={a}>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            checked={isChecked}
                            onChange={(e) =>
                              handleToggleArea(a, e.target.checked)
                            }
                          />
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {a}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onSubmit({ ...form })}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!form.cargo || !form.area}
          >
            {initialData ? "Asignar Usuario" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};

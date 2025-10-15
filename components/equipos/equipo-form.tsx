"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { EquipoService } from "@/utils/api/apiEquipo";
import { Equipo, EstadoEquipo } from "@/utils/types";
import { getUserTimeZone, toUTC } from "@/utils/formatDate";

interface EquipoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Equipo) => void;
  equipo?: any;
  isLoading: boolean;
}

export function EquipoForm({
  isOpen,
  onClose,
  onSubmit,
  equipo,
  isLoading,
}: EquipoFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Equipo>({
    name: "",
    defId: "",
    Kv: [],
    habilitado: EstadoEquipo.OK,
    fueraDeServicio: false, // siempre por defecto false
    ptId: undefined,
  });

  // DATA DE QUERYS
  const { data: tiposEquipo = [], isLoading: isLoadingTipos } = useQuery({
    queryKey: ["tipos-Equipo"],
    queryFn: EquipoService.listarEquiposAdmin,
  });

  // console.log("tiposEquipo:", tiposEquipo)

  useEffect(() => {
    if (equipo) {
      setFormData({
        id: equipo.id,
        name: equipo.name || "",
        defId: equipo.defId || "",
        Kv: equipo.Kv || [],
        habilitado: equipo.habilitado || EstadoEquipo.OK,
        fueraDeServicio: false,
        ptId: equipo.ptId || undefined,
      });
    } else {
      setFormData({
        name: "",
        defId: "",
        Kv: [],
        habilitado: EstadoEquipo.OK,
        fueraDeServicio: false,
        ptId: undefined,
      });
    }
    setCurrentStep(1);
  }, [equipo, isOpen]);

  const handleInputChange = (
    field: keyof (Equipo & { ptId?: string }),
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "defId") {
      setFormData((prev) => ({
        ...prev,
        Kv: [], // resetear Kv al cambiar tipo
        ptId: undefined, // resetear plan tasks
      }));
    }
  };

  const handleCampoTecnicoChange = (key: string, rawValue: string) => {
    const tipoSeleccionado = tiposEquipo.find(
      (tipo: { id: string }) => tipo.id === formData.defId
    );
    if (!tipoSeleccionado) return;

    const tipoCampo = tipoSeleccionado.kv[key];

    let value: string | number | boolean | Date | undefined = rawValue;
    switch (tipoCampo) {
      case "int":
      case "float":
        value = rawValue === "" ? undefined : Number(rawValue);
        break;
      case "boolean":
        if (rawValue === "") value = undefined;
        else value = rawValue === "true";
        break;
      case "date":
        value = rawValue === "" ? undefined : new Date(rawValue);
        break;
      default:
        value = rawValue;
    }

    setFormData((prev) => {
      const exists = prev.Kv?.find((kv) => kv.key === key);
      let newKv;
      if (exists) {
        newKv = prev.Kv?.map((kv) => (kv.key === key ? { ...kv, value } : kv));
      } else {
        newKv = [...(prev.Kv || []), { key, value }];
      }
      return { ...prev, Kv: newKv };
    });
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const kvNormalizado = formData.Kv?.map((item) => {
      if (item.value instanceof Date) {
        return {
          ...item,
          value: toUTC(item.value, getUserTimeZone()),
        };
      }
      return item;
    });

    const payload = {
      ...formData,
      Kv: kvNormalizado,
    };
    console.log("📤 Payload final:", payload);
    onSubmit(payload);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.name && !!formData.defId && !!formData.habilitado;
      case 2: {
        const tipoSeleccionado = tiposEquipo.find(
          (tipo: { id: string }) => tipo.id === formData.defId
        );
        if (!tipoSeleccionado) return false;

        const camposTecnicos = Object.entries(tipoSeleccionado.kv || {});
        return camposTecnicos.every(([key]) =>
          formData.Kv?.some((kv) => kv.key === key && kv.value !== "")
        );
      }
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {equipo ? "Editar Equipo" : "Nuevo Equipo"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps con círculos y líneas */}
        <div className="flex items-center justify-between mt-6">
          {[
            { num: 1, label: "Datos Generales" },
            { num: 2, label: "Campos Técnicos" },
          ].map((step, index, arr) => (
            <div
              key={step.num}
              className="flex-1 flex flex-col items-center relative"
            >
              {/* Círculo */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10
                    ${
                      currentStep >= step.num
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                    }`}
              >
                {step.num}
              </div>

              {/* Label */}
              <span className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center w-full">
                {step.label}
              </span>

              {/* Línea conectora */}
              {index < arr.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-1 -translate-y-1/2
                      ${
                        currentStep > step.num
                          ? "bg-orange-600"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                  style={{ zIndex: 0 }}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Paso 1 */}
          {currentStep === 1 && (
            <>
              <h3 className="text-lg font-medium">Datos Generales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipo de Equipo *
                  </label>
                  <select
                    value={formData.defId}
                    onChange={(e) => handleInputChange("defId", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposEquipo.map((tipo: { id: string; name: string }) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingTipos && (
                    <p className="text-sm text-gray-500 mt-1">
                      Cargando tipos...
                    </p>
                  )}
                </div>

                {/* Habilitado */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estado *
                  </label>
                  <select
                    value={formData.habilitado}
                    onChange={(e) =>
                      handleInputChange(
                        "habilitado",
                        e.target.value as EstadoEquipo
                      )
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value={EstadoEquipo.OK}>Ok</option>
                    <option value={EstadoEquipo.Reparacion}>Reparación</option>
                    <option value={EstadoEquipo.No_ok}>No OK</option>
                  </select>
                </div>

                {/* Plan Tasks asociados */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Plan de Tareas (PT)
                  </label>
                  <select
                    value={formData.ptId || ""}
                    onChange={(e) => handleInputChange("ptId", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={!formData.defId} // 🔹 deshabilitado hasta elegir tipo
                  >
                    {!formData.defId ? (
                      <option value="">Selecciona un tipo primero</option>
                    ) : (
                      <>
                        <option value="">Seleccionar PT</option>
                        {tiposEquipo
                          .find((t: any) => t.id === formData.defId)
                          ?.pts?.map((pt: { id: string; name: string }) => (
                            <option key={pt.id} value={pt.id}>
                              {pt.name}
                            </option>
                          ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Paso 2 */}
          {currentStep === 2 && (
            <>
              <h3 className="text-lg font-medium">Campos Técnicos</h3>
              {(() => {
                const tipoSeleccionado = tiposEquipo.find(
                  (tipo: { id: string }) => tipo.id === formData.defId
                );
                if (!tipoSeleccionado)
                  return <p>Selecciona un tipo en el paso 1.</p>;

                const camposTecnicos = Object.entries(
                  tipoSeleccionado.kv || {}
                );

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {camposTecnicos.map(([key, type]) => {
                      const kvValue = formData.Kv?.find(
                        (kv) => kv.key === key
                      )?.value;

                      let inputValue: string | number | undefined = "";
                      if (kvValue !== undefined && kvValue !== null) {
                        if (type === "date" && kvValue instanceof Date) {
                          inputValue = kvValue.toISOString().split("T")[0];
                        } else if (typeof kvValue === "boolean") {
                          inputValue = kvValue ? "true" : "false";
                        } else {
                          inputValue = kvValue as string | number;
                        }
                      }

                      return (
                        <div key={key}>
                          <label className="block text-sm font-medium mb-1">
                            {key}
                          </label>
                          {type === "boolean" ? (
                            <select
                              value={inputValue}
                              onChange={(e) =>
                                handleCampoTecnicoChange(key, e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-lg"
                            >
                              <option value="">Seleccionar...</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <input
                              type={
                                type === "int" || type === "float"
                                  ? "number"
                                  : type === "date"
                                  ? "date"
                                  : "text"
                              }
                              value={inputValue}
                              onChange={(e) =>
                                handleCampoTecnicoChange(key, e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}

          {/* Botones navegación */}
          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="flex items-center px-4 py-2 border rounded-lg"
              disabled={isLoading}
            >
              {currentStep === 1 ? "Cancelar" : "Anterior"}
            </button>

            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid(currentStep) || isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />{" "}
                    {equipo ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  <>{equipo ? "Actualizar Equipo" : "Guardar Equipo"}</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ingresoService } from "@/utils/api/apiIngreso";
import { CrearHoraExtra } from "@/utils/types";
import { formatISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface HoraExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  horaExtra?: CrearHoraExtra;
  mode: "create" | "view";
}

const TIME_ZONE = "America/Argentina/Buenos_Aires";

const HoraExtraModal = ({
  isOpen,
  onClose,
  horaExtra,
  mode,
}: HoraExtraModalProps) => {
  const queryClient = useQueryClient();

  const initialFormData: CrearHoraExtra = {
    lan: -27.411748784512017,
    lng: -59.00082803696277,
    horaInicio: "",
    horaFinal: "",
    razon: "",
    comentario: "",
  };

  const [formData, setFormData] = useState<CrearHoraExtra>(initialFormData);

  useEffect(() => {
    if (isOpen && mode === "view" && horaExtra) {
      setFormData(horaExtra);
    }
    if (isOpen && mode === "create") {
      setFormData(initialFormData);
    }
  }, [isOpen, mode, horaExtra]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        horaInicio: formData.horaInicio
          ? formatISO(toZonedTime(new Date(formData.horaInicio), TIME_ZONE))
          : "",
        horaFinal: formData.horaFinal
          ? formatISO(toZonedTime(new Date(formData.horaFinal), TIME_ZONE))
          : "",
      };

      console.log("📤 Payload corregido:", payload);
      return await ingresoService.createHorasExtras(payload);
    },
    onSuccess: () => {
      toast.success("Hora extra registrada");
      queryClient.invalidateQueries({ queryKey: ["horas-extras"] });
      setFormData(initialFormData);
      onClose();
    },
    onError: () => {
      toast.error("Error al registrar la hora extra");
    },
  });

  if (!isOpen) return null;

  const isReadOnly = mode === "view";

  const handleClose = () => {
    setFormData(initialFormData); // 🔹 limpiamos al cerrar
    onClose();
  };

  const toLocalInputValue = (iso?: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toISOString().slice(0, 16); // formato "YYYY-MM-DDTHH:mm"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create"
                ? "Registrar Hora Extra"
                : "Detalles de la Hora Extra"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "create") mutate();
          }}
          className="p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de inicio *
              </label>
              <input
                type="datetime-local"
                value={toLocalInputValue(formData.horaInicio)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const zoned = toZonedTime(date, TIME_ZONE);
                  setFormData((prev) => ({
                    ...prev,
                    horaInicio: formatISO(zoned),
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora final *
              </label>
              <input
                type="datetime-local"
                value={toLocalInputValue(formData.horaFinal)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const zoned = toZonedTime(date, TIME_ZONE);
                  setFormData((prev) => ({
                    ...prev,
                    horaFinal: formatISO(zoned),
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón *
            </label>
            <input
              type="text"
              value={formData.razon}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, razon: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: Compra de materiales, urgencia técnica..."
              required
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentario
            </label>
            <textarea
              value={formData.comentario}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comentario: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Información adicional (opcional)"
              disabled={isReadOnly}
            />
          </div>

          {/* Footer */}
          {mode === "view" ? (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Esta hora extra fue registrada en el sistema.
              </p>
            </div>
          ) : (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {isPending ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default HoraExtraModal;

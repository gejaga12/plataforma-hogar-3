"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { HorasExtras } from "@/utils/types";
import { Loader } from "@googlemaps/js-api-loader";
import { getStateBadgeHoras } from "../ui/EstadosBadge";
import { cn } from "@/utils/cn";
import { capitalizeFirstLetter } from "@/utils/normalize";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

interface HoraExtraDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  horaExtra: HorasExtras | null;
  onDecision: (id: string, approved: boolean) => void;
  isUpdating?: boolean;
}

const HoraExtraDetalleModal = ({
  isOpen,
  onClose,
  horaExtra,
  onDecision,
  isUpdating = false,
}: HoraExtraDetalleModalProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [accion, setAccion] = useState<"aprobar" | "rechazar" | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (accionSeleccionada: "aprobar" | "rechazar") => {
    setAccion(accionSeleccionada);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!accion) return;
    onDecision?.(horaExtra?.id!, accion === "aprobar");
    setConfirmOpen(false);
  };

  useEffect(() => {
    if (isOpen && mapRef.current) {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
        libraries: ["places"],
      });

      loader.load().then(() => {
        if (!horaExtra) return;

        const map = new google.maps.Map(mapRef.current as HTMLElement, {
          center: {
            lat: horaExtra.lan || -34.6037, // fallback BA
            lng: horaExtra.lng || -58.3816,
          },
          zoom: 14,
        });

        if (horaExtra.lan && horaExtra.lng) {
          new google.maps.Marker({
            position: { lat: horaExtra.lan, lng: horaExtra.lng },
            map,
          });
        }
      });
    }
  }, [isOpen, horaExtra]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !horaExtra) return null;

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle Hora Extra
            </h2>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                getStateBadgeHoras(horaExtra?.state)
              )}
            >
              {capitalizeFirstLetter(horaExtra?.state)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solicitante
              </label>
              <input
                type="text"
                value={horaExtra.solicitante}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón
              </label>
              <input
                type="text"
                value={horaExtra.razon}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario
              </label>
              <textarea
                value={horaExtra.comentario || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Solicitud
              </label>
              <input
                type="text"
                value={formatDateTime(horaExtra.fechaSolicitud)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Horas
              </label>
              <input
                type="text"
                value={horaExtra.totalHoras}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Inicio
              </label>
              <input
                type="text"
                value={formatDateTime(horaExtra.horaInicio)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Final
              </label>
              <input
                type="text"
                value={formatDateTime(horaExtra.horaFinal)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                value={horaExtra.state}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verificación
              </label>
              <input
                type="text"
                value={horaExtra.verificacion}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autorizado
              </label>
              <input
                type="text"
                value={horaExtra.autorizado}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Controlado
              </label>
              <input
                type="text"
                value={horaExtra.controlado}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          {/* Placeholder Map */}
          <div className="p-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Ubicación
            </h3>
            <div ref={mapRef} className="w-full h-[350px] rounded-lg border" />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            {horaExtra?.state === "pendiente" && (
              <>
                <button
                  onClick={() => handleClick("aprobar")}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  <Check size={16} className="mr-2" />
                  Aprobar
                </button>
                <button
                  onClick={() => handleClick("rechazar")}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  <X size={16} className="mr-2" />
                  Rechazar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={
          accion === "aprobar" ? "Confirmar aprobación" : "Confirmar rechazo"
        }
        message={
          accion === "aprobar"
            ? "¿Estás seguro de que deseas aprobar esta solicitud de horas extras?"
            : "¿Estás seguro de que deseas rechazar esta solicitud de horas extras?"
        }
        confirmText={accion === "aprobar" ? "Aprobar" : "Rechazar"}
      />
    </div>
  );
};

export default HoraExtraDetalleModal;

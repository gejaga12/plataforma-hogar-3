"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Check } from "lucide-react";
import { EstadoHoraExtra, HorasExtras } from "@/utils/types";
import { getStateBadgeHoras } from "../ui/EstadosBadge";
import { cn } from "@/utils/cn";
import { capitalizeFirstLetter } from "@/utils/normalize";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import {
  formatForUser,
  formatHourForUser,
  getUserTimeZone,
} from "@/utils/formatDate";
import { GoogleMapBox } from "../ui/GoogleMapBox";

interface HoraExtraDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  horaExtra: HorasExtras | null;
  onDecision: (id: string, approved: boolean) => void;
  isUpdating?: boolean;
}

const estadoLabel: Record<EstadoHoraExtra, string> = {
  [EstadoHoraExtra.PENDIENTE]: "Pendiente",
  [EstadoHoraExtra.APPROVED]: "Aprobado",
  [EstadoHoraExtra.NOAPPROVED]: "Rechazado",
};

const stateUI: Record<EstadoHoraExtra, { container: string; ring: string }> = {
  [EstadoHoraExtra.PENDIENTE]: {
    container: "border-yellow-300 bg-yellow-50",
    ring: "ring-1 ring-yellow-200/60",
  },
  [EstadoHoraExtra.APPROVED]: {
    container: "border-green-300 bg-green-50",
    ring: "ring-1 ring-green-200/60",
  },
  [EstadoHoraExtra.NOAPPROVED]: {
    container: "border-red-300 bg-red-50",
    ring: "ring-1 ring-red-200/60",
  },
};

const HoraExtraDetalleModal = ({
  isOpen,
  onClose,
  horaExtra,
  onDecision,
  isUpdating = false,
}: HoraExtraDetalleModalProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [accion, setAccion] = useState<"aprobar" | "rechazar" | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [localHoraExtra, setLocalHoraExtra] = useState<HorasExtras | null>(
    horaExtra
  );
  const tz = getUserTimeZone();

  const handleClick = (accionSeleccionada: "aprobar" | "rechazar") => {
    setAccion(accionSeleccionada);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!accion || !horaExtra?.id) return;

    const nextState =
      accion === "aprobar"
        ? EstadoHoraExtra.APPROVED
        : EstadoHoraExtra.NOAPPROVED;

    setLocalHoraExtra((prev) =>
      prev
        ? {
            ...prev,
            state: nextState, // <-- enum
            autorizado:
              accion === "aprobar" ? prev.autorizado || "—" : prev.autorizado,
          }
        : prev
    );

    onDecision?.(horaExtra.id, accion === "aprobar");
    setConfirmOpen(false);
  };

  useEffect(() => {
    setLocalHoraExtra(horaExtra);
  }, [horaExtra?.id, horaExtra]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setShowMap(false);
  }, [isOpen, horaExtra?.id]);

  const pos = useMemo(() => {
    const lat = horaExtra?.lan ?? -34.6037;
    const lng = horaExtra?.lng ?? -58.3816;
    return { lat, lng };
  }, [horaExtra?.lan, horaExtra?.lng]);

  const uiClasses = useMemo(() => {
    if (!horaExtra) {
      return { container: "border-gray-200 bg-white", ring: "" };
    }
    return stateUI[horaExtra.state];
  }, [horaExtra]);

  if (!isOpen || !horaExtra) return null;

  const hasCoords =
    typeof horaExtra.lan === "number" &&
    !Number.isNaN(horaExtra.lan) &&
    typeof horaExtra.lng === "number" &&
    !Number.isNaN(horaExtra.lng);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          "rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto",
          "border-2 shadow-sm transition-colors",
          uiClasses.container,
          uiClasses.ring
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle Hora Extra
            </h2>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                getStateBadgeHoras(horaExtra.state)
              )}
            >
              {estadoLabel[horaExtra.state]}
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
            {/* Solicitante */}
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
            {/* Razon */}
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

            {/* Comentario */}
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

            {/* Fecha solicitud */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Solicitud
              </label>
              <input
                type="text"
                value={formatForUser(horaExtra.fechaSolicitud, tz)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            {/* Total horas */}
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

            {/* Hora inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Inicio
              </label>
              <input
                type="text"
                value={formatHourForUser(horaExtra.horaInicio, tz)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            {/* Hora final */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Final
              </label>
              <input
                type="text"
                value={formatHourForUser(horaExtra.horaFinal, tz)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <input
                type="text"
                value={horaExtra.cliente?.name ?? "-"}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            {/* Tipo (NUEVO) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <input
                type="text"
                value={capitalizeFirstLetter(String(horaExtra.tipo))}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            {/* Tipo de Atención */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de atención
              </label>
              <input
                type="text"
                value={
                  horaExtra.tipoAtencion
                    ? capitalizeFirstLetter(String(horaExtra.tipoAtencion))
                    : "-"
                }
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                value={capitalizeFirstLetter(horaExtra.state)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            {/* Verificacion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verificación
              </label>
              <input
                type="text"
                value={capitalizeFirstLetter(horaExtra.verificacion)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            {/* Autorizado */}
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

            {/* Controlado */}
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

          {/* Mapa para ubicacion */}
          <div className="px-1">
            <button
              type="button"
              onClick={() => hasCoords && setShowMap((s) => !s)}
              disabled={!hasCoords}
              className={cn(
                "text-sm underline underline-offset-4",
                hasCoords
                  ? "text-blue-600 hover:text-blue-800"
                  : "text-gray-400 cursor-not-allowed"
              )}
              title={
                hasCoords
                  ? showMap
                    ? "Ocultar ubicación"
                    : "Ver ubicación"
                  : "No hay coordenadas registradas"
              }
            >
              {showMap ? "Ocultar ubicación" : "Ver ubicación"}
            </button>

            {showMap && hasCoords && (
              <div className="mt-3">
                <div className="w-full h-[350px] rounded-lg border overflow-hidden bg-gray-100">
                  <GoogleMapBox
                    lat={pos.lat}
                    lng={pos.lng}
                    zoom={14}
                    smoothPan
                    mapOptions={{}}
                  />
                </div>
                {!hasCoords && (
                  <p className="text-xs text-gray-500 mt-2">
                    No hay coordenadas registradas; mostrando posición por
                    defecto (CABA).
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            {horaExtra?.state === EstadoHoraExtra.PENDIENTE && (
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

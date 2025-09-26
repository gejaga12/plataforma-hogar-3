"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  X,
  Trash2,
  Tag,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type {
  AgendaItem,
  AgendaState,
  AgendaType,
  AgendaUserLite,
} from "@/utils/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  formatDateForUser,
  formatHourForUser,
  getUserTimeZone,
} from "@/utils/formatDate";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: AgendaItem & {
    description?: string;
    location?: string;
    // soporta múltiples asignados si en un futuro llega así:
    assignees?: AgendaUserLite[];
  };
  onEdit: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

const typeLabel = (type?: AgendaType) => {
  switch (type) {
    case "meeting":
      return "Reunión";
    case "task":
      return "Tarea";
    case "deadline":
      return "Fecha límite";
    case "training":
      return "Capacitación";
    case "reminder":
      return "Recordatorio";
    default:
      return type ?? "Sin tipo";
  }
};

const typeColor = (type?: AgendaType) => {
  switch (type) {
    case "meeting":
      return "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300";
    case "task":
      return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300";
    case "deadline":
      return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
    case "training":
      return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
    case "reminder":
      return "bg-sky-100 dark:bg-sky-900/20 text-sky-800 dark:text-sky-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
  }
};

const stateLabel = (state: AgendaState) => {
  switch (state) {
    case "pendiente":
      return "Pendiente";
    case "progreso":
      return "En progreso";
    case "finalizado":
      return "Finalizado";
  }
};

const stateColor = (state: AgendaState) => {
  switch (state) {
    case "pendiente":
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
    case "progreso":
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
    case "finalizado":
      return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
  }
};

export function EventDetailModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
  isLoading,
}: EventDetailModalProps) {
  if (!isOpen) return null;

  const tz = getUserTimeZone();

  const {
    name,
    type,
    state,
    until,
    assignedBy,
    user,
    assignees,
    description,
    location,
  } = event;

  const assignedList: AgendaUserLite[] = (
    assignees && assignees.length ? assignees : [user].filter(Boolean as any)
  ) as AgendaUserLite[];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                typeColor(type)
              )}
            >
              {typeLabel(type)}
            </span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                stateColor(state)
              )}
            >
              {stateLabel(state)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body: Left content / Right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 p-6">
          {/* LEFT: contenido principal */}
          <div className="space-y-6">
            {/* Título */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {name}
              </h2>
            </div>

            {/* Descripción */}
            {description ? (
              <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </h3>
                <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line">
                  {description}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sin descripción
                </p>
              </div>
            )}

            {/* Ubicación opcional */}
            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ubicación
              </h3>
              {location ? (
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <MapPin
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  <span>{location}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sin ubicación
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: sidebar de detalles */}
          <aside className="space-y-6 lg:pl-2">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Detalles
                </h4>
              </div>

              <div className="p-4 space-y-4">
                {/* Tipo */}
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tipo
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {typeLabel(type)}
                    </p>
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 rounded-full mt-0.5 border border-gray-300 dark:border-gray-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Estado
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {stateLabel(state)}
                    </p>
                  </div>
                </div>

                {/* Fecha y hora */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Fecha
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDateForUser(until, tz)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hora
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatHourForUser(until, tz)}
                    </p>
                  </div>
                </div>

                {/* Creador */}
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Creado por
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {assignedBy?.fullName}
                    </p>
                    {assignedBy?.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {assignedBy.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Asignados */}
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0 w-full">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Asignado a
                    </p>
                    <div className="mt-1 space-y-2">
                      {assignedList.length ? (
                        assignedList.map((p) => (
                          <div
                            key={String(p.id)}
                            className="flex items-center gap-2"
                          >
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-100">
                              {(p.fullName || p.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                {p.fullName}
                              </p>
                              {p.email && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {p.email}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          —
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas (sidebar) */}
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"
              >
                Editar
              </button>
              <button
                onClick={onDelete}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50"
              >
                {isLoading ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

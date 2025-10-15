"use client";

import {
  formatDateForUser,
  formatForUser,
  formatHourForUser,
  getUserTimeZone,
} from "@/utils/formatDate";
import { capitalizeFirstLetter } from "@/utils/normalize";
import { Ots } from "@/utils/types";
import {
  User,
  FileText,
  Calendar,
  Clock,
  Signature,
} from "lucide-react";

export function OrderInfoSection({ orden }: { orden: Ots }) {
  const tz = getUserTimeZone();

  const getEstadoColor = (state: string) => {
    switch (state) {
      case "finalizado":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "en proceso":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelado":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="text-orange-500" size={20} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Información General
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID
            </label>
            <input
              type="text"
              value={orden.id}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Usuario
            </label>
            <div className="flex items-center space-x-2">
              <User size={16} className="text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={orden.tecnico?.fullName}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Formulario
            </label>
            <input
              type="text"
              value={orden.task?.code}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <textarea
              value={orden.cliente}
              readOnly
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comentario
            </label>
            <textarea
              value={orden.commentary || "Sin comentarios"}
              readOnly
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sucursal de cliente
            </label>
            <textarea
              value={orden.sucursal}
              readOnly
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Facility
            </label>
            <input
              type="text"
              value={orden.facility ?? "-"}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-2 text-sm font-medium rounded-lg ${getEstadoColor(
                  orden.state!
                )}`}
              >
                {capitalizeFirstLetter(orden.state!)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Creado
            </label>
            <input
              type="text"
              value={
                orden.Audit?.createdAt
                  ? formatDateForUser(orden.Audit?.createdAt, tz)
                  : "-"
              }
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora inicio
            </label>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={
                  orden.me_recibio
                    ? formatHourForUser(orden.me_recibio, tz)
                    : "No iniciado"
                }
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora fin
            </label>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={
                  orden.finalizado
                    ? formatHourForUser(orden.finalizado, tz)
                    : "En curso"
                }
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha completa
            </label>
            <div className="flex items-center space-x-2">
              <Calendar
                size={16}
                className="text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={
                  orden.Audit?.createdAt
                    ? formatForUser(orden.Audit?.createdAt, tz)
                    : "-"
                }
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Postergado por
            </label>
            <input
              type="text"
              value={orden.postergadoPor || "No postergado"}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Firma
            </label>
            {orden.firma ? (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
                <img
                  src={orden.firma}
                  alt="Firma"
                  className="w-full h-24 object-contain bg-white dark:bg-gray-800 rounded"
                />
              </div>
            ) : (
              <input
                type="text"
                value="Sin firma"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Firma del responsable
            </label>
            <div className="flex items-center space-x-2">
              <Signature
                size={16}
                className="text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={orden.aclaracion || "Sin firma"}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Última edición de formulario
            </label>
            <input
              type="text"
              value={
                orden.Audit?.updatedAt
                  ? formatForUser(orden.Audit?.updatedAt, tz)
                  : "No editado"
              }
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image solucioname
            </label>
            {orden.imageSolucioname ? (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
                <img
                  src={orden.imageSolucioname}
                  alt="Imagen solucioname"
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            ) : (
              <input
                type="text"
                value="Sin imagen"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

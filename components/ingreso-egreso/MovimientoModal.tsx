"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingresoService } from "@/utils/api/apiIngreso";
import toast from "react-hot-toast";
import { MovimientoIngresoEgreso } from "@/utils/types";
import { GoogleMapBox } from "../ui/GoogleMapBox";
import { useGeoPermission } from "@/hooks/useGeoPermission"; // 👈

export interface CreateMovimientoData {
  usuarioId: string;
  tipo: "INGRESO" | "EGRESO";
  reason: string;
  modo: "normal" | "eventual" | "viaje";
  ubicacion?: {
    direccion?: string;
    latitud?: number;
    longitud?: number;
  };
  observaciones?: string;
}

interface MovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimiento?: MovimientoIngresoEgreso;
  mode: "create" | "view";
}

const MovimientoModal = ({
  isOpen,
  onClose,
  movimiento,
  mode,
}: MovimientoModalProps) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateMovimientoData>({
    usuarioId: movimiento?.usuario.id || "",
    tipo: movimiento?.tipo || "INGRESO",
    reason: "",
    modo: "normal",
    ubicacion: movimiento?.ubicacion,
    observaciones: movimiento?.observaciones || "",
  });

  // ⬇️ Permiso / request nativo
  const { status, busy, request } = useGeoPermission();

  // En modo VIEW, setea datos desde "movimiento"
  useEffect(() => {
    if (isOpen && mode === "view" && movimiento) {
      setFormData({
        usuarioId: movimiento.usuario.id || "",
        tipo: movimiento.tipo,
        reason: movimiento.motivo || "",
        modo: movimiento.modo as "normal" | "eventual" | "viaje",
        ubicacion: movimiento.ubicacion,
        observaciones: movimiento.observaciones || "",
      });
    }
  }, [isOpen, mode, movimiento]);

  // En modo CREATE, si ya está concedido, pedimos coords al abrir y las guardamos
  useEffect(() => {
    if (!isOpen || mode !== "create") return;
    if (status !== "granted") return;
    (async () => {
      const pos = await request();
      if (pos) {
        setFormData((prev) => ({
          ...prev,
          ubicacion: {
            ...prev.ubicacion,
            latitud: pos.coords.latitude,
            longitud: pos.coords.longitude,
          },
        }));
      }
    })();
  }, [isOpen, mode, status, request]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        lan: formData.ubicacion?.latitud,
        lng: formData.ubicacion?.longitud,
        typeAction: formData.tipo.toLowerCase(),
        reason: formData.reason,
        modo: formData.modo,
      };
      return await ingresoService.createIngreso(payload);
    },
    onSuccess: () => {
      toast.success("Movimiento creado");
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Error al registrar el movimiento"
      );
    },
  });

  if (!isOpen) return null;

  const isReadOnly = mode === "view";

  // VIEW helpers
  const latView = movimiento?.ubicacion?.latitud;
  const lngView = movimiento?.ubicacion?.longitud;
  const hasCoordsView =
    typeof latView === "number" &&
    !Number.isNaN(latView) &&
    typeof lngView === "number" &&
    !Number.isNaN(lngView);

  // CREATE helpers (coords capturadas)
  const latCreate = formData.ubicacion?.latitud;
  const lngCreate = formData.ubicacion?.longitud;
  const hasCoordsCreate =
    typeof latCreate === "number" && typeof lngCreate === "number";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create" ? "Registrar Movimiento" : "Detalles del Movimiento"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isReadOnly) mutate();
          }}
          className="p-6 space-y-6"
        >
          {/* GRID principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fila 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tipo: e.target.value as "INGRESO" | "EGRESO",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              >
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modo de jornada *
              </label>
              <select
                value={formData.modo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    modo: e.target.value as "normal" | "eventual" | "viaje",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              >
                <option value="normal">Normal</option>
                <option value="eventual">Eventual</option>
                <option value="viaje">Viaje</option>
              </select>
            </div>

            {/* Fila 2: Motivo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo *
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ej: Inicio de jornada laboral, Visita a cliente, etc."
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Fila 3: Ubicación */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>

              {isReadOnly ? (
                hasCoordsView ? (
                  <div className="space-y-3">
                    <div className="h-80 rounded-lg overflow-hidden border">
                      <GoogleMapBox lat={latView as number} lng={lngView as number} />
                    </div>
                    {formData.ubicacion?.direccion && (
                      <p className="text-sm text-gray-600">
                        {formData.ubicacion.direccion}
                      </p>
                    )}
                    <a
                      href={`https://www.google.com/maps?q=${latView},${lngView}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Ver en Google Maps
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                    Sin ubicación
                  </div>
                )
              ) : (
                // CREATE: sin input manual, usamos permisos/coords
                <div className="space-y-2">
                  {hasCoordsCreate ? (
                    <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 px-3 py-2 text-sm">
                      <span className="text-green-800">
                        Ubicación lista: <b>{latCreate?.toFixed(5)}, {lngCreate?.toFixed(5)}</b>
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          const pos = await request();
                          if (pos) {
                            setFormData((prev) => ({
                              ...prev,
                              ubicacion: {
                                ...prev.ubicacion,
                                latitud: pos.coords.latitude,
                                longitud: pos.coords.longitude,
                              },
                            }));
                            toast.success("Ubicación actualizada.");
                          } else {
                            toast.error("No se pudo obtener la ubicación.");
                          }
                        }}
                        disabled={busy}
                        className="px-2 py-1 rounded bg-green-600 text-white disabled:opacity-50"
                      >
                        {busy ? "Actualizando..." : "Actualizar"}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
                      <span className="text-blue-800">
                        <button
                          type="button"
                          onClick={async () => {
                            const pos = await request();
                            if (pos) {
                              setFormData((prev) => ({
                                ...prev,
                                ubicacion: {
                                  ...prev.ubicacion,
                                  latitud: pos.coords.latitude,
                                  longitud: pos.coords.longitude,
                                },
                              }));
                              toast.success("Ubicación lista.");
                            } else {
                              toast.error("No se pudo obtener la ubicación.");
                            }
                          }}
                          disabled={busy}
                          className="underline disabled:opacity-50"
                        >
                          {busy ? "Obteniendo..." : "Usar mi ubicación actual"}
                        </button>
                      </span>
                    </div>
                  )}

                  {/* (Opcional) preview mini-mapa si ya hay coords */}
                  {hasCoordsCreate && (
                    <div className="h-56 rounded-lg overflow-hidden border">
                      <GoogleMapBox lat={latCreate as number} lng={lngCreate as number} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fila 4: Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observaciones: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Información adicional sobre el movimiento"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Sección de detalles (view) */}
          {mode === "view" && movimiento && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispositivo
                </label>
                <p className="text-sm text-gray-900">
                  {movimiento.dispositivo || "No especificado"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address
                </label>
                <p className="text-sm text-gray-900">
                  {movimiento.ipAddress || "No disponible"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registrado por
                </label>
                <p className="text-sm text-gray-900">
                  {movimiento.registradoPor || "Sistema"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de registro
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(movimiento.createdAt).toLocaleString("es-ES")}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          {!isReadOnly && (
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
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                disabled={isPending}
              >
                {isPending ? "Creando..." : "Confirmar"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MovimientoModal;

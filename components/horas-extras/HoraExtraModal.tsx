"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ingresoService } from "@/utils/api/apiIngreso";
import {
  Cliente,
  CrearHoraExtra,
  TipoHoraExtra,
  TiposAtencion,
} from "@/utils/types";
import { toZonedTime } from "date-fns-tz";
import { ClientService } from "@/utils/api/apiCliente";
import { useAuth } from "@/hooks/useAuth";

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
  const { user: authUser } = useAuth();

  const isSupervisor = useMemo(() => {
    const roles = (authUser as any)?.roles ?? [];
    return roles.some((r: any) =>
      ((typeof r === "string" ? r : r?.name) ?? "")
        .toString()
        .toLowerCase()
        .includes("supervisor")
    );
  }, [authUser]);

  const zonedNow = toZonedTime(new Date(), TIME_ZONE);

  const yyyy = zonedNow.getFullYear();
  const mm = String(zonedNow.getMonth() + 1).padStart(2, "0");
  const dd = String(zonedNow.getDate()).padStart(2, "0");
  const todayYmdISO = `${yyyy}-${mm}-${dd}`;
  const todayLabel = `${dd}/${mm}/${yyyy}`;

  const initialFormData: CrearHoraExtra = {
    lan: -27.411748784512017,
    lng: -59.00082803696277,
    horaInicio: "",
    horaFinal: "",
    razon: "",
    comentario: "",
    cliente: "",
    tipo: TipoHoraExtra.URGENCIA,
    tipoAtencion: undefined,
  };

  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [formData, setFormData] = useState<CrearHoraExtra>(initialFormData);

  const { data, isLoading: loadingClientes } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => ClientService.listarClientes(50, 0),
    staleTime: 5 * 60_000,
  });

  //normalizamos la respuesta del query
  const clientes: Cliente[] = data?.clients;

  const tipoOptions = useMemo(
    () => Object.values(TipoHoraExtra) as TipoHoraExtra[],
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "view" && horaExtra) {
      setFormData(horaExtra);
      return;
    }
    if (mode === "create") {
      setFormData(initialFormData);
      setStartTime("");
      setEndTime("");
    }
  }, [isOpen, mode, horaExtra]);

  const buildUtcIsoFromTime = (timeHHmm: string) => {
    const localWithOffset = `${todayYmdISO}T${timeHHmm}:00-03:00`;
    return new Date(localWithOffset).toISOString();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!startTime || !endTime)
        throw new Error("Completá horario de inicio y final.");
      if (!formData.cliente) throw new Error("Seleccioná un cliente.");

      const startIso = buildUtcIsoFromTime(startTime);
      const endIso = buildUtcIsoFromTime(endTime);

      if (new Date(endIso) <= new Date(startIso)) {
        throw new Error(
          "El horario final debe ser posterior al horario de inicio."
        );
      }

      const payload = {
        ...formData,
        horaInicio: startIso,
        horaFinal: endIso,
      };

      if (!isSupervisor || !payload.tipoAtencion) delete payload.tipoAtencion;

      console.log("📤 Payload hora extra:", payload);
      return ingresoService.createHorasExtras(payload);
    },
    onSuccess: () => {
      toast.success("Hora extra registrada");
      queryClient.invalidateQueries({ queryKey: ["horas-extras"] });
      setFormData(initialFormData);
      setStartTime("");
      setEndTime("");
      onClose();
    },
    onError: (e: any) => {
      toast.error(e?.message || "Error al registrar la hora extra");
    },
  });
  if (!isOpen) return null;

  const isReadOnly = mode === "view";

  const handleClose = () => {
    setFormData(initialFormData);
    setStartTime("");
    setEndTime("");
    onClose();
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
          {/* Subtítulo con la fecha actual */}
          <p className="text-sm text-gray-600 mt-2">Fecha: {todayLabel}</p>
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
            {/* Hora inicio (solo hora) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horario de inicio *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Hora final (solo hora) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horario final *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón *
            </label>
            <input
              type="text"
              value={formData.razon}
              onChange={(e) =>
                setFormData((p) => ({ ...p, razon: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: urgencia técnica, reparación, soporte, etc."
              required
              disabled={isReadOnly}
            />
          </div>

          <div
            className={`grid grid-cols-1 gap-6 ${
              isSupervisor ? "md:grid-cols-3" : "md:grid-cols-2"
            }`}
          >
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <select
                value={formData.cliente ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, cliente: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly || loadingClientes}
              >
                <option value="">
                  {loadingClientes ? "Cargando..." : "Seleccionar cliente"}
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id ?? ""}>
                    {c.name}
                  </option>
                ))}
              </select>
              {!loadingClientes && clientes.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No hay clientes disponibles.
                </p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    tipo: e.target.value as TipoHoraExtra,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              >
                {tipoOptions.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {isSupervisor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de atención {isReadOnly ? "" : "*"}
                </label>
                <select
                  value={formData.tipoAtencion ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      tipoAtencion: (e.target.value || undefined) as
                        | TiposAtencion
                        | undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required={!isReadOnly}
                  disabled={isReadOnly}
                >
                  <option value="">Seleccionar…</option>
                  <option value={TiposAtencion.Presencial}>Presencial</option>
                  <option value={TiposAtencion.Telefonica}>Telefónica</option>
                </select>
              </div>
            )}
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentario
            </label>
            <textarea
              value={formData.comentario}
              onChange={(e) =>
                setFormData((p) => ({ ...p, comentario: e.target.value }))
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
                onClick={handleClose}
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

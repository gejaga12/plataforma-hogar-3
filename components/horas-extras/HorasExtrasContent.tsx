"use client";

import {
  Calendar,
  Clock,
  Clock1,
  Download,
  Eye,
  User2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { cn } from "@/utils/cn";
import { ingresoService } from "@/utils/api/apiIngreso";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryClient } from "@/utils/query-client";
import { EstadoHoraExtra, HorasExtras } from "@/utils/types";
import {
  getStateBadgeHoras,
  getTypeBadgeSwitch,
  getTypeLabelSwitch,
  normalizeTipoHoraExtra,
} from "../ui/EstadosBadge";
import { capitalizeFirstLetter } from "@/utils/normalize";
import HoraExtraDetalleModal from "./HorasExtrasDetalle";
import {
  formatDateForUser,
  formatHourForUser,
  getUserTimeZone,
} from "@/utils/formatDate";

const estadoLabel: Record<EstadoHoraExtra, string> = {
  [EstadoHoraExtra.PENDIENTE]: "Pendiente",
  [EstadoHoraExtra.APPROVED]: "Aprobado",
  [EstadoHoraExtra.NOAPPROVED]: "Rechazado",
};

const HorasExtrasContent = () => {
  const tz = getUserTimeZone();

  const [estadoFiltro, setEstadoFiltro] = useState<EstadoHoraExtra | "">("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("");
  const [clienteFiltro, setClienteFiltro] = useState<string>("");
  const [solicitanteFiltro, setSolicitanteFiltro] = useState<string>("");
  const [tipoAtencionFiltro, setTipoAtencionFiltro] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedHoraExtra, setSelectedHoraExtra] =
    useState<HorasExtras | null>(null);

  const { data: horasExtras = [], isLoading } = useQuery<HorasExtras[]>({
    queryKey: ["horas-extras"],
    queryFn: () => ingresoService.fetchHorasExtras({ limit: 20 }),
    staleTime: 5000 * 60,
    refetchOnWindowFocus: false,
  });
  // console.log("horas extras traidas:", horasExtras);

  const { mutate: mutateAprobacion, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      ingresoService.aprobarHoraExtra(id, approved),
    onSuccess: () => {
      toast.success("Solicitud actualizada");
      queryClient.invalidateQueries({ queryKey: ["horas-extras"] });
    },
    onError: () => {
      toast.error("Error al aprobar o rechazar la solicitud.");
    },
  });

  const clearFilters = () => {
    setEstadoFiltro("");
    setTipoFiltro("");
    setClienteFiltro("");
    setSolicitanteFiltro("");
    setTipoAtencionFiltro("");
  };

  const tipoOptions = useMemo(() => {
    const set = new Set<string>();
    (horasExtras ?? []).forEach((h) => {
      if (h.tipo) set.add(String(h.tipo).toLowerCase());
    });
    return Array.from(set);
  }, [horasExtras]);

  const clienteOptions = useMemo(() => {
    const map = new Map<string, string>(); // id -> name
    (horasExtras ?? []).forEach((h) => {
      if (h.cliente?.id) map.set(h.cliente.id, h.cliente.name ?? h.cliente.id);
    });
    // Orden alfabético por name
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [horasExtras]);

  const solicitanteOptions = useMemo(() => {
    const set = new Set<string>();
    (horasExtras ?? []).forEach((h) => {
      if (h.solicitante) set.add(String(h.solicitante).trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [horasExtras]);

  const tipoAtencionOptions = useMemo(() => {
    const set = new Set<string>();
    (horasExtras ?? []).forEach((h) => {
      if (h.tipoAtencion) set.add(String(h.tipoAtencion));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [horasExtras]);

  const filtered = (horasExtras ?? []).filter((h) => {
    // Estado
    let matchesEstado = true;
    if (estadoFiltro) matchesEstado = h.state === estadoFiltro;

    let matchesTipo = true;
    if (tipoFiltro) matchesTipo = String(h.tipo).toLowerCase() === tipoFiltro;

    // Cliente (por id)
    let matchesCliente = true;
    if (clienteFiltro) matchesCliente = h.cliente?.id === clienteFiltro;

    // Solicitante (case-insensitive, exacto)
    let matchesSolicitante = true;
    if (solicitanteFiltro) {
      matchesSolicitante =
        String(h.solicitante).toLowerCase() === solicitanteFiltro.toLowerCase();
    }

    // Tipo de atención (case-insensitive, exacto)
    let matchesTipoAtencion = true;
    if (tipoAtencionFiltro) {
      matchesTipoAtencion =
        String(h.tipoAtencion ?? "").toLowerCase() ===
        tipoAtencionFiltro.toLowerCase();
    }

    return (
      matchesEstado &&
      matchesTipo &&
      matchesCliente &&
      matchesSolicitante &&
      matchesTipoAtencion
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando horas extras...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <div className="flex gap-2 items-center">
            <Calendar size={20} />
            <h2 className="text-2xl font-bold text-gray-900">Horas Extras</h2>
          </div>
          <p className="text-gray-600 mt-1">
            Gestión de solicitudes y registros de horas extra
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => console.log("clicked")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Download size={20} />
            <span>Exportar a Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          {/* Búsqueda (más chica) */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-transparent mb-1">
              &nbsp;
            </label>
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
              title="Limpiar todos los filtros"
            >
              {/* Lucide: RotateCcw */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 2v6h6" />
                <path d="M3.05 11A9 9 0 1 0 6 5.3L3 8" />
              </svg>
              <span>Limpiar filtros</span>
            </button>
          </div>

          {/* Estado */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) =>
                setEstadoFiltro(e.target.value as EstadoHoraExtra | "")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="no aprobado">No aprobado</option>
            </select>
          </div>

          {/* Tipo de hora extra */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {tipoOptions.map((t) => (
                <option key={t} value={t}>
                  {getTypeLabelSwitch(normalizeTipoHoraExtra(t))}
                </option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {clienteOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Solicitante */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solicitante
            </label>
            <select
              value={solicitanteFiltro}
              onChange={(e) => setSolicitanteFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {solicitanteOptions.map((s) => (
                <option key={s} value={s}>
                  {capitalizeFirstLetter(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de atención */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de atención
            </label>
            <select
              value={tipoAtencionFiltro}
              onChange={(e) => setTipoAtencionFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {tipoAtencionOptions.map((ta) => (
                <option key={ta} value={ta}>
                  {capitalizeFirstLetter(ta)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Solicitante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha Solicitud
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hora Inicio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hora Final
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo Hora extra
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo Atencion
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((h, index) => (
                <tr
                  key={index}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selected.includes(index) && "bg-orange-50"
                  )}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <User2
                      size={14}
                      className="inline mr-1 mb-0.5 text-gray-400"
                    />
                    {capitalizeFirstLetter(h.solicitante)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">
                    {h.cliente?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Calendar
                      size={14}
                      className="inline mr-1 mb-0.5 text-gray-400"
                    />
                    {formatDateForUser(h.fechaSolicitud, tz)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Clock1
                      size={14}
                      className="inline mr-1 mb-0.5 text-gray-400"
                    />
                    {formatHourForUser(h.horaInicio, tz)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Clock1
                      size={14}
                      className="inline mr-1 mb-0.5 text-gray-400"
                    />
                    {formatHourForUser(h.horaFinal, tz)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">
                    {(() => {
                      const tipo = normalizeTipoHoraExtra(h.tipo);
                      return (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeSwitch(
                            tipo
                          )}`}
                        >
                          {getTypeLabelSwitch(tipo)}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">
                    {capitalizeFirstLetter(h.tipoAtencion ?? "-")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateBadgeHoras(
                        h.state
                      )}`}
                    >
                      {estadoLabel[h.state]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedHoraExtra(h)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900">
              No hay solicitudes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {estadoFiltro ||
              tipoFiltro ||
              clienteFiltro ||
              solicitanteFiltro ||
              tipoAtencionFiltro
                ? "No se encontraron horas extras con los filtros aplicados."
                : "No hay solicitudes de horas extras registradas en este momento."}
            </p>
          </div>
        )}
      </div>

      <HoraExtraDetalleModal
        isOpen={!!selectedHoraExtra}
        onClose={() => setSelectedHoraExtra(null)}
        horaExtra={selectedHoraExtra}
        onDecision={(id, approved) => mutateAprobacion({ id, approved })}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default HorasExtrasContent;

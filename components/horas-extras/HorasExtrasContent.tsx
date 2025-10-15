"use client";

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  Search,
} from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { cn } from "@/utils/cn";
import { ingresoService } from "@/utils/api/apiIngreso";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryClient } from "@/utils/query-client";
import { EstadoHoraExtra, HorasExtras } from "@/utils/types";
import { getStateBadgeHoras } from "../ui/EstadosBadge";
import { capitalizeFirstLetter } from "@/utils/normalize";
import HoraExtraDetalleModal from "./HorasExtrasDetalle";

type SortField = "horaInicio" | "horaFinal" | "razon";
type SortDirection = "asc" | "desc";

const HorasExtrasContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoHoraExtra | "">("");
  const [selected, setSelected] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>("horaInicio");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedHoraExtra, setSelectedHoraExtra] =
    useState<HorasExtras | null>(null);

  const { data: horasExtras = [], isLoading } = useQuery<HorasExtras[]>({
    queryKey: ["horas-extras"],
    queryFn: () => ingresoService.fetchHorasExtras({ limit: 20 }),
    staleTime: 5000 * 60,
    refetchOnWindowFocus: false,
  });

  console.log("horas extras traidas:", horasExtras);

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

  const filtered = (horasExtras ?? []).filter((h) => {
    let matchesEstado = true;

    if (estadoFiltro) {
      matchesEstado = h.state === estadoFiltro;
    }

    return matchesEstado;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
    >
      <span>{children}</span>
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ChevronUp size={14} />
        ) : (
          <ChevronDown size={14} />
        ))}
    </button>
  );

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Búsqueda */}
          <div className="relative md:col-span-3">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por razón o comentario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === sorted.length && sorted.length > 0
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? sorted.map((_, i) => i) : []
                      )
                    }
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Solicitante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortButton field="horaInicio">Hora Inicio</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortButton field="horaFinal">Hora Final</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortButton field="razon">Razón</SortButton>
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
              {sorted.map((h, index) => (
                <tr
                  key={index}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selected.includes(index) && "bg-orange-50"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(index)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, index]
                            : selected.filter((s) => s !== index)
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {capitalizeFirstLetter(h.solicitante)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Calendar size={14} className="inline mr-1 text-gray-400" />
                    {h.horaInicio}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {h.horaFinal}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate">
                    {h.razon}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateBadgeHoras(
                        h.state
                      )}`}
                    >
                      {capitalizeFirstLetter(h.state)}
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

        {sorted.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900">
              No hay solicitudes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || estadoFiltro
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

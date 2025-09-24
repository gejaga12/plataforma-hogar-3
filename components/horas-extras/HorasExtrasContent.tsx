"use client";

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  MapPin,
  Search,
} from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { cn } from "@/utils/cn";
import { HoraExtra, ingresoService } from "@/api/apiIngreso";
import { useQuery } from "@tanstack/react-query";

type SortField = "horaInicio" | "horaFinal" | "razon";
type SortDirection = "asc" | "desc";

const HorasExtrasContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>("horaInicio");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data: horasExtras = [], isLoading } = useQuery<HoraExtra[]>({
    queryKey: ["horas-extras"],
    queryFn: () => ingresoService.fetchHorasExtras({ limit: 20 }),
    staleTime: 5000 * 60,
    refetchOnWindowFocus: false,
  });

  const filtered = (horasExtras ?? []).filter((h) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      h.razon.toLowerCase().includes(searchLower) ||
      (h.comentario?.toLowerCase().includes(searchLower) ?? false);

    let matchesFecha = true;
    if (fechaDesde || fechaHasta) {
      const inicio = new Date(h.horaInicio);
      if (fechaDesde) {
        matchesFecha = matchesFecha && inicio >= new Date(fechaDesde);
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        matchesFecha = matchesFecha && inicio <= hasta;
      }
    }

    return matchesSearch && matchesFecha;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "horaInicio" || sortField === "horaFinal") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

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

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
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

          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
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
                  <SortButton field="horaInicio">Hora Inicio</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortButton field="horaFinal">Hora Final</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortButton field="razon">Razón</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Comentario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ubicación
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
                    <Calendar size={14} className="inline mr-1 text-gray-400" />
                    {formatDateTime(h.horaInicio)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDateTime(h.horaFinal)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{h.razon}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {h.comentario || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {h.lan && h.lng ? (
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span>
                          {h.lan}, {h.lng}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Ver detalle"
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
              {searchTerm || fechaDesde || fechaHasta
                ? "No se encontraron horas extras con los filtros aplicados."
                : "No hay solicitudes de horas extras registradas en este momento."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorasExtrasContent;

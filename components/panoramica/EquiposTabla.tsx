"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  QrCode,
  Download,
  Eye,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { QRButton } from "@/components/ui/QRButton";
import { TagEstado } from "@/components/ui/TagEstado";
import { cn } from "@/utils/cn";
import { Equipo } from "@/utils/types";

interface EquiposTablaProps {
  equipos: Equipo[];
}

interface FiltrosEquipos {
  tipo: string;
  estado: string;
  marca: string;
  busqueda: string;
}

export function EquiposTabla({ equipos }: EquiposTablaProps) {
  const [filtros, setFiltros] = useState<FiltrosEquipos>({
    tipo: "",
    estado: "",
    marca: "",
    busqueda: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof Equipo>("type");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Obtener valores únicos para los filtros
  const tiposUnicos = Array.from(new Set(equipos.map((e) => e.type)));

  // Manejar cambios en los filtros
  const handleFiltroChange = (key: keyof FiltrosEquipos, value: string) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Resetear filtros
  const handleResetFiltros = () => {
    setFiltros({
      tipo: "",
      estado: "",
      marca: "",
      busqueda: "",
    });
  };

  // Manejar ordenamiento
  const handleSort = (field: keyof Equipo) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Componente para el botón de ordenamiento
  const SortButton = ({
    field,
    children,
  }: {
    field: keyof Equipo;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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

  // Verificar si hay filtros activos
  const hasActiveFilters =
    filtros.tipo || filtros.estado || filtros.marca || filtros.busqueda;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y botón de filtros */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar equipos..."
            value={filtros.busqueda}
            onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Tabla de equipos */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="type">Tipo</SortButton>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Marca/Modelo
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Instalación
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  QR
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {equipos.map((equipo, index) => (
                <tr
                  key={equipo.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    index % 2 === 1 && "bg-gray-50 dark:bg-gray-750"
                  )}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {equipo.type}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="Descargar QR"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Cliente, Sucursal } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { Building, ChevronRight, Filter, Layers } from "lucide-react";
import { useState } from "react";
import { FiltrosPanoramica } from "./FiltrosPanoramica";
import { cn } from "@/utils/cn";
import { LoadingSpinner } from "../ui/loading-spinner";
import { MapaSucursales } from "./MapaSucursales";
import { SucursalPanel } from "./SucursalPanel";
import { SucursalesService } from "@/api/apiSucursales";

export interface FiltrosSucursales {
  estado?: "activo" | "inactivo" | "";
  clienteId?: string;
  busqueda?: string;
}

const PanoramicaContent = () => {
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(
    null
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosSucursales>({
    estado: "",
    clienteId: "",
    busqueda: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: sucursalesCombinadas = [], isLoading } = useQuery<Sucursal[]>({
    queryKey: ["sucursales-panoramica"],
    queryFn: async () => {
      const [sucursalesClientes, sucursalesHogar] = await Promise.all([
        SucursalesService.listarSucursales(), // devuelve sucursales de clientes
        SucursalesService.getAllSucursalesHogar(), // devuelve sucursales hogar
      ]);

      // Unimos ambas listas
      return [...sucursalesClientes, ...sucursalesHogar];
    },
  });

  const handleSelectSucursal = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleFiltroChange = (key: keyof FiltrosSucursales, value: string) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFiltros = () => {
    setFiltros({
      estado: "",
      clienteId: "",
      busqueda: "",
    });
  };

  // Filtrar sucursales según los filtros aplicados
  const filteredSucursales =
    sucursalesCombinadas?.filter((sucursal) => {
      const matchesEstado =
        !filtros.estado || sucursal.estado === filtros.estado;

      const matchesCliente =
        !filtros.clienteId ||
        (sucursal.cliente as Cliente)?.id === filtros.clienteId;

      const matchesBusqueda =
        !filtros.busqueda ||
        sucursal.name.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        sucursal.address
          ?.toLowerCase()
          .includes(filtros.busqueda.toLowerCase());

      return matchesEstado && matchesCliente && matchesBusqueda;
    }) || [];

  // Obtener lista única de clientes para el filtro
  const clientesUnicos: Cliente[] = sucursalesCombinadas
    ? Array.from(
        new Map(
          sucursalesCombinadas
            .filter((s) => s.cliente)
            .map((s) => [(s.cliente! as Cliente).id, s.cliente! as Cliente])
        ).values()
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            🗺️ Mapa Panorámico de Sucursales
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualiza todas las sucursales y equipos en un mapa interactivo
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <Filter size={16} />
          <span>Filtros</span>
        </button>
      </div>

      {/* Filtros - Responsive */}
      <div className={cn("md:block", showFilters ? "block" : "hidden")}>
        <FiltrosPanoramica
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onResetFiltros={handleResetFiltros}
          clientes={clientesUnicos}
        />
      </div>

      {/* Mapa y Panel */}
      <div className="relative">
        {/* Mapa */}
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300",
            isPanelOpen ? "lg:mr-80" : ""
          )}
        >
          <div className="h-[calc(100vh-240px)] min-h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Cargando mapa y sucursales...
                  </p>
                </div>
              </div>
            ) : (
              <MapaSucursales
                sucursales={filteredSucursales}
                onSelect={handleSelectSucursal}
                selectedSucursalId={selectedSucursal?.id}
              />
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div
          className={cn(
            "fixed top-[64px] bottom-0 right-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 transition-transform transform-gpu",
            isPanelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {selectedSucursal && (
            <SucursalPanel
              sucursal={selectedSucursal}
              onClose={handleClosePanel}
            />
          )}
        </div>

        {/* Botón para abrir/cerrar panel en móvil */}
        {isPanelOpen && (
          <button
            onClick={handleClosePanel}
            className="fixed top-1/2 right-80 transform -translate-y-1/2 -translate-x-6 z-50 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 lg:hidden"
          >
            <ChevronRight
              className="text-gray-600 dark:text-gray-400"
              size={20}
            />
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Sucursales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredSucursales.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Building
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sucursales Activas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredSucursales.filter((s) => s.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Building
                className="text-green-600 dark:text-green-400"
                size={24}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sucursales Inactivas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredSucursales.filter((s) => s.isActive === false).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Building className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Equipos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredSucursales.reduce(
                  (total: any, sucursal: any) =>
                    total + (sucursal.equipos?.length || 0),
                  0
                )}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Layers
                className="text-orange-600 dark:text-orange-400"
                size={24}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanoramicaContent;

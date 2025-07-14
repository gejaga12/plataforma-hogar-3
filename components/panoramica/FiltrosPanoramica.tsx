'use client';

import { useState } from 'react';
import { Search, Filter, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { FiltrosSucursales } from '@/app/panoramica/page';
import { cn } from '@/lib/utils';

interface FiltrosPanoramicaProps {
  filtros: FiltrosSucursales;
  onFiltroChange: (key: keyof FiltrosSucursales, value: string) => void;
  onResetFiltros: () => void;
  clientes: string[];
}

export function FiltrosPanoramica({ 
  filtros, 
  onFiltroChange, 
  onResetFiltros,
  clientes
}: FiltrosPanoramicaProps) {
  const [expandedFilters, setExpandedFilters] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col space-y-4">
        {/* Barra de búsqueda siempre visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={filtros.busqueda}
            onChange={(e) => onFiltroChange('busqueda', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Botón para expandir/colapsar filtros */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <Filter size={16} />
            <span>Filtros avanzados</span>
            {expandedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {(filtros.tipo || filtros.estado || filtros.cliente) && (
            <button
              onClick={onResetFiltros}
              className="flex items-center space-x-1 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Filtros expandibles */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-300",
          expandedFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => onFiltroChange('tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los tipos</option>
              <option value="hogar">Sucursales Hogar</option>
              <option value="cliente">Sucursales Cliente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => onFiltroChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <select
              value={filtros.cliente}
              onChange={(e) => onFiltroChange('cliente', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente} value={cliente}>{cliente}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Indicadores de filtros activos */}
        {(filtros.tipo || filtros.estado || filtros.cliente) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filtros.tipo && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                Tipo: {filtros.tipo === 'hogar' ? 'Hogar' : 'Cliente'}
              </span>
            )}
            {filtros.estado && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                Estado: {filtros.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            )}
            {filtros.cliente && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs font-medium rounded-full">
                Cliente: {filtros.cliente}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
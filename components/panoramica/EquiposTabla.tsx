'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  QrCode, 
  Download, 
  Eye, 
  ChevronUp, 
  ChevronDown,
  X
} from 'lucide-react';
import { Equipo } from '@/app/panoramica/page';
import { QRButton } from '@/components/ui/QRButton';
import { TagEstado } from '@/components/ui/TagEstado';
import { cn } from '@/lib/utils';

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
    tipo: '',
    estado: '',
    marca: '',
    busqueda: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof Equipo>('tipo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Obtener valores únicos para los filtros
  const tiposUnicos = Array.from(new Set(equipos.map(e => e.tipo)));
  const marcasUnicas = Array.from(new Set(equipos.map(e => e.marca)));

  // Manejar cambios en los filtros
  const handleFiltroChange = (key: keyof FiltrosEquipos, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Resetear filtros
  const handleResetFiltros = () => {
    setFiltros({
      tipo: '',
      estado: '',
      marca: '',
      busqueda: ''
    });
  };

  // Manejar ordenamiento
  const handleSort = (field: keyof Equipo) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtrar equipos
  const filteredEquipos = equipos.filter(equipo => {
    const matchesTipo = !filtros.tipo || equipo.tipo === filtros.tipo;
    const matchesEstado = !filtros.estado || equipo.estado === filtros.estado;
    const matchesMarca = !filtros.marca || equipo.marca === filtros.marca;
    const matchesBusqueda = !filtros.busqueda || 
      equipo.tipo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      equipo.marca.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      equipo.modelo.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    return matchesTipo && matchesEstado && matchesMarca && matchesBusqueda;
  });

  // Ordenar equipos
  const sortedEquipos = [...filteredEquipos].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'fechaInstalacion' || sortField === 'ultimoMantenimiento' || sortField === 'proximoMantenimiento') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Componente para el botón de ordenamiento
  const SortButton = ({ field, children }: { field: keyof Equipo; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      )}
    </button>
  );

  // Verificar si hay filtros activos
  const hasActiveFilters = filtros.tipo || filtros.estado || filtros.marca || filtros.busqueda;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y botón de filtros */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Buscar equipos..."
            value={filtros.busqueda}
            onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
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

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Filtros</h4>
            {hasActiveFilters && (
              <button
                onClick={handleResetFiltros}
                className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Todos</option>
                {tiposUnicos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="en_reparacion">En reparación</option>
                <option value="dado_de_baja">Dado de baja</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Marca
              </label>
              <select
                value={filtros.marca}
                onChange={(e) => handleFiltroChange('marca', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Todas</option>
                {marcasUnicas.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Indicadores de filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1 pt-2">
              {filtros.tipo && (
                <div className="flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                  <span>Tipo: {filtros.tipo}</span>
                  <button 
                    onClick={() => handleFiltroChange('tipo', '')}
                    className="ml-1 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {filtros.estado && (
                <div className="flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                  <span>Estado: {filtros.estado}</span>
                  <button 
                    onClick={() => handleFiltroChange('estado', '')}
                    className="ml-1 hover:text-green-900 dark:hover:text-green-300"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {filtros.marca && (
                <div className="flex items-center px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs font-medium rounded-full">
                  <span>Marca: {filtros.marca}</span>
                  <button 
                    onClick={() => handleFiltroChange('marca', '')}
                    className="ml-1 hover:text-purple-900 dark:hover:text-purple-300"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabla de equipos */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="tipo">Tipo</SortButton>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="marca">Marca/Modelo</SortButton>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="fechaInstalacion">Instalación</SortButton>
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
              {sortedEquipos.map((equipo, index) => (
                <tr 
                  key={equipo.id} 
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    index % 2 === 1 && "bg-gray-50 dark:bg-gray-750"
                  )}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {equipo.tipo}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{equipo.marca}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{equipo.modelo}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <TagEstado estado={equipo.estado} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(equipo.fechaInstalacion).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <QRButton qrCodeUrl={equipo.qrCode} />
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

        {sortedEquipos.length === 0 && (
          <div className="text-center py-8">
            <QrCode className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-900 dark:text-gray-100">No hay equipos</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Object.values(filtros).some(v => v !== '') 
                ? 'No se encontraron equipos con los filtros aplicados'
                : 'Esta sucursal no tiene equipos registrados'}
            </p>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      {sortedEquipos.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Mostrando {sortedEquipos.length} de {equipos.length} equipos
        </div>
      )}
    </div>
  );
}
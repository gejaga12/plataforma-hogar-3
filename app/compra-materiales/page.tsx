'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Filter, 
  Search, 
  Eye,
  Edit,
  Download,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface CompraMaterialData {
  id: string;
  gestionAdmin: 'Procesando' | 'Completado' | 'Pendiente' | 'Cancelado';
  aprobacionSup: 'Sí' | 'No' | 'Pendiente';
  tecnico: string;
  estado: 'Finalizado' | 'Pendiente' | 'En proceso' | 'Cancelado';
  horaInicio: string | null;
  horaFin: string | null;
  minutosTrabajado: number | null;
  fecha: string;
  ordenTrabajo: string | null;
  factura: string | null;
}

// Mock data
const mockCompraMateriales: CompraMaterialData[] = [
  {
    id: 'CM-001',
    gestionAdmin: 'Procesando',
    aprobacionSup: 'No',
    tecnico: 'Juan Carlos Pérez',
    estado: 'Finalizado',
    horaInicio: '08:30',
    horaFin: '11:45',
    minutosTrabajado: 195,
    fecha: '09/06/2025',
    ordenTrabajo: 'OT-2025-001',
    factura: 'FC-001-2025'
  },
  {
    id: 'CM-002',
    gestionAdmin: 'Completado',
    aprobacionSup: 'Sí',
    tecnico: 'María González López',
    estado: 'Finalizado',
    horaInicio: '09:00',
    horaFin: '12:01',
    minutosTrabajado: 181,
    fecha: '08/06/2025',
    ordenTrabajo: 'OT-2025-002',
    factura: null
  },
  {
    id: 'CM-003',
    gestionAdmin: 'Procesando',
    aprobacionSup: 'Pendiente',
    tecnico: 'Carlos Rodríguez',
    estado: 'En proceso',
    horaInicio: '14:00',
    horaFin: null,
    minutosTrabajado: null,
    fecha: '10/06/2025',
    ordenTrabajo: 'OT-2025-003',
    factura: null
  },
  {
    id: 'CM-004',
    gestionAdmin: 'Pendiente',
    aprobacionSup: 'No',
    tecnico: 'Ana López Martínez',
    estado: 'Pendiente',
    horaInicio: null,
    horaFin: null,
    minutosTrabajado: null,
    fecha: '07/06/2025',
    ordenTrabajo: null,
    factura: null
  },
  {
    id: 'CM-005',
    gestionAdmin: 'Procesando',
    aprobacionSup: 'Sí',
    tecnico: 'Pedro Martín Silva',
    estado: 'Finalizado',
    horaInicio: '10:15',
    horaFin: '15:30',
    minutosTrabajado: 315,
    fecha: '11/06/2025',
    ordenTrabajo: 'OT-2025-005',
    factura: 'FC-005-2025'
  },
  {
    id: 'CM-006',
    gestionAdmin: 'Cancelado',
    aprobacionSup: 'No',
    tecnico: 'Luis Fernando García',
    estado: 'Cancelado',
    horaInicio: '13:45',
    horaFin: '14:00',
    minutosTrabajado: 15,
    fecha: '06/06/2025',
    ordenTrabajo: 'OT-2025-006',
    factura: null
  }
];

const fetchCompraMateriales = async (): Promise<CompraMaterialData[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockCompraMateriales;
};

const gestionAdminConfig = {
  'Procesando': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'Completado': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'Cancelado': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

const aprobacionSupConfig = {
  'Sí': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'No': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
};

const estadoConfig = {
  'Finalizado': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'En proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

type SortField = 'id' | 'fecha' | 'tecnico' | 'minutosTrabajado';
type SortDirection = 'asc' | 'desc';

function CompraMaterialesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const { data: compraMateriales, isLoading } = useQuery({
    queryKey: ['compra-materiales'],
    queryFn: fetchCompraMateriales,
  });

  const filteredItems = compraMateriales?.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.id.toLowerCase().includes(searchLower) ||
      item.tecnico.toLowerCase().includes(searchLower) ||
      item.ordenTrabajo?.toLowerCase().includes(searchLower) ||
      item.factura?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'fecha') {
      // Convert dd/mm/yyyy to comparable format
      const [aDay, aMonth, aYear] = a.fecha.split('/');
      const [bDay, bMonth, bYear] = b.fecha.split('/');
      aValue = `${aYear}-${aMonth}-${aDay}`;
      bValue = `${bYear}-${bMonth}-${bDay}`;
    }
    
    if (sortField === 'minutosTrabajado') {
      aValue = a.minutosTrabajado || 0;
      bValue = b.minutosTrabajado || 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(sortedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleExportToExcel = () => {
    console.log('Exportar a Excel');
    // Aquí implementarías la lógica de exportación
  };

  const handleViewItem = (itemId: string) => {
    console.log('Ver detalle:', itemId);
  };

  const handleEditItem = (itemId: string) => {
    console.log('Editar:', itemId);
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando formularios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Formularios – Compra de Materiales</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las solicitudes de compra de materiales
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={handleExportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Download size={20} />
            <span>Exportar a Excel</span>
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Filter size={20} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Filters Modal/Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gestión Admin</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Todos</option>
                <option value="Procesando">Procesando</option>
                <option value="Completado">Completado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aprobación Sup</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Todos</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Todos</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Técnico</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Todos</option>
                {Array.from(new Set(compraMateriales?.map(item => item.tecnico) || [])).map(tecnico => (
                  <option key={tecnico} value={tecnico}>{tecnico}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === sortedItems.length && sortedItems.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="id">ID</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gestión Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aprobación Sup
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="tecnico">Técnico</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hora inicio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hora fin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="minutosTrabajado">Minutos trabajado</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="fecha">Fecha</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orden de Trabajo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedItems.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    selectedItems.includes(item.id) && 'bg-orange-50 dark:bg-orange-900/20',
                    index % 2 === 1 && 'bg-gray-25 dark:bg-gray-800/50'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      gestionAdminConfig[item.gestionAdmin]
                    )}>
                      {item.gestionAdmin}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      aprobacionSupConfig[item.aprobacionSup]
                    )}>
                      {item.aprobacionSup}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-32 truncate" title={item.tecnico}>
                      {item.tecnico}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      estadoConfig[item.estado]
                    )}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.horaInicio || <span className="text-gray-400 dark:text-gray-500 italic">–</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.horaFin || <span className="text-gray-400 dark:text-gray-500 italic">–</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                    {item.minutosTrabajado || <span className="text-gray-400 dark:text-gray-500 italic">–</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.fecha}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-24 truncate" title={item.ordenTrabajo || 'Sin OT'}>
                      {item.ordenTrabajo ? (
                        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
                          {item.ordenTrabajo}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">–</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-24 truncate" title={item.factura || 'Sin factura'}>
                      {item.factura || <span className="text-gray-400 dark:text-gray-500 italic">–</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewItem(item.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditItem(item.id)}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <MoreHorizontal className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No hay formularios</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'No se encontraron formularios con el término de búsqueda.'
                : 'No hay formularios de compra de materiales registrados.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedItems.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span className="font-medium">{sortedItems.length}</span> formularios
            {selectedItems.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedItems.length}</span> seleccionados)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Página 1 de 1</span>
            <div className="flex space-x-1">
              <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300" disabled>
                Anterior
              </button>
              <button className="px-3 py-1 text-sm bg-orange-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300" disabled>
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompraMaterialesPage() {
  return (
    <ProtectedLayout>
      <CompraMaterialesContent />
    </ProtectedLayout>
  );
}
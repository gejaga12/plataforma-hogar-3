'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Filter, 
  Search, 
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/utils/cn';

interface OrderTableData {
  id: string;
  estadoGestion: 'Procesando' | 'Completado' | 'Pendiente' | 'Cancelado';
  formulario: string;
  tecnico: string;
  comentario: string | null;
  sucursal: string;
  estado: 'Pendiente' | 'Me recibo' | 'Finalizado' | 'En proceso';
  fecha: string;
  horaInicio: string | null;
  horaFin: string | null;
  cliente: string;
  sucursalCliente: string;
}

// Mock data
const mockOrders: OrderTableData[] = [
  {
    id: 'ORD-001',
    estadoGestion: 'Procesando',
    formulario: 'BSR-2021-SEMESTRAL',
    tecnico: 'Juan Carlos Pérez',
    comentario: 'Revisión completa del sistema eléctrico',
    sucursal: 'ZONA NOA',
    estado: 'Pendiente',
    fecha: '09/06/2025',
    horaInicio: '08:30',
    horaFin: null,
    cliente: 'Empresa Constructora\nSan Miguel S.A.',
    sucursalCliente: 'Av. Libertador 1234, CABA || Ruta 9 Km 45'
  },
  {
    id: 'ORD-002',
    estadoGestion: 'Completado',
    formulario: 'MNT-2024-TRIMESTRAL',
    tecnico: 'María González López',
    comentario: null,
    sucursal: 'ZONA CENTRO',
    estado: 'Finalizado',
    fecha: '08/06/2025',
    horaInicio: '09:00',
    horaFin: '17:30',
    cliente: 'Supermercados del Norte',
    sucursalCliente: 'Calle San Martín 567 || Acceso Norte'
  },
  {
    id: 'ORD-003',
    estadoGestion: 'Procesando',
    formulario: 'INS-2025-ANUAL',
    tecnico: 'Carlos Rodríguez',
    comentario: 'Instalación de nuevos equipos de climatización',
    sucursal: 'ZONA SUR',
    estado: 'Me recibo',
    fecha: '10/06/2025',
    horaInicio: '14:00',
    horaFin: null,
    cliente: 'Hospital Central\nDr. Ramón Carrillo',
    sucursalCliente: 'Av. 9 de Julio 890, Zona Sur || Ruta Provincial 11'
  },
  {
    id: 'ORD-004',
    estadoGestion: 'Pendiente',
    formulario: 'REP-2025-URGENTE',
    tecnico: 'Ana López Martínez',
    comentario: 'Reparación urgente de sistema de seguridad',
    sucursal: 'ZONA ESTE',
    estado: 'En proceso',
    fecha: '07/06/2025',
    horaInicio: '10:15',
    horaFin: '16:45',
    cliente: 'Banco Nacional',
    sucursalCliente: 'Plaza Central 123 || Autopista del Este Km 12'
  },
  {
    id: 'ORD-005',
    estadoGestion: 'Procesando',
    formulario: 'CHK-2025-MENSUAL',
    tecnico: 'Pedro Martín Silva',
    comentario: null,
    sucursal: 'ZONA OESTE',
    estado: 'Pendiente',
    fecha: '11/06/2025',
    horaInicio: null,
    horaFin: null,
    cliente: 'Centro Comercial\nLas Américas',
    sucursalCliente: 'Av. del Trabajo 456 || Ruta Nacional 7'
  }
];

const fetchOrders = async (): Promise<OrderTableData[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockOrders;
};

const estadoGestionConfig = {
  'Procesando': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'Completado': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'Cancelado': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

const estadoConfig = {
  'Pendiente': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'Me recibo': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'Finalizado': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'En proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
};

type SortField = 'id' | 'fecha' | 'tecnico' | 'cliente';
type SortDirection = 'asc' | 'desc';

function OrdersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const router = useRouter();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders-table'],
    queryFn: fetchOrders,
  });

  const filteredOrders = orders?.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.tecnico.toLowerCase().includes(searchLower) ||
      order.cliente.toLowerCase().includes(searchLower) ||
      order.formulario.toLowerCase().includes(searchLower) ||
      order.sucursal.toLowerCase().includes(searchLower)
    );
  }) || [];

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'fecha') {
      // Convert dd/mm/yyyy to comparable format
      const [aDay, aMonth, aYear] = a.fecha.split('/');
      const [bDay, bMonth, bYear] = b.fecha.split('/');
      aValue = `${aYear}-${aMonth}-${aDay}`;
      bValue = `${bYear}-${bMonth}-${bDay}`;
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
      setSelectedOrders(sortedOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: string) => {
    console.log('Editar orden:', orderId);
  };

  const handleDeleteOrder = (orderId: string) => {
    console.log('Eliminar orden:', orderId);
    // Aquí mostrarías un modal de confirmación
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Órdenes de Trabajo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona y da seguimiento a las órdenes de trabajo
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
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
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <Filter size={20} />
            <span>Filtros</span>
          </button>
          
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <Plus size={20} />
            <span>Crear Orden de Trabajo</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === sortedOrders.length && sortedOrders.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="id">ID</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado Gestión
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Formulario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="tecnico">Técnico</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Comentario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sucursal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="fecha">Fecha</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hora inicio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hora fin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="cliente">Cliente</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sucursal de cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedOrders.map((order, index) => (
                <tr 
                  key={order.id} 
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    selectedOrders.includes(order.id) && 'bg-orange-50 dark:bg-orange-900/20',
                    index % 2 === 1 && 'bg-gray-25 dark:bg-gray-800/50'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      estadoGestionConfig[order.estadoGestion]
                    )}>
                      {order.estadoGestion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {order.formulario}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-32 truncate" title={order.tecnico}>
                      {order.tecnico}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-40 truncate" title={order.comentario || 'Nulo'}>
                      {order.comentario || <span className="text-gray-400 dark:text-gray-500 italic">Nulo</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {order.sucursal}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      estadoConfig[order.estado]
                    )}>
                      {order.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {order.fecha}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {order.horaInicio || <span className="text-gray-400 dark:text-gray-500 italic">Nulo</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {order.horaFin || <span className="text-gray-400 dark:text-gray-500 italic">Nulo</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-32" title={order.cliente}>
                      {order.cliente.split('\n').map((line, i) => (
                        <div key={i} className="truncate">{line}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-40" title={order.sucursalCliente}>
                      {order.sucursalCliente.split(' || ').map((part, i) => (
                        <div key={i} className="truncate text-xs">
                          {part}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditOrder(order.id)}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <MoreHorizontal className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No hay órdenes</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'No se encontraron órdenes con el término de búsqueda.'
                : 'Comienza creando una nueva orden de trabajo.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      {sortedOrders.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span className="font-medium">{sortedOrders.length}</span> órdenes
            {selectedOrders.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedOrders.length}</span> seleccionadas)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Página 1 de 1
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedLayout>
      <OrdersContent />
    </ProtectedLayout>
  );
}
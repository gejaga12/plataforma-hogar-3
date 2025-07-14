'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  QrCode,
  Building2,
  Layers,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Interfaces
interface Deposito {
  id: string;
  nombre: string;
  ubicacion: string;
  responsable: string;
  capacidad: number;
  capacidadUtilizada: number;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  cantidadItems: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockDepositos: Deposito[] = [
  {
    id: 'DEP-001',
    nombre: 'Depósito Central',
    ubicacion: 'Av. Libertador 1234, CABA',
    responsable: 'Juan Pérez',
    capacidad: 1000,
    capacidadUtilizada: 750,
    estado: 'activo',
    cantidadItems: 450,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-05-15T14:30:00Z'
  },
  {
    id: 'DEP-002',
    nombre: 'Depósito Norte',
    ubicacion: 'Av. Cabildo 2500, CABA',
    responsable: 'María González',
    capacidad: 800,
    capacidadUtilizada: 400,
    estado: 'activo',
    cantidadItems: 280,
    createdAt: '2023-03-10T09:00:00Z',
    updatedAt: '2024-04-20T11:20:00Z'
  },
  {
    id: 'DEP-003',
    nombre: 'Depósito Sur',
    ubicacion: 'Av. Hipólito Yrigoyen 8175, Lomas de Zamora',
    responsable: 'Roberto Gómez',
    capacidad: 600,
    capacidadUtilizada: 580,
    estado: 'mantenimiento',
    cantidadItems: 320,
    createdAt: '2023-05-20T08:30:00Z',
    updatedAt: '2024-05-05T16:45:00Z'
  },
  {
    id: 'DEP-004',
    nombre: 'Depósito Oeste',
    ubicacion: 'Av. Rivadavia 14500, Ramos Mejía',
    responsable: 'Laura Sánchez',
    capacidad: 500,
    capacidadUtilizada: 100,
    estado: 'activo',
    cantidadItems: 75,
    createdAt: '2023-07-05T11:15:00Z',
    updatedAt: '2024-03-10T09:30:00Z'
  },
  {
    id: 'DEP-005',
    nombre: 'Depósito Córdoba',
    ubicacion: 'Av. Colón 1234, Córdoba',
    responsable: 'Javier Rodríguez',
    capacidad: 700,
    capacidadUtilizada: 350,
    estado: 'activo',
    cantidadItems: 210,
    createdAt: '2023-09-15T10:30:00Z',
    updatedAt: '2024-04-15T13:45:00Z'
  },
  {
    id: 'DEP-006',
    nombre: 'Depósito Rosario',
    ubicacion: 'Av. Pellegrini 1500, Rosario',
    responsable: 'Valeria Torres',
    capacidad: 600,
    capacidadUtilizada: 50,
    estado: 'inactivo',
    cantidadItems: 30,
    createdAt: '2023-11-20T09:45:00Z',
    updatedAt: '2024-02-05T10:15:00Z'
  }
];

// API functions
const fetchDepositos = async (): Promise<Deposito[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockDepositos;
};

// Component for deposit card
function DepositoCard({ deposito }: { deposito: Deposito }) {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactivo':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const porcentajeUtilizado = Math.round((deposito.capacidadUtilizada / deposito.capacidad) * 100);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Building2 className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{deposito.nombre}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{deposito.id}</p>
            </div>
          </div>
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            getEstadoColor(deposito.estado)
          )}>
            {deposito.estado.charAt(0).toUpperCase() + deposito.estado.slice(1)}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Package size={16} className="text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100">{deposito.cantidadItems} items</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Último actualizado: {new Date(deposito.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Capacidad utilizada</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{porcentajeUtilizado}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={cn(
                  "h-2.5 rounded-full",
                  porcentajeUtilizado > 90 ? "bg-red-600" : 
                  porcentajeUtilizado > 70 ? "bg-yellow-500" : 
                  "bg-green-600"
                )}
                style={{ width: `${porcentajeUtilizado}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {deposito.capacidadUtilizada} de {deposito.capacidad} unidades
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Responsable: {deposito.responsable}
          </div>
          <Link 
            href={`/depositos/${deposito.id}`}
            className="flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
          >
            Ver detalles
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DepositosContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: depositos, isLoading } = useQuery({
    queryKey: ['depositos'],
    queryFn: fetchDepositos,
  });

  const filteredDepositos = depositos?.filter(deposito => {
    const matchesSearch = deposito.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposito.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposito.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !estadoFilter || deposito.estado === estadoFilter;
    
    return matchesSearch && matchesEstado;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando depósitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🏭 Gestión de Depósitos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra tus depósitos y el inventario de items
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Link 
            href="/depositos/nuevo"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Depósito</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar depósitos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">En mantenimiento</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <Filter size={16} />
              <span>Filtros</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Advanced filters (hidden by default) */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Capacidad utilizada
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Cualquier capacidad</option>
                <option value="low">Baja (&lt; 30%)</option>
                <option value="medium">Media (30% - 70%)</option>
                <option value="high">Alta (&gt; 70%)</option>
                <option value="critical">Crítica (&gt; 90%)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad de items
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Cualquier cantidad</option>
                <option value="0-100">0 - 100 items</option>
                <option value="101-300">101 - 300 items</option>
                <option value="301-500">301 - 500 items</option>
                <option value="500+">Más de 500 items</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Última actualización
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Cualquier fecha</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Último trimestre</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Deposits Grid */}
      {filteredDepositos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepositos.map((deposito) => (
            <DepositoCard key={deposito.id} deposito={deposito} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay depósitos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || estadoFilter 
              ? 'No se encontraron depósitos con los filtros aplicados.'
              : 'Comienza creando un nuevo depósito.'
            }
          </p>
          <div className="mt-6">
            <Link
              href="/depositos/nuevo"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Plus size={16} className="mr-2" />
              Nuevo Depósito
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DepositosPage() {
  return (
    <ProtectedLayout>
      <DepositosContent />
    </ProtectedLayout>
  );
}
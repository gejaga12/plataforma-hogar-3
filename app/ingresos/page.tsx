'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  UserPlus,
  Calendar,
  Building,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ProcesoIngreso, EstadoPaso } from '@/lib/types';
import { cn } from '@/lib/utils';

// Mock data
const mockProcesos: ProcesoIngreso[] = [
  {
    id: 'ING-001',
    nombreIngresante: 'Ana María González',
    puesto: 'Desarrolladora Frontend',
    areaDestino: 'IT',
    fechaEstimadaIngreso: '2025-01-20',
    estadoGeneral: 'en_progreso',
    pasos: [],
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-12T14:30:00Z'
  },
  {
    id: 'ING-002',
    nombreIngresante: 'Carlos Eduardo Martínez',
    puesto: 'Técnico de Mantenimiento',
    areaDestino: 'Operaciones',
    fechaEstimadaIngreso: '2025-01-25',
    estadoGeneral: 'iniciado',
    pasos: [],
    createdAt: '2025-01-11T10:15:00Z',
    updatedAt: '2025-01-11T10:15:00Z'
  },
  {
    id: 'ING-003',
    nombreIngresante: 'María Fernanda López',
    puesto: 'Analista de RRHH',
    areaDestino: 'Recursos Humanos',
    fechaEstimadaIngreso: '2025-01-15',
    estadoGeneral: 'completado',
    pasos: [],
    createdAt: '2025-01-05T08:30:00Z',
    updatedAt: '2025-01-15T17:00:00Z'
  },
  {
    id: 'ING-004',
    nombreIngresante: 'Roberto Silva García',
    puesto: 'Supervisor de Calidad',
    areaDestino: 'Gestión de Calidad',
    fechaEstimadaIngreso: '2025-02-01',
    estadoGeneral: 'detenido',
    pasos: [],
    createdAt: '2025-01-08T11:45:00Z',
    updatedAt: '2025-01-13T16:20:00Z'
  }
];

const fetchProcesos = async (): Promise<ProcesoIngreso[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockProcesos;
};

const createProceso = async (data: Partial<ProcesoIngreso>): Promise<ProcesoIngreso> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newProceso: ProcesoIngreso = {
    id: `ING-${String(mockProcesos.length + 1).padStart(3, '0')}`,
    nombreIngresante: data.nombreIngresante || '',
    puesto: data.puesto || '',
    areaDestino: data.areaDestino || '',
    fechaEstimadaIngreso: data.fechaEstimadaIngreso || '',
    estadoGeneral: 'iniciado',
    pasos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newProceso;
};

interface CreateProcesoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ProcesoIngreso>) => void;
  isLoading: boolean;
}

function CreateProcesoModal({ isOpen, onClose, onSubmit, isLoading }: CreateProcesoModalProps) {
  const [formData, setFormData] = useState({
    nombreIngresante: '',
    puesto: '',
    areaDestino: '',
    fechaEstimadaIngreso: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Nuevo Proceso de Ingreso
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Ingresante *
            </label>
            <input
              type="text"
              value={formData.nombreIngresante}
              onChange={(e) => setFormData(prev => ({ ...prev, nombreIngresante: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Puesto *
            </label>
            <input
              type="text"
              value={formData.puesto}
              onChange={(e) => setFormData(prev => ({ ...prev, puesto: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área de Destino *
            </label>
            <select
              value={formData.areaDestino}
              onChange={(e) => setFormData(prev => ({ ...prev, areaDestino: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Seleccionar área</option>
              <option value="IT">IT</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
              <option value="Operaciones">Operaciones</option>
              <option value="Administración">Administración</option>
              <option value="Gestión de Calidad">Gestión de Calidad</option>
              <option value="Gestión de Activos">Gestión de Activos</option>
              <option value="Higiene y Seguridad">Higiene y Seguridad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Estimada de Ingreso *
            </label>
            <input
              type="date"
              value={formData.fechaEstimadaIngreso}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaEstimadaIngreso: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Crear Proceso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IngresosContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: procesos, isLoading } = useQuery({
    queryKey: ['procesos-ingreso'],
    queryFn: fetchProcesos,
  });

  const createMutation = useMutation({
    mutationFn: createProceso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procesos-ingreso'] });
      setShowCreateModal(false);
    }
  });

  const filteredProcesos = procesos?.filter(proceso => {
    const matchesSearch = proceso.nombreIngresante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proceso.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proceso.areaDestino.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !estadoFilter || proceso.estadoGeneral === estadoFilter;
    
    return matchesSearch && matchesEstado;
  }) || [];

  const getEstadoConfig = (estado: string) => {
    const configs = {
      'iniciado': { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
        icon: PlayCircle 
      },
      'en_progreso': { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
        icon: Clock 
      },
      'completado': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
        icon: CheckCircle 
      },
      'detenido': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
        icon: XCircle 
      }
    };
    return configs[estado as keyof typeof configs] || configs.iniciado;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleViewFlujo = (procesoId: string) => {
    router.push(`/ingresos/${procesoId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando procesos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">👥 Procesos de Ingreso</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los procesos de incorporación de nuevo personal
          </p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Ingreso</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, puesto o área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              <option value="iniciado">Iniciado</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
              <option value="detenido">Detenido</option>
            </select>

            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Procesos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProcesos.map((proceso) => {
          const estadoConfig = getEstadoConfig(proceso.estadoGeneral);
          const EstadoIcon = estadoConfig.icon;

          return (
            <div 
              key={proceso.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1',
                    estadoConfig.color
                  )}>
                    <EstadoIcon size={14} />
                    <span className="capitalize">{proceso.estadoGeneral.replace('_', ' ')}</span>
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {proceso.id}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {proceso.nombreIngresante}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                    <span>{proceso.puesto}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Building className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                    <span>{proceso.areaDestino}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                    <span>Ingreso: {formatDate(proceso.fechaEstimadaIngreso)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Creado: {new Date(proceso.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleViewFlujo(proceso.id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                  >
                    <Eye size={16} />
                    <span>Ver Flujo</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProcesos.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay procesos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || estadoFilter 
              ? 'No se encontraron procesos con los filtros aplicados.'
              : 'Comienza creando un nuevo proceso de ingreso.'
            }
          </p>
        </div>
      )}

      {/* Create Modal */}
      <CreateProcesoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

export default function IngresosPage() {
  return (
    <ProtectedLayout>
      <IngresosContent />
    </ProtectedLayout>
  );
}
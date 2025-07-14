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
  Bell,
  Calendar,
  Users,
  Pin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { NovedadCard } from '@/components/dashboard/novedad-card';
import { NovedadModal } from '@/components/dashboard/novedad-modal';
import { NovedadFormModal } from '@/components/dashboard/novedad-form-modal';
import { Novedad } from '@/lib/types';
import { cn } from '@/lib/utils';

// Mock data
const mockNovedades: Novedad[] = [
  {
    id: '1',
    titulo: 'Actualización del sistema',
    fecha: '2025-06-08T10:00:00Z',
    descripcion: 'Se ha actualizado el sistema a la versión 2.5.0. Esta actualización incluye mejoras en el rendimiento y correcciones de errores.\n\nPrincipales cambios:\n- Mejora en la velocidad de carga de órdenes\n- Nuevo diseño de la sección de equipos\n- Corrección de errores en el módulo de reportes\n\nSi encuentras algún problema, por favor repórtalo al equipo de soporte.',
    icono: '🔔',
    reacciones: {
      like: 12,
      love: 5,
      seen: 45
    },
    rolesDestinatarios: ['admin', 'tecnico', 'supervisor'],
    pin: true
  },
  {
    id: '2',
    titulo: 'Mantenimiento programado',
    fecha: '2025-06-10T15:30:00Z',
    descripcion: 'Se realizará un mantenimiento programado el día 15 de junio de 2025 de 22:00 a 02:00 horas. Durante este período, el sistema no estará disponible.\n\nPor favor, planifica tus actividades teniendo en cuenta esta interrupción del servicio.',
    icono: '⚠️',
    reacciones: {
      like: 3,
      love: 0,
      seen: 28
    },
    rolesDestinatarios: ['admin', 'tecnico', 'supervisor', 'rrhh']
  },
  {
    id: '3',
    titulo: 'Nueva funcionalidad: Chat interno',
    fecha: '2025-06-05T09:15:00Z',
    descripcion: 'Hemos implementado un nuevo sistema de chat interno para mejorar la comunicación entre los miembros del equipo. Ahora podrás enviar mensajes directos y crear grupos de conversación.\n\nPara acceder, utiliza el ícono de chat en la barra superior.',
    icono: '🎉',
    reacciones: {
      like: 24,
      love: 18,
      seen: 52
    },
    rolesDestinatarios: ['admin', 'tecnico', 'supervisor', 'rrhh']
  },
  {
    id: '4',
    titulo: 'Alerta de seguridad',
    fecha: '2025-06-07T14:20:00Z',
    descripcion: 'Hemos detectado intentos de phishing dirigidos a nuestra organización. Por favor, mantente alerta y no abras correos sospechosos ni hagas clic en enlaces desconocidos.\n\nRecuerda que nunca solicitaremos tus credenciales por correo electrónico.',
    icono: '🚨',
    reacciones: {
      like: 8,
      love: 0,
      seen: 37
    },
    rolesDestinatarios: ['admin', 'tecnico', 'supervisor', 'rrhh']
  },
  {
    id: '5',
    titulo: 'Nuevos equipos disponibles',
    fecha: '2025-06-01T11:45:00Z',
    descripcion: 'Se han agregado nuevos equipos al inventario. Ahora contamos con modelos actualizados de herramientas y dispositivos para mejorar la eficiencia en el trabajo de campo.\n\nPuedes solicitar estos equipos a través del formulario de requisición en la sección de Equipos.',
    icono: '✅',
    reacciones: {
      like: 15,
      love: 7,
      seen: 41
    },
    rolesDestinatarios: ['tecnico', 'supervisor']
  }
];

const fetchNovedades = async (): Promise<Novedad[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockNovedades;
};

const createNovedad = async (data: Omit<Novedad, 'id'>): Promise<Novedad> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: Date.now().toString(),
    ...data
  };
};

const updateNovedad = async (id: string, data: Partial<Omit<Novedad, 'id'>>): Promise<Novedad> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const existingNovedad = mockNovedades.find(n => n.id === id);
  if (!existingNovedad) throw new Error('Novedad no encontrada');
  
  return {
    ...existingNovedad,
    ...data
  };
};

const deleteNovedad = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // En una implementación real, aquí se haría la llamada a la API
};

function NovedadesAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNovedad, setEditingNovedad] = useState<Novedad | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pinned'>('all');

  const queryClient = useQueryClient();

  const { data: novedades, isLoading } = useQuery({
    queryKey: ['novedades'],
    queryFn: fetchNovedades,
  });

  const createMutation = useMutation({
    mutationFn: createNovedad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novedades'] });
      setShowFormModal(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Novedad, 'id'>> }) => 
      updateNovedad(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novedades'] });
      setEditingNovedad(null);
      setShowFormModal(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNovedad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novedades'] });
      setShowDeleteConfirm(null);
    }
  });

  const reaccionarMutation = useMutation({
    mutationFn: ({ id, tipo }: { id: string; tipo: 'like' | 'love' | 'seen' }) => {
      const novedad = novedades?.find(n => n.id === id);
      if (!novedad) throw new Error('Novedad no encontrada');
      
      const updatedReacciones = {
        ...novedad.reacciones,
        [tipo]: novedad.reacciones[tipo] + 1
      };
      
      return updateNovedad(id, { reacciones: updatedReacciones });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novedades'] });
    }
  });

  const handleCreateNovedad = (data: Omit<Novedad, 'id'>) => {
    createMutation.mutate(data);
  };

  const handleUpdateNovedad = (data: Omit<Novedad, 'id'>) => {
    if (editingNovedad) {
      updateMutation.mutate({ id: editingNovedad.id, data });
    }
  };

  const handleEditNovedad = (novedad: Novedad) => {
    setEditingNovedad(novedad);
    setShowFormModal(true);
  };

  const handleDeleteNovedad = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(showDeleteConfirm);
    }
  };

  const handleReaccionar = (id: string, tipo: 'like' | 'love' | 'seen') => {
    reaccionarMutation.mutate({ id, tipo });
  };

  const filteredNovedades = novedades?.filter(novedad => {
    const matchesSearch = novedad.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         novedad.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'pinned') return matchesSearch && novedad.pin;
    if (activeFilter === 'active') return matchesSearch && new Date(novedad.fecha) >= new Date();
    
    return matchesSearch;
  }) || [];

  // Ordenar novedades: primero las fijadas, luego por fecha
  const sortedNovedades = [...filteredNovedades].sort((a, b) => {
    if (a.pin && !b.pin) return -1;
    if (!a.pin && b.pin) return 1;
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando novedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Novedades</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las novedades y anuncios para los usuarios
          </p>
        </div>
        
        <button 
          onClick={() => {
            setEditingNovedad(null);
            setShowFormModal(true);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Novedad</span>
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
                placeholder="Buscar novedades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                activeFilter === 'all'
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                activeFilter === 'active'
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              )}
            >
              Activas
            </button>
            <button
              onClick={() => setActiveFilter('pinned')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                activeFilter === 'pinned'
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              )}
            >
              Fijadas
            </button>
          </div>
        </div>
      </div>

      {/* Novedades List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          {sortedNovedades.length > 0 ? (
            sortedNovedades.map((novedad) => (
              <div key={novedad.id} className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0 mr-4">
                  <NovedadCard
                    novedad={novedad}
                    onCerrar={() => handleDeleteNovedad(novedad.id)}
                    onReaccionar={(tipo) => handleReaccionar(novedad.id, tipo)}
                    onClick={() => setSelectedNovedad(novedad)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditNovedad(novedad)}
                    className="p-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteNovedad(novedad.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay novedades</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? 'No se encontraron novedades con el término de búsqueda.'
                  : 'Comienza creando una nueva novedad.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedNovedad && (
        <NovedadModal
          novedad={selectedNovedad}
          onClose={() => setSelectedNovedad(null)}
          onCerrar={() => {
            handleDeleteNovedad(selectedNovedad.id);
            setSelectedNovedad(null);
          }}
          onReaccionar={(tipo) => handleReaccionar(selectedNovedad.id, tipo)}
        />
      )}

      <NovedadFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingNovedad(null);
        }}
        onSubmit={editingNovedad ? handleUpdateNovedad : handleCreateNovedad}
        novedad={editingNovedad || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-2 mb-4">
              <Trash2 className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta novedad? 
              Esta acción no se puede deshacer.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteMutation.isPending ? <LoadingSpinner size="sm" /> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NovedadesPage() {
  return (
    <ProtectedLayout>
      <NovedadesAdmin />
    </ProtectedLayout>
  );
}
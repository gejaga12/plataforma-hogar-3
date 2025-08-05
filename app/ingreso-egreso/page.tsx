'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  LogIn, 
  LogOut, 
  Calendar,
  User,
  MapPin,
  Download,
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


interface MovimientoIngresoEgreso {
  id: string;
  usuario: {
    id: string;
    nombreCompleto: string;
    rol: string;
    avatar?: string;
  };
  tipo: 'INGRESO' | 'EGRESO';
  fechaHora: string;
  motivo: string;
  ubicacion?: {
    direccion: string;
    latitud?: number;
    longitud?: number;
  };
  dispositivo?: string;
  ipAddress?: string;
  observaciones?: string;
  registradoPor?: string;
  createdAt: string;
}

interface CreateMovimientoData {
  usuarioId: string;
  tipo: 'INGRESO' | 'EGRESO';
  motivo: string;
  ubicacion?: {
    direccion: string;
    latitud?: number;
    longitud?: number;
  };
  observaciones?: string;
}

// Mock data
const mockMovimientos: MovimientoIngresoEgreso[] = [
  {
    id: 'MOV-001',
    usuario: {
      id: 'user-1',
      nombreCompleto: 'Juan Carlos Pérez',
      rol: 'Técnico',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    tipo: 'INGRESO',
    fechaHora: '2024-01-15T08:30:00Z',
    motivo: 'Inicio de jornada laboral',
    ubicacion: {
      direccion: 'Sede Central - Av. Libertador 1234',
      latitud: -34.6037,
      longitud: -58.3816
    },
    dispositivo: 'Mobile App',
    ipAddress: '192.168.1.100',
    registradoPor: 'Sistema automático',
    createdAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'MOV-002',
    usuario: {
      id: 'user-2',
      nombreCompleto: 'María González López',
      rol: 'Supervisora',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    tipo: 'EGRESO',
    fechaHora: '2024-01-15T17:45:00Z',
    motivo: 'Fin de jornada laboral',
    ubicacion: {
      direccion: 'Sede Central - Av. Libertador 1234',
      latitud: -34.6037,
      longitud: -58.3816
    },
    dispositivo: 'Web Portal',
    ipAddress: '192.168.1.105',
    observaciones: 'Completó todas las tareas asignadas',
    registradoPor: 'Sistema automático',
    createdAt: '2024-01-15T17:45:00Z'
  },
  {
    id: 'MOV-003',
    usuario: {
      id: 'user-3',
      nombreCompleto: 'Carlos Rodríguez',
      rol: 'Técnico'
    },
    tipo: 'INGRESO',
    fechaHora: '2024-01-15T09:15:00Z',
    motivo: 'Visita a cliente',
    ubicacion: {
      direccion: 'Cliente ABC - Calle San Martín 567',
      latitud: -34.6118,
      longitud: -58.3960
    },
    dispositivo: 'Mobile App',
    ipAddress: '192.168.1.110',
    observaciones: 'Orden de trabajo OT-2024-001',
    registradoPor: 'Sistema automático',
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 'MOV-004',
    usuario: {
      id: 'user-4',
      nombreCompleto: 'Ana López Martínez',
      rol: 'Técnica',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    tipo: 'EGRESO',
    fechaHora: '2024-01-15T12:30:00Z',
    motivo: 'Pausa para almuerzo',
    ubicacion: {
      direccion: 'Zona comercial - Av. Corrientes 1500',
      latitud: -34.6037,
      longitud: -58.3816
    },
    dispositivo: 'Mobile App',
    ipAddress: '192.168.1.115',
    registradoPor: 'Sistema automático',
    createdAt: '2024-01-15T12:30:00Z'
  },
  {
    id: 'MOV-005',
    usuario: {
      id: 'user-5',
      nombreCompleto: 'Pedro Martín Silva',
      rol: 'Técnico'
    },
    tipo: 'INGRESO',
    fechaHora: '2024-01-15T14:00:00Z',
    motivo: 'Regreso de almuerzo',
    ubicacion: {
      direccion: 'Sede Central - Av. Libertador 1234',
      latitud: -34.6037,
      longitud: -58.3816
    },
    dispositivo: 'Web Portal',
    ipAddress: '192.168.1.120',
    registradoPor: 'Registro manual',
    createdAt: '2024-01-15T14:00:00Z'
  },
  {
    id: 'MOV-006',
    usuario: {
      id: 'user-6',
      nombreCompleto: 'Luis Fernando García',
      rol: 'Administrador'
    },
    tipo: 'EGRESO',
    fechaHora: '2024-01-15T18:30:00Z',
    motivo: 'Fin de jornada laboral',
    ubicacion: {
      direccion: 'Sede Central - Av. Libertador 1234',
      latitud: -34.6037,
      longitud: -58.3816
    },
    dispositivo: 'Web Portal',
    ipAddress: '192.168.1.125',
    observaciones: 'Revisión de reportes completada',
    registradoPor: 'Sistema automático',
    createdAt: '2024-01-15T18:30:00Z'
  }
];

const fetchMovimientos = async (): Promise<MovimientoIngresoEgreso[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockMovimientos;
};

const createMovimiento = async (data: CreateMovimientoData): Promise<MovimientoIngresoEgreso> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newMovimiento: MovimientoIngresoEgreso = {
    id: `MOV-${Date.now()}`,
    usuario: {
      id: data.usuarioId,
      nombreCompleto: 'Usuario Nuevo',
      rol: 'Técnico'
    },
    tipo: data.tipo,
    fechaHora: new Date().toISOString(),
    motivo: data.motivo,
    ubicacion: data.ubicacion,
    observaciones: data.observaciones,
    dispositivo: 'Web Portal',
    registradoPor: 'Registro manual',
    createdAt: new Date().toISOString()
  };
  return newMovimiento;
};

const tipoConfig = {
  'INGRESO': {
    label: 'Ingreso',
    color: 'bg-green-100 text-green-800',
    icon: LogIn
  },
  'EGRESO': {
    label: 'Egreso',
    color: 'bg-red-100 text-red-800',
    icon: LogOut
  }
};

interface MovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimiento?: MovimientoIngresoEgreso;
  mode: 'create' | 'edit' | 'view';
}

function MovimientoModal({ isOpen, onClose, movimiento, mode }: MovimientoModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateMovimientoData>({
    usuarioId: movimiento?.usuario.id || '',
    tipo: movimiento?.tipo || 'INGRESO',
    motivo: movimiento?.motivo || '',
    ubicacion: movimiento?.ubicacion,
    observaciones: movimiento?.observaciones || ''
  });

  const createMutation = useMutation({
    mutationFn: createMovimiento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      createMutation.mutate(formData);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const isLoading = createMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' && 'Registrar Movimiento'}
              {mode === 'edit' && 'Editar Movimiento'}
              {mode === 'view' && 'Detalles del Movimiento'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario *
              </label>
              <select
                value={formData.usuarioId}
                onChange={(e) => setFormData(prev => ({ ...prev, usuarioId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              >
                <option value="">Seleccionar usuario</option>
                <option value="user-1">Juan Carlos Pérez</option>
                <option value="user-2">María González López</option>
                <option value="user-3">Carlos Rodríguez</option>
                <option value="user-4">Ana López Martínez</option>
                <option value="user-5">Pedro Martín Silva</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'INGRESO' | 'EGRESO' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              >
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo *
            </label>
            <input
              type="text"
              value={formData.motivo}
              onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: Inicio de jornada laboral, Visita a cliente, etc."
              required
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.ubicacion?.direccion || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                ubicacion: { ...prev.ubicacion, direccion: e.target.value } 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Dirección o ubicación del movimiento"
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Información adicional sobre el movimiento"
              disabled={isReadOnly}
            />
          </div>

          {mode === 'view' && movimiento && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispositivo
                </label>
                <p className="text-sm text-gray-900">{movimiento.dispositivo || 'No especificado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address
                </label>
                <p className="text-sm text-gray-900">{movimiento.ipAddress || 'No disponible'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registrado por
                </label>
                <p className="text-sm text-gray-900">{movimiento.registradoPor || 'Sistema'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de registro
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(movimiento.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          )}

          {!isReadOnly && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Registrando...</span>
                  </>
                ) : (
                  'Registrar Movimiento'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

type SortField = 'id' | 'usuario' | 'tipo' | 'fechaHora' | 'motivo';
type SortDirection = 'asc' | 'desc';

function IngresoEgresoContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [usuarioFilter, setUsuarioFilter] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [selectedMovimientos, setSelectedMovimientos] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('fechaHora');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    movimiento?: MovimientoIngresoEgreso;
  }>({
    isOpen: false,
    mode: 'create'
  });

  const { data: movimientos, isLoading } = useQuery({
    queryKey: ['movimientos'],
    queryFn: fetchMovimientos,
  });

  const filteredMovimientos = movimientos?.filter(movimiento => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = movimiento.id.toLowerCase().includes(searchLower) ||
                         movimiento.usuario.nombreCompleto.toLowerCase().includes(searchLower) ||
                         movimiento.motivo.toLowerCase().includes(searchLower);
    
    const matchesTipo = !tipoFilter || movimiento.tipo === tipoFilter;
    const matchesUsuario = !usuarioFilter || movimiento.usuario.id === usuarioFilter;
    
    // Filtros de fecha
    let matchesFecha = true;
    if (fechaDesde || fechaHasta) {
      const movimientoDate = new Date(movimiento.fechaHora);
      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        matchesFecha = matchesFecha && movimientoDate >= desde;
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        matchesFecha = matchesFecha && movimientoDate <= hasta;
      }
    }
    
    return matchesSearch && matchesTipo && matchesUsuario && matchesFecha;
  }) || [];

  const sortedMovimientos = [...filteredMovimientos].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'usuario') {
      aValue = a.usuario.nombreCompleto;
      bValue = b.usuario.nombreCompleto;
    }
    
    if (sortField === 'fechaHora') {
      aValue = new Date(a.fechaHora);
      bValue = new Date(b.fechaHora);
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
      setSelectedMovimientos(sortedMovimientos.map(mov => mov.id));
    } else {
      setSelectedMovimientos([]);
    }
  };

  const handleSelectMovimiento = (movimientoId: string, checked: boolean) => {
    if (checked) {
      setSelectedMovimientos(prev => [...prev, movimientoId]);
    } else {
      setSelectedMovimientos(prev => prev.filter(id => id !== movimientoId));
    }
  };

  const handleExportToExcel = () => {
    console.log('Exportar movimientos a Excel');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
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
          <p className="mt-4 text-gray-600">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📂 Ingreso-Egreso</h1>
          <p className="text-gray-600 mt-1">
            Registro de movimientos de entrada y salida
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
          
          <button 
            onClick={() => setModalState({ isOpen: true, mode: 'create' })}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por ID, usuario o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="INGRESO">Ingreso</option>
              <option value="EGRESO">Egreso</option>
            </select>
          </div>

          <div>
            <select
              value={usuarioFilter}
              onChange={(e) => setUsuarioFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los usuarios</option>
              {Array.from(new Set(movimientos?.map(m => m.usuario.id) || [])).map(userId => {
                const usuario = movimientos?.find(m => m.usuario.id === userId)?.usuario;
                return (
                  <option key={userId} value={userId}>
                    {usuario?.nombreCompleto}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Fecha desde"
            />
          </div>

          <div>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Fecha hasta"
            />
          </div>
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
                    checked={selectedMovimientos.length === sortedMovimientos.length && sortedMovimientos.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="id">ID</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="usuario">Usuario</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="tipo">Tipo</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="fechaHora">Fecha y Hora</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="motivo">Motivo</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMovimientos.map((movimiento, index) => {
                const tipoInfo = tipoConfig[movimiento.tipo];
                const TipoIcon = tipoInfo.icon;

                return (
                  <tr 
                    key={movimiento.id} 
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      selectedMovimientos.includes(movimiento.id) && 'bg-orange-50',
                      index % 2 === 1 && 'bg-gray-25'
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedMovimientos.includes(movimiento.id)}
                        onChange={(e) => handleSelectMovimiento(movimiento.id, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {movimiento.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {movimiento.usuario.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover mr-3"
                            src={movimiento.usuario.avatar}
                            alt={movimiento.usuario.nombreCompleto}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-white">
                              {movimiento.usuario.nombreCompleto.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movimiento.usuario.nombreCompleto}
                          </div>
                          <div className="text-xs text-gray-500">
                            {movimiento.usuario.rol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit',
                        tipoInfo.color
                      )}>
                        <TipoIcon size={12} />
                        <span>{tipoInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar size={14} className="text-gray-400 mr-1" />
                        {formatDateTime(movimiento.fechaHora)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-48 truncate" title={movimiento.motivo}>
                        {movimiento.motivo}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {movimiento.ubicacion ? (
                        <div className="flex items-center max-w-48 truncate\" title={movimiento.ubicacion.direccion}>
                          <MapPin size={14} className="text-gray-400 mr-1 flex-shrink-0" />
                          {movimiento.ubicacion.direccion}
                        </div>
                      ) : (
                        <span className="text-gray-400">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setModalState({ isOpen: true, mode: 'view', movimiento })}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setModalState({ isOpen: true, mode: 'edit', movimiento })}
                          className="text-orange-600 hover:text-orange-800 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedMovimientos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Clock className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No hay movimientos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || tipoFilter || usuarioFilter || fechaDesde || fechaHasta
                ? 'No se encontraron movimientos con los filtros aplicados.'
                : 'No hay movimientos registrados en este momento.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedMovimientos.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{sortedMovimientos.length}</span> movimientos
            {selectedMovimientos.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedMovimientos.length}</span> seleccionados)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Página 1 de 1</span>
          </div>
        </div>
      )}

      {/* Modal */}
      <MovimientoModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        movimiento={modalState.movimiento}
        mode={modalState.mode}
      />
    </div>
  );
}

export default function IngresoEgresoPage() {
  return (
    <ProtectedLayout>
      <IngresoEgresoContent />
    </ProtectedLayout>
  );
}
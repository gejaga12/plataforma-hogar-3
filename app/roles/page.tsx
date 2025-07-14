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
  MoreHorizontal,
  Shield,
  Users,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface Role {
  id: string;
  nombre: string;
  exclusivo: boolean;
  usuariosAsignados: string[];
  vistasPermitidas: string[];
  permisosPorVista: Record<string, {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    borrar: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CreateRoleData {
  nombre: string;
  exclusivo: boolean;
  usuariosAsignados: string[];
  vistasPermitidas: string[];
  permisosPorVista: Record<string, {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    borrar: boolean;
  }>;
}

interface User {
  id: string;
  nombre: string;
  email: string;
}

// Mock data
const mockRoles: Role[] = [
  {
    id: '1',
    nombre: 'Administrador',
    exclusivo: true,
    usuariosAsignados: ['user-1'],
    vistasPermitidas: ['dashboard', 'orders', 'users', 'reports', 'settings'],
    permisosPorVista: {
      'dashboard': { ver: true, crear: false, editar: false, borrar: false },
      'orders': { ver: true, crear: true, editar: true, borrar: true },
      'users': { ver: true, crear: true, editar: true, borrar: true },
      'reports': { ver: true, crear: true, editar: false, borrar: false },
      'settings': { ver: true, crear: false, editar: true, borrar: false }
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    nombre: 'Supervisor',
    exclusivo: false,
    usuariosAsignados: ['user-2', 'user-3'],
    vistasPermitidas: ['dashboard', 'orders', 'reports'],
    permisosPorVista: {
      'dashboard': { ver: true, crear: false, editar: false, borrar: false },
      'orders': { ver: true, crear: true, editar: true, borrar: false },
      'reports': { ver: true, crear: false, editar: false, borrar: false }
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    nombre: 'Técnico',
    exclusivo: false,
    usuariosAsignados: ['user-4', 'user-5', 'user-6'],
    vistasPermitidas: ['dashboard', 'orders'],
    permisosPorVista: {
      'dashboard': { ver: true, crear: false, editar: false, borrar: false },
      'orders': { ver: true, crear: false, editar: true, borrar: false }
    },
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  }
];

const mockUsers: User[] = [
  { id: 'user-1', nombre: 'Juan Pérez', email: 'juan@hogarapp.com' },
  { id: 'user-2', nombre: 'María González', email: 'maria@hogarapp.com' },
  { id: 'user-3', nombre: 'Carlos Rodríguez', email: 'carlos@hogarapp.com' },
  { id: 'user-4', nombre: 'Ana López', email: 'ana@hogarapp.com' },
  { id: 'user-5', nombre: 'Pedro Martín', email: 'pedro@hogarapp.com' },
  { id: 'user-6', nombre: 'Luis García', email: 'luis@hogarapp.com' }
];

const availableViews = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Órdenes de Trabajo' },
  { id: 'users', label: 'Usuarios' },
  { id: 'reports', label: 'Reportes' },
  { id: 'settings', label: 'Configuración' },
  { id: 'news', label: 'Noticias' },
  { id: 'documents', label: 'Documentos' },
  { id: 'ranking', label: 'Ranking de Técnicos' }
];

const fetchRoles = async (): Promise<Role[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockRoles;
};

const fetchUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockUsers;
};

const createRole = async (roleData: CreateRoleData): Promise<Role> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newRole: Role = {
    id: Date.now().toString(),
    ...roleData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newRole;
};

const updateRole = async (id: string, roleData: Partial<CreateRoleData>): Promise<Role> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const existingRole = mockRoles.find(r => r.id === id);
  if (!existingRole) throw new Error('Rol no encontrado');
  
  return {
    ...existingRole,
    ...roleData,
    updatedAt: new Date().toISOString()
  };
};

const deleteRole = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
  mode: 'create' | 'edit' | 'view';
}

function RoleFormModal({ isOpen, onClose, role, mode }: RoleFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateRoleData>({
    nombre: role?.nombre || '',
    exclusivo: role?.exclusivo || false,
    usuariosAsignados: role?.usuariosAsignados || [],
    vistasPermitidas: role?.vistasPermitidas || [],
    permisosPorVista: role?.permisosPorVista || {}
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateRoleData>) => updateRole(role!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      createMutation.mutate(formData);
    } else if (mode === 'edit') {
      updateMutation.mutate(formData);
    }
  };

  const handleVistaChange = (vistaId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        vistasPermitidas: [...prev.vistasPermitidas, vistaId],
        permisosPorVista: {
          ...prev.permisosPorVista,
          [vistaId]: { ver: true, crear: false, editar: false, borrar: false }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        vistasPermitidas: prev.vistasPermitidas.filter(id => id !== vistaId),
        permisosPorVista: Object.fromEntries(
          Object.entries(prev.permisosPorVista).filter(([key]) => key !== vistaId)
        )
      }));
    }
  };

  const handlePermisoChange = (vistaId: string, permiso: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permisosPorVista: {
        ...prev.permisosPorVista,
        [vistaId]: {
          ...prev.permisosPorVista[vistaId],
          [permiso]: checked
        }
      }
    }));
  };

  const handleUserChange = (userId: string, checked: boolean) => {
    if (formData.exclusivo) {
      setFormData(prev => ({
        ...prev,
        usuariosAsignados: checked ? [userId] : []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        usuariosAsignados: checked 
          ? [...prev.usuariosAsignados, userId]
          : prev.usuariosAsignados.filter(id => id !== userId)
      }));
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' && 'Crear Nuevo Rol'}
              {mode === 'edit' && 'Editar Rol'}
              {mode === 'view' && 'Detalles del Rol'}
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
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.exclusivo}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      exclusivo: e.target.checked,
                      usuariosAsignados: e.target.checked ? prev.usuariosAsignados.slice(0, 1) : prev.usuariosAsignados
                    }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    disabled={isReadOnly}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Rol Exclusivo</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Si está marcado, solo un usuario puede tener este rol
                </p>
              </div>
            </div>

            {/* Usuarios Asignados */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Usuarios Asignados</h3>
              
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {users?.map((user) => (
                  <label key={user.id} className="flex items-center py-2">
                    <input
                      type={formData.exclusivo ? "radio" : "checkbox"}
                      name={formData.exclusivo ? "usuario-exclusivo" : undefined}
                      checked={formData.usuariosAsignados.includes(user.id)}
                      onChange={(e) => handleUserChange(user.id, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      disabled={isReadOnly}
                    />
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Vistas y Permisos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Vistas Permitidas y Permisos</h3>
            
            <div className="space-y-3">
              {availableViews.map((vista) => {
                const isVistaSelected = formData.vistasPermitidas.includes(vista.id);
                const permisos = formData.permisosPorVista[vista.id] || { ver: false, crear: false, editar: false, borrar: false };

                return (
                  <div key={vista.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isVistaSelected}
                          onChange={(e) => handleVistaChange(vista.id, e.target.checked)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          disabled={isReadOnly}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900">{vista.label}</span>
                      </label>
                    </div>

                    {isVistaSelected && (
                      <div className="grid grid-cols-4 gap-4 ml-6">
                        {['ver', 'crear', 'editar', 'borrar'].map((permiso) => (
                          <label key={permiso} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={permisos[permiso as keyof typeof permisos]}
                              onChange={(e) => handlePermisoChange(vista.id, permiso, e.target.checked)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              disabled={isReadOnly}
                            />
                            <span className="ml-1 text-xs text-gray-700 capitalize">{permiso}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

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
                    <span className="ml-2">
                      {mode === 'create' ? 'Creando...' : 'Guardando...'}
                    </span>
                  </>
                ) : (
                  mode === 'create' ? 'Crear Rol' : 'Guardar Cambios'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roleName: string;
  isLoading: boolean;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, roleName, isLoading }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el rol <strong>{roleName}</strong>? 
          Esta acción no se puede deshacer.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

type SortField = 'nombre' | 'usuariosAsignados' | 'vistasPermitidas';
type SortDirection = 'asc' | 'desc';

function RolesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    role?: Role;
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    role?: Role;
  }>({
    isOpen: false
  });

  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteModal({ isOpen: false });
    }
  });

  const filteredRoles = roles?.filter(role => {
    const searchLower = searchTerm.toLowerCase();
    return (
      role.nombre.toLowerCase().includes(searchLower) ||
      role.vistasPermitidas.some(vista => vista.toLowerCase().includes(searchLower))
    );
  }) || [];

  const sortedRoles = [...filteredRoles].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'usuariosAsignados' || sortField === 'vistasPermitidas') {
      aValue = a[sortField].length;
      bValue = b[sortField].length;
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
      setSelectedRoles(sortedRoles.map(role => role.id));
    } else {
      setSelectedRoles([]);
    }
  };

  const handleSelectRole = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteModal({ isOpen: true, role });
  };

  const confirmDelete = () => {
    if (deleteModal.role) {
      deleteMutation.mutate(deleteModal.role.id);
    }
  };

  const getUserName = (userId: string) => {
    return users?.find(u => u.id === userId)?.nombre || 'Usuario desconocido';
  };

  const getVistaLabel = (vistaId: string) => {
    return availableViews.find(v => v.id === vistaId)?.label || vistaId;
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
          <p className="mt-4 text-gray-600">Cargando roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los roles y permisos del sistema
          </p>
        </div>
        
        <button 
          onClick={() => setModalState({ isOpen: true, mode: 'create' })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Crear Rol</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar roles por nombre o vistas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span>Filtros</span>
          </button>
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
                    checked={selectedRoles.length === sortedRoles.length && sortedRoles.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="nombre">Nombre del Rol</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exclusivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="usuariosAsignados">Usuarios Asignados</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="vistasPermitidas">Vistas Permitidas</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRoles.map((role, index) => (
                <tr 
                  key={role.id} 
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    selectedRoles.includes(role.id) && 'bg-orange-50',
                    index % 2 === 1 && 'bg-gray-25'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={(e) => handleSelectRole(role.id, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Shield className="text-orange-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-900">{role.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      role.exclusivo 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    )}>
                      {role.exclusivo ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Users className="text-gray-400 mr-1" size={14} />
                      <span className="text-sm text-gray-900">{role.usuariosAsignados.length}</span>
                      {role.usuariosAsignados.length > 0 && (
                        <div className="ml-2 max-w-32 truncate" title={role.usuariosAsignados.map(getUserName).join(', ')}>
                          <span className="text-xs text-gray-500">
                            {role.usuariosAsignados.map(getUserName).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Settings className="text-gray-400 mr-1" size={14} />
                      <span className="text-sm text-gray-900">{role.vistasPermitidas.length}</span>
                      {role.vistasPermitidas.length > 0 && (
                        <div className="ml-2 max-w-40 truncate" title={role.vistasPermitidas.map(getVistaLabel).join(', ')}>
                          <span className="text-xs text-gray-500">
                            {role.vistasPermitidas.map(getVistaLabel).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setModalState({ isOpen: true, mode: 'view', role })}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setModalState({ isOpen: true, mode: 'edit', role })}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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

        {sortedRoles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Shield className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No hay roles</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'No se encontraron roles con el término de búsqueda.'
                : 'Comienza creando un nuevo rol.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedRoles.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{sortedRoles.length}</span> roles
            {selectedRoles.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedRoles.length}</span> seleccionados)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Página 1 de 1
          </div>
        </div>
      )}

      {/* Modals */}
      <RoleFormModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        role={modalState.role}
        mode={modalState.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        roleName={deleteModal.role?.nombre || ''}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function RolesPage() {
  return (
    <ProtectedLayout>
      <RolesContent />
    </ProtectedLayout>
  );
}
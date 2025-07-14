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
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SystemUser, CreateUserData } from '@/lib/types';
import { cn } from '@/lib/utils';

// Mock data - replace with actual API calls
const mockUsers: SystemUser[] = [
  {
    id: '1',
    nombreCompleto: 'Gerardo García',
    zona: 'NEA',
    fechaIngreso: '2022-06-21',
    mail: 'g.garcia@hogar.com',
    direccion: 'Av. Prueba 123',
    telefono: '555555',
    roles: ['admin', 'coordinador'],
    certificacionesTitulo: 'Programación Web',
    notificaciones: {
      mail: true,
      push: true
    },
    puesto: 'Líder IT',
    area: 'IT',
    periodoPruebaContratado: 'Contratado',
    tipoContrato: 'Relación de Dependencia',
    documentos: ['legajo.pdf'],
    sucursalHogar: 'Sede Central',
    activo: true,
    createdAt: '2022-06-21T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    nombreCompleto: 'María González',
    zona: 'CABA',
    fechaIngreso: '2023-03-15',
    mail: 'm.gonzalez@hogar.com',
    direccion: 'Calle Falsa 456',
    telefono: '666666',
    roles: ['supervisor'],
    certificacionesTitulo: 'Gestión de Equipos',
    notificaciones: {
      mail: true,
      push: false
    },
    puesto: 'Supervisora de Campo',
    area: 'Operaciones',
    periodoPruebaContratado: 'Contratado',
    tipoContrato: 'Relación de Dependencia',
    documentos: ['cv.pdf', 'certificados.pdf'],
    sucursalHogar: 'Sucursal Norte',
    activo: true,
    createdAt: '2023-03-15T09:00:00Z',
    updatedAt: '2024-01-10T11:20:00Z'
  },
  {
    id: '3',
    nombreCompleto: 'Carlos Rodríguez',
    zona: 'GBA',
    fechaIngreso: '2023-08-10',
    mail: 'c.rodriguez@hogar.com',
    direccion: 'Av. Libertador 789',
    telefono: '777777',
    roles: ['tecnico'],
    certificacionesTitulo: 'Técnico en Electrónica',
    notificaciones: {
      mail: false,
      push: true
    },
    puesto: 'Técnico Senior',
    area: 'Mantenimiento',
    periodoPruebaContratado: 'Periodo de Prueba',
    tipoContrato: 'Relación de Dependencia',
    documentos: ['legajo.pdf'],
    sucursalHogar: 'Sucursal Sur',
    activo: true,
    createdAt: '2023-08-10T08:30:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  }
];

const fetchUsers = async (): Promise<SystemUser[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockUsers;
};

const createUser = async (userData: CreateUserData): Promise<SystemUser> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newUser: SystemUser = {
    id: Date.now().toString(),
    ...userData,
    documentos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newUser;
};

const updateUser = async (id: string, userData: Partial<CreateUserData>): Promise<SystemUser> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const existingUser = mockUsers.find(u => u.id === id);
  if (!existingUser) throw new Error('Usuario no encontrado');
  
  return {
    ...existingUser,
    ...userData,
    updatedAt: new Date().toISOString()
  };
};

const deleteUser = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // In real implementation, make API call to delete user
};

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: SystemUser;
  mode: 'create' | 'edit' | 'view';
}

function UserModal({ isOpen, onClose, user, mode }: UserModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateUserData>({
    nombreCompleto: user?.nombreCompleto || '',
    zona: user?.zona || '',
    fechaIngreso: user?.fechaIngreso || '',
    mail: user?.mail || '',
    direccion: user?.direccion || '',
    telefono: user?.telefono || '',
    roles: user?.roles || [],
    certificacionesTitulo: user?.certificacionesTitulo || '',
    notificaciones: user?.notificaciones || { mail: true, push: true },
    puesto: user?.puesto || '',
    area: user?.area || '',
    periodoPruebaContratado: user?.periodoPruebaContratado || 'Periodo de Prueba',
    tipoContrato: user?.tipoContrato || 'Relación de Dependencia',
    sucursalHogar: user?.sucursalHogar || '',
    activo: user?.activo ?? true
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateUserData>) => updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
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
              {mode === 'create' && 'Crear Nuevo Usuario'}
              {mode === 'edit' && 'Editar Usuario'}
              {mode === 'view' && 'Detalles del Usuario'}
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
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombreCompleto: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.mail}
                  onChange={(e) => setFormData(prev => ({ ...prev, mail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Información Laboral */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Laboral</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puesto *
                </label>
                <input
                  type="text"
                  value={formData.puesto}
                  onChange={(e) => setFormData(prev => ({ ...prev, puesto: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área *
                </label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                >
                  <option value="">Seleccionar área</option>
                  <option value="IT">IT</option>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Administración">Administración</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona *
                </label>
                <select
                  value={formData.zona}
                  onChange={(e) => setFormData(prev => ({ ...prev, zona: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                >
                  <option value="">Seleccionar zona</option>
                  <option value="CABA">CABA</option>
                  <option value="GBA">GBA</option>
                  <option value="NEA">NEA</option>
                  <option value="NOA">NOA</option>
                  <option value="Cuyo">Cuyo</option>
                  <option value="Patagonia">Patagonia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursal Hogar *
                </label>
                <select
                  value={formData.sucursalHogar}
                  onChange={(e) => setFormData(prev => ({ ...prev, sucursalHogar: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                >
                  <option value="">Seleccionar sucursal</option>
                  <option value="Sede Central">Sede Central</option>
                  <option value="Sucursal Norte">Sucursal Norte</option>
                  <option value="Sucursal Sur">Sucursal Sur</option>
                  <option value="Sucursal Este">Sucursal Este</option>
                  <option value="Sucursal Oeste">Sucursal Oeste</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contrato y Fechas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Contractual</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  value={formData.fechaIngreso}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaIngreso: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contrato *
                </label>
                <select
                  value={formData.tipoContrato}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoContrato: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                >
                  <option value="Relación de Dependencia">Relación de Dependencia</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Contratista">Contratista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Contractual *
                </label>
                <select
                  value={formData.periodoPruebaContratado}
                  onChange={(e) => setFormData(prev => ({ ...prev, periodoPruebaContratado: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                >
                  <option value="Periodo de Prueba">Periodo de Prueba</option>
                  <option value="Contratado">Contratado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificaciones/Título
                </label>
                <input
                  type="text"
                  value={formData.certificacionesTitulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificacionesTitulo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Roles y Configuraciones */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Roles y Configuraciones</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles *
                </label>
                <div className="space-y-2">
                  {['admin', 'coordinador', 'supervisor', 'tecnico'].map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={(e) => handleRoleChange(role, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        disabled={isReadOnly}
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notificaciones
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificaciones.mail}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificaciones: { ...prev.notificaciones, mail: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      disabled={isReadOnly}
                    />
                    <span className="ml-2 text-sm text-gray-700">Notificaciones por Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificaciones.push}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificaciones: { ...prev.notificaciones, push: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      disabled={isReadOnly}
                    />
                    <span className="ml-2 text-sm text-gray-700">Notificaciones Push</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    disabled={isReadOnly}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Usuario Activo</span>
                </label>
              </div>
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
                  mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'
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
  userName: string;
  isLoading: boolean;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName, isLoading }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{userName}</strong>? 
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

function UsersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    user?: SystemUser;
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user?: SystemUser;
  }>({
    isOpen: false
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteModal({ isOpen: false });
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.puesto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'activo' && user.activo) ||
                         (statusFilter === 'inactivo' && !user.activo);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleDeleteUser = (user: SystemUser) => {
    setDeleteModal({ isOpen: true, user });
  };

  const confirmDelete = () => {
    if (deleteModal.user) {
      deleteMutation.mutate(deleteModal.user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        
        <button 
          onClick={() => setModalState({ isOpen: true, mode: 'create' })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre, email o puesto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.nombreCompleto.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombreCompleto}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail size={12} className="mr-1" />
                          {user.mail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.puesto}</div>
                    <div className="text-sm text-gray-500">{user.area}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.zona}</div>
                    <div className="text-sm text-gray-500">{user.sucursalHogar}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      user.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setModalState({ isOpen: true, mode: 'view', user })}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setModalState({ isOpen: true, mode: 'edit', user })}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 transition-colors"
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter 
                ? 'No se encontraron usuarios con los filtros aplicados.'
                : 'Comienza creando un nuevo usuario.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        user={modalState.user}
        mode={modalState.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        userName={deleteModal.user?.nombreCompleto || ''}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedLayout>
      <UsersContent />
    </ProtectedLayout>
  );
}
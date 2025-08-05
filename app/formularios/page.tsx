'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileCheck, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/utils/cn';


interface Formulario {
  id: string;
  nombre: string;
  titulo: string;
  descripcion: string;
  express: boolean;
  compraMateriales: boolean;
  modulos: ModuloFormulario[];
  createdAt: string;
  updatedAt: string;
}

interface ModuloFormulario {
  id: string;
  pagina: number;
  nombre: string;
  orden: number;
  moduloId: string;
  moduloNombre: string;
  moduloTitulo: string;
  equipo: string;
}

interface CreateFormularioData {
  nombre: string;
  titulo: string;
  descripcion: string;
  express: boolean;
  compraMateriales: boolean;
  modulos: Omit<ModuloFormulario, 'id' | 'moduloNombre' | 'moduloTitulo'>[];
}

// Mock data para módulos disponibles
const mockModulosDisponibles = [
  { id: '1', nombre: 'revision_basica', titulo: 'Revisión Básica de Equipos' },
  { id: '2', nombre: 'mantenimiento_preventivo', titulo: 'Mantenimiento Preventivo' },
  { id: '3', nombre: 'inspeccion_seguridad', titulo: 'Inspección de Seguridad' },
  { id: '4', nombre: 'control_calidad', titulo: 'Control de Calidad' }
];

const equiposDisponibles = [
  'Aire Acondicionado',
  'Calefacción',
  'Ventilación',
  'Refrigeración',
  'Eléctrico',
  'Plomería',
  'General'
];

const mockFormularios: Formulario[] = [
  {
    id: '1',
    nombre: 'mantenimiento_hvac',
    titulo: 'Mantenimiento HVAC Completo',
    descripcion: 'Formulario completo para mantenimiento de sistemas HVAC',
    express: false,
    compraMateriales: true,
    modulos: [
      {
        id: '1',
        pagina: 1,
        nombre: 'Revisión inicial',
        orden: 1,
        moduloId: '1',
        moduloNombre: 'revision_basica',
        moduloTitulo: 'Revisión Básica de Equipos',
        equipo: 'Aire Acondicionado'
      },
      {
        id: '2',
        pagina: 1,
        nombre: 'Inspección de seguridad',
        orden: 2,
        moduloId: '3',
        moduloNombre: 'inspeccion_seguridad',
        moduloTitulo: 'Inspección de Seguridad',
        equipo: 'General'
      },
      {
        id: '3',
        pagina: 2,
        nombre: 'Mantenimiento preventivo',
        orden: 1,
        moduloId: '2',
        moduloNombre: 'mantenimiento_preventivo',
        moduloTitulo: 'Mantenimiento Preventivo',
        equipo: 'Aire Acondicionado'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    nombre: 'inspeccion_rapida',
    titulo: 'Inspección Rápida Express',
    descripcion: 'Formulario express para inspecciones rápidas',
    express: true,
    compraMateriales: false,
    modulos: [
      {
        id: '4',
        pagina: 1,
        nombre: 'Revisión básica',
        orden: 1,
        moduloId: '1',
        moduloNombre: 'revision_basica',
        moduloTitulo: 'Revisión Básica de Equipos',
        equipo: 'General'
      }
    ],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    nombre: 'control_calidad_completo',
    titulo: 'Control de Calidad Completo',
    descripcion: 'Formulario detallado para control de calidad de instalaciones',
    express: false,
    compraMateriales: true,
    modulos: [
      {
        id: '5',
        pagina: 1,
        nombre: 'Control inicial',
        orden: 1,
        moduloId: '4',
        moduloNombre: 'control_calidad',
        moduloTitulo: 'Control de Calidad',
        equipo: 'General'
      },
      {
        id: '6',
        pagina: 2,
        nombre: 'Verificación técnica',
        orden: 1,
        moduloId: '1',
        moduloNombre: 'revision_basica',
        moduloTitulo: 'Revisión Básica de Equipos',
        equipo: 'Eléctrico'
      }
    ],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  }
];

const fetchFormularios = async (): Promise<Formulario[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockFormularios;
};

const createFormulario = async (data: CreateFormularioData): Promise<Formulario> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newFormulario: Formulario = {
    id: Date.now().toString(),
    ...data,
    modulos: data.modulos.map((modulo, index) => {
      const moduloInfo = mockModulosDisponibles.find(m => m.id === modulo.moduloId);
      return {
        ...modulo,
        id: `${Date.now()}-${index}`,
        moduloNombre: moduloInfo?.nombre || '',
        moduloTitulo: moduloInfo?.titulo || ''
      };
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newFormulario;
};

const updateFormulario = async (id: string, data: Partial<CreateFormularioData>): Promise<Formulario> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const existingFormulario = mockFormularios.find(f => f.id === id);
  if (!existingFormulario) throw new Error('Formulario no encontrado');
  
  return {
    ...existingFormulario,
    ...data,
    modulos: data.modulos?.map((modulo, index) => {
      const moduloInfo = mockModulosDisponibles.find(m => m.id === modulo.moduloId);
      return {
        ...modulo,
        id: `${Date.now()}-${index}`,
        moduloNombre: moduloInfo?.nombre || '',
        moduloTitulo: moduloInfo?.titulo || ''
      };
    }) || existingFormulario.modulos,
    updatedAt: new Date().toISOString()
  };
};

const deleteFormulario = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

interface FormFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formulario?: Formulario;
  mode: 'create' | 'edit' | 'view';
}

function FormFormModal({ isOpen, onClose, formulario, mode }: FormFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateFormularioData>({
    nombre: formulario?.nombre || '',
    titulo: formulario?.titulo || '',
    descripcion: formulario?.descripcion || '',
    express: formulario?.express || false,
    compraMateriales: formulario?.compraMateriales || false,
    modulos: formulario?.modulos.map(({ id, moduloNombre, moduloTitulo, ...rest }) => rest) || []
  });

  const createMutation = useMutation({
    mutationFn: createFormulario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formularios'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateFormularioData>) => updateFormulario(formulario!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formularios'] });
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

  const addModulo = () => {
    setFormData(prev => ({
      ...prev,
      modulos: [...prev.modulos, {
        pagina: 1,
        nombre: '',
        orden: prev.modulos.length + 1,
        moduloId: '',
        equipo: ''
      }]
    }));
  };

  const removeModulo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.filter((_, i) => i !== index)
    }));
  };

  const updateModulo = (index: number, field: keyof Omit<ModuloFormulario, 'id' | 'moduloNombre' | 'moduloTitulo'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.map((modulo, i) => 
        i === index ? { ...modulo, [field]: value } : modulo
      )
    }));
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' && 'Crear Nuevo Formulario'}
              {mode === 'edit' && 'Editar Formulario'}
              {mode === 'view' && 'Detalles del Formulario'}
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
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="nombre_formulario"
                required
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Título del Formulario"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Descripción del formulario"
              disabled={isReadOnly}
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.express}
                onChange={(e) => setFormData(prev => ({ ...prev, express: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                disabled={isReadOnly}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Express</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.compraMateriales}
                onChange={(e) => setFormData(prev => ({ ...prev, compraMateriales: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                disabled={isReadOnly}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Compra de materiales</span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Módulos
              </label>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addModulo}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  + Añadir módulo
                </button>
              )}
            </div>

            <div className="space-y-4">
              {formData.modulos.map((modulo, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Página *
                      </label>
                      <input
                        type="number"
                        value={modulo.pagina}
                        onChange={(e) => updateModulo(index, 'pagina', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="1"
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={modulo.nombre}
                        onChange={(e) => updateModulo(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Nombre del módulo"
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orden *
                      </label>
                      <input
                        type="number"
                        value={modulo.orden}
                        onChange={(e) => updateModulo(index, 'orden', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="1"
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Módulo *
                      </label>
                      <select
                        value={modulo.moduloId}
                        onChange={(e) => updateModulo(index, 'moduloId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                        disabled={isReadOnly}
                      >
                        <option value="">Seleccionar módulo</option>
                        {mockModulosDisponibles.map((moduloDisp) => (
                          <option key={moduloDisp.id} value={moduloDisp.id}>
                            {moduloDisp.titulo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipo
                      </label>
                      <select
                        value={modulo.equipo}
                        onChange={(e) => updateModulo(index, 'equipo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        disabled={isReadOnly}
                      >
                        <option value="">Seleccionar equipo</option>
                        {equiposDisponibles.map((equipo) => (
                          <option key={equipo} value={equipo}>
                            {equipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeModulo(index)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {formData.modulos.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No hay módulos definidos. Haz clic en <span className='italic'>Añadir módulo</span> para agregar.
                </p>
              )}
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
                  mode === 'create' ? 'Crear Formulario' : 'Guardar Cambios'
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
  formularioName: string;
  isLoading: boolean;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, formularioName, isLoading }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el formulario <strong>{formularioName}</strong>? 
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

type SortField = 'nombre' | 'titulo' | 'modulos';
type SortDirection = 'asc' | 'desc';

function FormulariosContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormularios, setSelectedFormularios] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    formulario?: Formulario;
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    formulario?: Formulario;
  }>({
    isOpen: false
  });

  const queryClient = useQueryClient();

  const { data: formularios, isLoading } = useQuery({
    queryKey: ['formularios'],
    queryFn: fetchFormularios,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFormulario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formularios'] });
      setDeleteModal({ isOpen: false });
    }
  });

  const filteredFormularios = formularios?.filter(formulario => {
    const searchLower = searchTerm.toLowerCase();
    return (
      formulario.nombre.toLowerCase().includes(searchLower) ||
      formulario.titulo.toLowerCase().includes(searchLower) ||
      formulario.descripcion.toLowerCase().includes(searchLower)
    );
  }) || [];

  const sortedFormularios = [...filteredFormularios].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'modulos') {
      aValue = a.modulos.length;
      bValue = b.modulos.length;
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
      setSelectedFormularios(sortedFormularios.map(formulario => formulario.id));
    } else {
      setSelectedFormularios([]);
    }
  };

  const handleSelectFormulario = (formularioId: string, checked: boolean) => {
    if (checked) {
      setSelectedFormularios(prev => [...prev, formularioId]);
    } else {
      setSelectedFormularios(prev => prev.filter(id => id !== formularioId));
    }
  };

  const handleDeleteFormulario = (formulario: Formulario) => {
    setDeleteModal({ isOpen: true, formulario });
  };

  const confirmDelete = () => {
    if (deleteModal.formulario) {
      deleteMutation.mutate(deleteModal.formulario.id);
    }
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
          <p className="mt-4 text-gray-600">Cargando formularios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Formularios</h1>
          <p className="text-gray-600 mt-1">
            Crea y administra formularios personalizados
          </p>
        </div>
        
        <button 
          onClick={() => setModalState({ isOpen: true, mode: 'create' })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Formulario</span>
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
                placeholder="Buscar formularios por nombre, título o descripción..."
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
                    checked={selectedFormularios.length === sortedFormularios.length && sortedFormularios.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="nombre">Nombre</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="titulo">Título</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Express
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compra de materiales
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="modulos"># Módulos incluidos</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFormularios.map((formulario, index) => (
                <tr 
                  key={formulario.id} 
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    selectedFormularios.includes(formulario.id) && 'bg-orange-50',
                    index % 2 === 1 && 'bg-gray-25'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedFormularios.includes(formulario.id)}
                      onChange={(e) => handleSelectFormulario(formulario.id, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <FileCheck className="text-orange-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-900 font-mono">{formulario.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{formulario.titulo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      formulario.express 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    )}>
                      {formulario.express ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      formulario.compraMateriales 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    )}>
                      {formulario.compraMateriales ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{formulario.modulos.length}</span>
                      <span className="ml-1 text-xs text-gray-500">módulos</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setModalState({ isOpen: true, mode: 'view', formulario })}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setModalState({ isOpen: true, mode: 'edit', formulario })}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteFormulario(formulario)}
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

        {sortedFormularios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileCheck className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No hay formularios</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'No se encontraron formularios con el término de búsqueda.'
                : 'Comienza creando un nuevo formulario.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedFormularios.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{sortedFormularios.length}</span> formularios
            {selectedFormularios.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedFormularios.length}</span> seleccionados)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Página 1 de 1
          </div>
        </div>
      )}

      {/* Modals */}
      <FormFormModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        formulario={modalState.formulario}
        mode={modalState.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        formularioName={deleteModal.formulario?.titulo || ''}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function FormulariosPage() {
  return (
    <ProtectedLayout>
      <FormulariosContent />
    </ProtectedLayout>
  );
}
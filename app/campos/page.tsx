'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Type, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Settings,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/utils/cn';


interface Campo {
  id: string;
  nombre: string;
  titulo: string;
  tipo: 'texto' | 'numero' | 'seleccion_multiple' | 'casilla_verificacion' | 'fecha' | 'fecha_hora' | 'foto' | 'desplegable';
  descripcion: string;
  opciones?: OpcionCampo[];
  createdAt: string;
  updatedAt: string;
}

interface OpcionCampo {
  id: string;
  nombre: string;
  incidencia: number;
}

interface CreateCampoData {
  nombre: string;
  titulo: string;
  tipo: Campo['tipo'];
  descripcion: string;
  opciones?: Omit<OpcionCampo, 'id'>[];
}

// Mock data
const mockCampos: Campo[] = [
  {
    id: '1',
    nombre: 'estado_equipo',
    titulo: 'Estado del Equipo',
    tipo: 'desplegable',
    descripcion: 'Estado actual del equipo a revisar',
    opciones: [
      { id: '1', nombre: 'Funcionando', incidencia: 0 },
      { id: '2', nombre: 'Con fallas menores', incidencia: 1 },
      { id: '3', nombre: 'Fuera de servicio', incidencia: 3 }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    nombre: 'observaciones_tecnico',
    titulo: 'Observaciones del Técnico',
    tipo: 'texto',
    descripcion: 'Comentarios y observaciones del técnico',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    nombre: 'fecha_mantenimiento',
    titulo: 'Fecha de Mantenimiento',
    tipo: 'fecha',
    descripcion: 'Fecha programada para el próximo mantenimiento',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  },
  {
    id: '4',
    nombre: 'requiere_repuestos',
    titulo: 'Requiere Repuestos',
    tipo: 'casilla_verificacion',
    descripcion: 'Indica si el equipo necesita repuestos',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: '5',
    nombre: 'foto_evidencia',
    titulo: 'Foto de Evidencia',
    tipo: 'foto',
    descripcion: 'Fotografía del estado actual del equipo',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-13T11:30:00Z'
  }
];

const tiposCampo = [
  { value: 'texto', label: 'Texto' },
  { value: 'numero', label: 'Número' },
  { value: 'seleccion_multiple', label: 'Selección Múltiple' },
  { value: 'casilla_verificacion', label: 'Casilla de Verificación' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'fecha_hora', label: 'Fecha y Hora' },
  { value: 'foto', label: 'Foto' },
  { value: 'desplegable', label: 'Desplegable' }
];

const fetchCampos = async (): Promise<Campo[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockCampos;
};

const createCampo = async (data: CreateCampoData): Promise<Campo> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newCampo: Campo = {
    id: Date.now().toString(),
    ...data,
    opciones: data.opciones?.map((opcion, index) => ({
      ...opcion,
      id: `${Date.now()}-${index}`
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newCampo;
};

const updateCampo = async (id: string, data: Partial<CreateCampoData>): Promise<Campo> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const existingCampo = mockCampos.find(c => c.id === id);
  if (!existingCampo) throw new Error('Campo no encontrado');
  
  return {
    ...existingCampo,
    ...data,
    opciones: data.opciones?.map((opcion, index) => ({
      ...opcion,
      id: `${Date.now()}-${index}`
    })),
    updatedAt: new Date().toISOString()
  };
};

const deleteCampo = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

interface FieldFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  campo?: Campo;
  mode: 'create' | 'edit' | 'view';
}

function FieldFormModal({ isOpen, onClose, campo, mode }: FieldFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateCampoData>({
    nombre: campo?.nombre || '',
    titulo: campo?.titulo || '',
    tipo: campo?.tipo || 'texto',
    descripcion: campo?.descripcion || '',
    opciones: campo?.opciones?.map(({ id, ...rest }) => rest) || []
  });

  const createMutation = useMutation({
    mutationFn: createCampo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campos'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCampoData>) => updateCampo(campo!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campos'] });
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

  const addOpcion = () => {
    setFormData(prev => ({
      ...prev,
      opciones: [...(prev.opciones || []), { nombre: '', incidencia: 0 }]
    }));
  };

  const removeOpcion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones?.filter((_, i) => i !== index)
    }));
  };

  const updateOpcion = (index: number, field: keyof Omit<OpcionCampo, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones?.map((opcion, i) => 
        i === index ? { ...opcion, [field]: value } : opcion
      )
    }));
  };

  const requiresOpciones = formData.tipo === 'seleccion_multiple' || formData.tipo === 'desplegable';

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' && 'Crear Nuevo Campo'}
              {mode === 'edit' && 'Editar Campo'}
              {mode === 'view' && 'Detalles del Campo'}
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
                placeholder="nombre_campo"
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
                placeholder="Título del Campo"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tipo: e.target.value as Campo['tipo'],
                opciones: e.target.value === 'seleccion_multiple' || e.target.value === 'desplegable' 
                  ? prev.opciones || [] 
                  : undefined
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              disabled={isReadOnly}
            >
              {tiposCampo.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
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
              placeholder="Descripción del campo"
              disabled={isReadOnly}
            />
          </div>

          {requiresOpciones && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Opciones
                </label>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={addOpcion}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    + Añadir opción
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {formData.opciones?.map((opcion, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={opcion.nombre}
                        onChange={(e) => updateOpcion(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Nombre de la opción"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={opcion.incidencia}
                        onChange={(e) => updateOpcion(index, 'incidencia', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Incidencia"
                        min="0"
                        disabled={isReadOnly}
                      />
                    </div>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeOpcion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                {formData.opciones?.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay opciones definidas. Haz clic en "Añadir opción" para agregar.
                  </p>
                )}
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
                    <span className="ml-2">
                      {mode === 'create' ? 'Creando...' : 'Guardando...'}
                    </span>
                  </>
                ) : (
                  mode === 'create' ? 'Crear Campo' : 'Guardar Cambios'
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
  campoName: string;
  isLoading: boolean;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, campoName, isLoading }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el campo <strong>{campoName}</strong>? 
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

type SortField = 'nombre' | 'titulo' | 'tipo';
type SortDirection = 'asc' | 'desc';

function CamposContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampos, setSelectedCampos] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    campo?: Campo;
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    campo?: Campo;
  }>({
    isOpen: false
  });

  const queryClient = useQueryClient();

  const { data: campos, isLoading } = useQuery({
    queryKey: ['campos'],
    queryFn: fetchCampos,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCampo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campos'] });
      setDeleteModal({ isOpen: false });
    }
  });

  const filteredCampos = campos?.filter(campo => {
    const searchLower = searchTerm.toLowerCase();
    return (
      campo.nombre.toLowerCase().includes(searchLower) ||
      campo.titulo.toLowerCase().includes(searchLower) ||
      campo.descripcion.toLowerCase().includes(searchLower)
    );
  }) || [];

  const sortedCampos = [...filteredCampos].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
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
      setSelectedCampos(sortedCampos.map(campo => campo.id));
    } else {
      setSelectedCampos([]);
    }
  };

  const handleSelectCampo = (campoId: string, checked: boolean) => {
    if (checked) {
      setSelectedCampos(prev => [...prev, campoId]);
    } else {
      setSelectedCampos(prev => prev.filter(id => id !== campoId));
    }
  };

  const handleDeleteCampo = (campo: Campo) => {
    setDeleteModal({ isOpen: true, campo });
  };

  const confirmDelete = () => {
    if (deleteModal.campo) {
      deleteMutation.mutate(deleteModal.campo.id);
    }
  };

  const getTipoLabel = (tipo: Campo['tipo']) => {
    return tiposCampo.find(t => t.value === tipo)?.label || tipo;
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
          <p className="mt-4 text-gray-600">Cargando campos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💳 Campos</h1>
          <p className="text-gray-600 mt-1">
            Crea y gestiona tipos de campo para formularios
          </p>
        </div>
        
        <button 
          onClick={() => setModalState({ isOpen: true, mode: 'create' })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Campo</span>
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
                placeholder="Buscar campos por nombre, título o descripción..."
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
                    checked={selectedCampos.length === sortedCampos.length && sortedCampos.length > 0}
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
                  <SortButton field="tipo">Tipo</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCampos.map((campo, index) => (
                <tr 
                  key={campo.id} 
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    selectedCampos.includes(campo.id) && 'bg-orange-50',
                    index % 2 === 1 && 'bg-gray-25'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCampos.includes(campo.id)}
                      onChange={(e) => handleSelectCampo(campo.id, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Type className="text-orange-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-900 font-mono">{campo.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{campo.titulo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getTipoLabel(campo.tipo)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-48 truncate" title={campo.descripcion}>
                      <span className="text-sm text-gray-900">{campo.descripcion}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setModalState({ isOpen: true, mode: 'view', campo })}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setModalState({ isOpen: true, mode: 'edit', campo })}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCampo(campo)}
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

        {sortedCampos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Type className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No hay campos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'No se encontraron campos con el término de búsqueda.'
                : 'Comienza creando un nuevo campo.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedCampos.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{sortedCampos.length}</span> campos
            {selectedCampos.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedCampos.length}</span> seleccionados)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Página 1 de 1
          </div>
        </div>
      )}

      {/* Modals */}
      <FieldFormModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        campo={modalState.campo}
        mode={modalState.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        campoName={deleteModal.campo?.titulo || ''}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function CamposPage() {
  return (
    <ProtectedLayout>
      <CamposContent />
    </ProtectedLayout>
  );
}
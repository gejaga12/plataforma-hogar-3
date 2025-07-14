'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Layers, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Move,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Link
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface Modulo {
  id: string;
  nombre: string;
  titulo: string;
  campos: CampoModulo[];
  createdAt: string;
  updatedAt: string;
}

interface CampoModulo {
  id: string;
  campoId: string;
  campoNombre: string;
  campoTitulo: string;
  campoTipo: string;
  opcionId?: string;
  opcionNombre?: string;
  orden: number;
  ancho: '25%' | '50%' | '75%' | '100%';
  requerido: boolean;
  permiteAgregar: boolean;
  tareaTecnico: string;
  vistaInforme: string;
  dependencia?: {
    campoPadreId: string;
    operador: '==' | '!=' | 'contains' | '>' | '<' | '>=' | '<=';
    valor: string;
  };
}

interface CreateModuloData {
  nombre: string;
  titulo: string;
  campos: Omit<CampoModulo, 'id' | 'campoNombre' | 'campoTitulo' | 'campoTipo' | 'opcionNombre'>[];
}

// Mock data para campos disponibles
const mockCamposDisponibles = [
  { 
    id: '1', 
    nombre: 'existe_aire_acondicionado', 
    titulo: '¿Existe aire acondicionado?', 
    tipo: 'casilla_verificacion', 
    opciones: [] 
  },
  { 
    id: '2', 
    nombre: 'marca_aire_acondicionado', 
    titulo: 'Marca del aire acondicionado', 
    tipo: 'texto', 
    opciones: [] 
  },
  { 
    id: '3', 
    nombre: 'estado_equipo', 
    titulo: 'Estado del Equipo', 
    tipo: 'desplegable', 
    opciones: [
      { id: '1', nombre: 'Funcionando' },
      { id: '2', nombre: 'Con fallas menores' },
      { id: '3', nombre: 'Fuera de servicio' }
    ]
  },
  { 
    id: '4', 
    nombre: 'observaciones_tecnico', 
    titulo: 'Observaciones del Técnico', 
    tipo: 'texto', 
    opciones: [] 
  },
  { 
    id: '5', 
    nombre: 'fecha_mantenimiento', 
    titulo: 'Fecha de Mantenimiento', 
    tipo: 'fecha', 
    opciones: [] 
  },
  { 
    id: '6', 
    nombre: 'requiere_repuestos', 
    titulo: 'Requiere Repuestos', 
    tipo: 'casilla_verificacion', 
    opciones: [] 
  },
  { 
    id: '7', 
    nombre: 'foto_evidencia', 
    titulo: 'Foto de Evidencia', 
    tipo: 'foto', 
    opciones: [] 
  },
  { 
    id: '8', 
    nombre: 'temperatura_ambiente', 
    titulo: 'Temperatura Ambiente (°C)', 
    tipo: 'numero', 
    opciones: [] 
  }
];

const operadoresDisponibles = [
  { value: '==', label: 'Igual a (==)' },
  { value: '!=', label: 'Diferente de (!=)' },
  { value: 'contains', label: 'Contiene' },
  { value: '>', label: 'Mayor que (>)' },
  { value: '<', label: 'Menor que (<)' },
  { value: '>=', label: 'Mayor o igual (>=)' },
  { value: '<=', label: 'Menor o igual (<=)' }
];

const mockModulos: Modulo[] = [
  {
    id: '1',
    nombre: 'revision_aire_acondicionado',
    titulo: 'Revisión de Aire Acondicionado',
    campos: [
      {
        id: '1',
        campoId: '1',
        campoNombre: 'existe_aire_acondicionado',
        campoTitulo: '¿Existe aire acondicionado?',
        campoTipo: 'casilla_verificacion',
        orden: 1,
        ancho: '50%',
        requerido: true,
        permiteAgregar: false,
        tareaTecnico: 'Verifica si hay aire acondicionado instalado',
        vistaInforme: 'Aire acondicionado presente'
      },
      {
        id: '2',
        campoId: '2',
        campoNombre: 'marca_aire_acondicionado',
        campoTitulo: 'Marca del aire acondicionado',
        campoTipo: 'texto',
        orden: 2,
        ancho: '50%',
        requerido: true,
        permiteAgregar: false,
        tareaTecnico: 'Identifica la marca del equipo',
        vistaInforme: 'Marca del equipo',
        dependencia: {
          campoPadreId: '1',
          operador: '==',
          valor: 'true'
        }
      },
      {
        id: '3',
        campoId: '3',
        campoNombre: 'estado_equipo',
        campoTitulo: 'Estado del Equipo',
        campoTipo: 'desplegable',
        orden: 3,
        ancho: '50%',
        requerido: true,
        permiteAgregar: false,
        tareaTecnico: 'Evalúa el estado actual del equipo',
        vistaInforme: 'Estado del equipo',
        dependencia: {
          campoPadreId: '1',
          operador: '==',
          valor: 'true'
        }
      },
      {
        id: '4',
        campoId: '8',
        campoNombre: 'temperatura_ambiente',
        campoTitulo: 'Temperatura Ambiente (°C)',
        campoTipo: 'numero',
        orden: 4,
        ancho: '25%',
        requerido: false,
        permiteAgregar: false,
        tareaTecnico: 'Mide la temperatura del ambiente',
        vistaInforme: 'Temperatura ambiente'
      },
      {
        id: '5',
        campoId: '7',
        campoNombre: 'foto_evidencia',
        campoTitulo: 'Foto de Evidencia',
        campoTipo: 'foto',
        orden: 5,
        ancho: '50%',
        requerido: true,
        permiteAgregar: true,
        tareaTecnico: 'Toma una foto del equipo',
        vistaInforme: 'Evidencia fotográfica',
        dependencia: {
          campoPadreId: '8',
          operador: '>',
          valor: '25'
        }
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    nombre: 'mantenimiento_preventivo',
    titulo: 'Mantenimiento Preventivo',
    campos: [
      {
        id: '6',
        campoId: '5',
        campoNombre: 'fecha_mantenimiento',
        campoTitulo: 'Fecha de Mantenimiento',
        campoTipo: 'fecha',
        orden: 1,
        ancho: '50%',
        requerido: true,
        permiteAgregar: false,
        tareaTecnico: 'Programa la próxima fecha de mantenimiento',
        vistaInforme: 'Próximo mantenimiento'
      },
      {
        id: '7',
        campoId: '6',
        campoNombre: 'requiere_repuestos',
        campoTitulo: 'Requiere Repuestos',
        campoTipo: 'casilla_verificacion',
        orden: 2,
        ancho: '25%',
        requerido: false,
        permiteAgregar: false,
        tareaTecnico: 'Marca si necesita repuestos',
        vistaInforme: 'Requiere repuestos'
      }
    ],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  }
];

const fetchModulos = async (): Promise<Modulo[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockModulos;
};

const createModulo = async (data: CreateModuloData): Promise<Modulo> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newModulo: Modulo = {
    id: Date.now().toString(),
    ...data,
    campos: data.campos.map((campo, index) => {
      const campoInfo = mockCamposDisponibles.find(c => c.id === campo.campoId);
      const opcionInfo = campoInfo?.opciones.find(o => o.id === campo.opcionId);
      return {
        ...campo,
        id: `${Date.now()}-${index}`,
        campoNombre: campoInfo?.nombre || '',
        campoTitulo: campoInfo?.titulo || '',
        campoTipo: campoInfo?.tipo || '',
        opcionNombre: opcionInfo?.nombre
      };
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newModulo;
};

const updateModulo = async (id: string, data: Partial<CreateModuloData>): Promise<Modulo> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const existingModulo = mockModulos.find(m => m.id === id);
  if (!existingModulo) throw new Error('Módulo no encontrado');
  
  return {
    ...existingModulo,
    ...data,
    campos: data.campos?.map((campo, index) => {
      const campoInfo = mockCamposDisponibles.find(c => c.id === campo.campoId);
      const opcionInfo = campoInfo?.opciones.find(o => o.id === campo.opcionId);
      return {
        ...campo,
        id: `${Date.now()}-${index}`,
        campoNombre: campoInfo?.nombre || '',
        campoTitulo: campoInfo?.titulo || '',
        campoTipo: campoInfo?.tipo || '',
        opcionNombre: opcionInfo?.nombre
      };
    }) || existingModulo.campos,
    updatedAt: new Date().toISOString()
  };
};

const deleteModulo = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  modulo?: Modulo;
  mode: 'create' | 'edit' | 'view';
}

function ModuleFormModal({ isOpen, onClose, modulo, mode }: ModuleFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateModuloData>({
    nombre: modulo?.nombre || '',
    titulo: modulo?.titulo || '',
    campos: modulo?.campos.map(({ id, campoNombre, campoTitulo, campoTipo, opcionNombre, ...rest }) => rest) || []
  });

  const createMutation = useMutation({
    mutationFn: createModulo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modulos'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateModuloData>) => updateModulo(modulo!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modulos'] });
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

  const addCampo = () => {
    setFormData(prev => ({
      ...prev,
      campos: [...prev.campos, {
        campoId: '',
        opcionId: undefined,
        orden: prev.campos.length + 1,
        ancho: '100%',
        requerido: false,
        permiteAgregar: false,
        tareaTecnico: '',
        vistaInforme: ''
      }]
    }));
  };

  const removeCampo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      campos: prev.campos.filter((_, i) => i !== index)
    }));
  };

  const updateCampo = (index: number, field: keyof Omit<CampoModulo, 'id' | 'campoNombre' | 'campoTitulo' | 'campoTipo' | 'opcionNombre'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      campos: prev.campos.map((campo, i) => 
        i === index ? { ...campo, [field]: value } : campo
      )
    }));
  };

  const updateDependencia = (index: number, field: keyof NonNullable<CampoModulo['dependencia']>, value: any) => {
    setFormData(prev => ({
      ...prev,
      campos: prev.campos.map((campo, i) => 
        i === index ? { 
          ...campo, 
          dependencia: { 
            ...campo.dependencia,
            campoPadreId: campo.dependencia?.campoPadreId || '',
            operador: campo.dependencia?.operador || '==',
            valor: campo.dependencia?.valor || '',
            [field]: value 
          } 
        } : campo
      )
    }));
  };

  const toggleDependencia = (index: number, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      campos: prev.campos.map((campo, i) => 
        i === index ? { 
          ...campo, 
          dependencia: enabled ? {
            campoPadreId: '',
            operador: '==',
            valor: ''
          } : undefined
        } : campo
      )
    }));
  };

  const getCampoOpciones = (campoId: string) => {
    return mockCamposDisponibles.find(c => c.id === campoId)?.opciones || [];
  };

  const requiresOpcion = (campoId: string) => {
    const campo = mockCamposDisponibles.find(c => c.id === campoId);
    return campo?.tipo === 'desplegable' || campo?.tipo === 'seleccion_multiple';
  };

  const allowsAgregar = (campoId: string) => {
    const campo = mockCamposDisponibles.find(c => c.id === campoId);
    return campo?.tipo === 'foto' || campo?.tipo === 'seleccion_multiple';
  };

  const getCamposPadreDisponibles = (currentIndex: number) => {
    return formData.campos
      .slice(0, currentIndex) // Solo campos anteriores en el orden
      .filter(campo => campo.campoId) // Solo campos con ID válido
      .map(campo => {
        const campoInfo = mockCamposDisponibles.find(c => c.id === campo.campoId);
        return {
          id: campo.campoId,
          titulo: campoInfo?.titulo || '',
          tipo: campoInfo?.tipo || ''
        };
      });
  };

  const getValoresPosibles = (campoPadreId: string, operador: string) => {
    const campoPadre = mockCamposDisponibles.find(c => c.id === campoPadreId);
    if (!campoPadre) return [];

    switch (campoPadre.tipo) {
      case 'casilla_verificacion':
        return [
          { value: 'true', label: 'Sí' },
          { value: 'false', label: 'No' }
        ];
      case 'desplegable':
      case 'seleccion_multiple':
        return campoPadre.opciones.map(opcion => ({
          value: opcion.nombre,
          label: opcion.nombre
        }));
      default:
        return []; // Para texto, número, fecha, etc. se permite entrada libre
    }
  };

  const validateDependencia = (campo: CampoModulo, index: number): string | null => {
    if (!campo.dependencia) return null;

    const { campoPadreId, operador, valor } = campo.dependencia;
    
    if (!campoPadreId) return 'Debe seleccionar un campo padre';
    if (!operador) return 'Debe seleccionar un operador';
    if (!valor.trim()) return 'Debe especificar un valor';

    // Verificar que el campo padre esté antes en el orden
    const camposPadreDisponibles = getCamposPadreDisponibles(index);
    const campoPadreValido = camposPadreDisponibles.find(cp => cp.id === campoPadreId);
    
    if (!campoPadreValido) {
      return 'El campo padre debe estar antes en el orden del módulo';
    }

    return null;
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' && 'Crear Nuevo Módulo'}
              {mode === 'edit' && 'Editar Módulo'}
              {mode === 'view' && 'Detalles del Módulo'}
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
                placeholder="nombre_modulo"
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
                placeholder="Título del Módulo"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Campos
              </label>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addCampo}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  + Añadir campo
                </button>
              )}
            </div>

            <div className="space-y-6">
              {formData.campos.map((campo, index) => {
                const camposPadreDisponibles = getCamposPadreDisponibles(index);
                const valoresPosibles = campo.dependencia ? getValoresPosibles(campo.dependencia.campoPadreId, campo.dependencia.operador) : [];
                const errorDependencia = validateDependencia(campo, index);

                return (
                  <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Campo #{index + 1}</h4>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeCampo(index)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Campo *
                        </label>
                        <select
                          value={campo.campoId}
                          onChange={(e) => {
                            updateCampo(index, 'campoId', e.target.value);
                            updateCampo(index, 'opcionId', undefined);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                          disabled={isReadOnly}
                        >
                          <option value="">Seleccionar campo</option>
                          {mockCamposDisponibles.map((campoDisp) => (
                            <option key={campoDisp.id} value={campoDisp.id}>
                              {campoDisp.titulo}
                            </option>
                          ))}
                        </select>
                      </div>

                      {requiresOpcion(campo.campoId) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opción
                          </label>
                          <select
                            value={campo.opcionId || ''}
                            onChange={(e) => updateCampo(index, 'opcionId', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            disabled={isReadOnly}
                          >
                            <option value="">Todas las opciones</option>
                            {getCampoOpciones(campo.campoId).map((opcion) => (
                              <option key={opcion.id} value={opcion.id}>
                                {opcion.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Orden *
                        </label>
                        <input
                          type="number"
                          value={campo.orden}
                          onChange={(e) => updateCampo(index, 'orden', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          min="1"
                          required
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ancho *
                        </label>
                        <select
                          value={campo.ancho}
                          onChange={(e) => updateCampo(index, 'ancho', e.target.value as CampoModulo['ancho'])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                          disabled={isReadOnly}
                        >
                          <option value="25%">25%</option>
                          <option value="50%">50%</option>
                          <option value="75%">75%</option>
                          <option value="100%">100%</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tarea Técnico
                        </label>
                        <input
                          type="text"
                          value={campo.tareaTecnico}
                          onChange={(e) => updateCampo(index, 'tareaTecnico', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Instrucción para el técnico"
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vista Informe
                        </label>
                        <input
                          type="text"
                          value={campo.vistaInforme}
                          onChange={(e) => updateCampo(index, 'vistaInforme', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Etiqueta en el reporte"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={campo.requerido}
                          onChange={(e) => updateCampo(index, 'requerido', e.target.checked)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          disabled={isReadOnly}
                        />
                        <span className="ml-2 text-sm text-gray-700">Requerido</span>
                      </label>

                      {allowsAgregar(campo.campoId) && (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={campo.permiteAgregar}
                            onChange={(e) => updateCampo(index, 'permiteAgregar', e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            disabled={isReadOnly}
                          />
                          <span className="ml-2 text-sm text-gray-700">Permite agregar</span>
                        </label>
                      )}

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!campo.dependencia}
                          onChange={(e) => toggleDependencia(index, e.target.checked)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          disabled={isReadOnly}
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <Link size={14} className="mr-1" />
                          ¿Tiene dependencia?
                        </span>
                      </label>
                    </div>

                    {/* Sección de Dependencia */}
                    {campo.dependencia && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                          <Link size={16} className="mr-2" />
                          Configuración de Dependencia
                        </h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">
                              Campo Padre *
                            </label>
                            <select
                              value={campo.dependencia.campoPadreId}
                              onChange={(e) => updateDependencia(index, 'campoPadreId', e.target.value)}
                              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                              disabled={isReadOnly}
                            >
                              <option value="">Seleccionar campo padre</option>
                              {camposPadreDisponibles.map((campoPadre) => (
                                <option key={campoPadre.id} value={campoPadre.id}>
                                  {campoPadre.titulo}
                                </option>
                              ))}
                            </select>
                            {camposPadreDisponibles.length === 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                No hay campos anteriores disponibles
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">
                              Operador *
                            </label>
                            <select
                              value={campo.dependencia.operador}
                              onChange={(e) => updateDependencia(index, 'operador', e.target.value)}
                              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                              disabled={isReadOnly}
                            >
                              {operadoresDisponibles.map((operador) => (
                                <option key={operador.value} value={operador.value}>
                                  {operador.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">
                              Valor *
                            </label>
                            {valoresPosibles.length > 0 ? (
                              <select
                                value={campo.dependencia.valor}
                                onChange={(e) => updateDependencia(index, 'valor', e.target.value)}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isReadOnly}
                              >
                                <option value="">Seleccionar valor</option>
                                {valoresPosibles.map((valor) => (
                                  <option key={valor.value} value={valor.value}>
                                    {valor.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={campo.dependencia.valor}
                                onChange={(e) => updateDependencia(index, 'valor', e.target.value)}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Valor de comparación"
                                required
                                disabled={isReadOnly}
                              />
                            )}
                          </div>
                        </div>

                        {errorDependencia && (
                          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                            {errorDependencia}
                          </div>
                        )}

                        <div className="mt-3 text-xs text-blue-600">
                          <strong>Ejemplo:</strong> Este campo se mostrará solo cuando "{camposPadreDisponibles.find(cp => cp.id === campo.dependencia?.campoPadreId)?.titulo || 'Campo Padre'}" {campo.dependencia.operador} "{campo.dependencia.valor}"
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {formData.campos.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No hay campos definidos. Haz clic en "Añadir campo" para agregar.
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
                  mode === 'create' ? 'Crear Módulo' : 'Guardar Cambios'
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
  moduloName: string;
  isLoading: boolean;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, moduloName, isLoading }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el módulo <strong>{moduloName}</strong>? 
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

type SortField = 'nombre' | 'titulo' | 'campos';
type SortDirection = 'asc' | 'desc';

function ModulosContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModulos, setSelectedModulos] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    modulo?: Modulo;
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    modulo?: Modulo;
  }>({
    isOpen: false
  });

  const queryClient = useQueryClient();

  const { data: modulos, isLoading } = useQuery({
    queryKey: ['modulos'],
    queryFn: fetchModulos,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteModulo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modulos'] });
      setDeleteModal({ isOpen: false });
    }
  });

  const filteredModulos = modulos?.filter(modulo => {
    const searchLower = searchTerm.toLowerCase();
    return (
      modulo.nombre.toLowerCase().includes(searchLower) ||
      modulo.titulo.toLowerCase().includes(searchLower)
    );
  }) || [];

  const sortedModulos = [...filteredModulos].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'campos') {
      aValue = a.campos.length;
      bValue = b.campos.length;
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
      setSelectedModulos(sortedModulos.map(modulo => modulo.id));
    } else {
      setSelectedModulos([]);
    }
  };

  const handleSelectModulo = (moduloId: string, checked: boolean) => {
    if (checked) {
      setSelectedModulos(prev => [...prev, moduloId]);
    } else {
      setSelectedModulos(prev => prev.filter(id => id !== moduloId));
    }
  };

  const handleDeleteModulo = (modulo: Modulo) => {
    setDeleteModal({ isOpen: true, modulo });
  };

  const confirmDelete = () => {
    if (deleteModal.modulo) {
      deleteMutation.mutate(deleteModal.modulo.id);
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
          <p className="mt-4 text-gray-600">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧩 Módulos</h1>
          <p className="text-gray-600 mt-1">
            Agrupa lógicamente campos dentro de formularios
          </p>
        </div>
        
        <button 
          onClick={() => setModalState({ isOpen: true, mode: 'create' })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Módulo</span>
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
                placeholder="Buscar módulos por nombre o título..."
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
                    checked={selectedModulos.length === sortedModulos.length && sortedModulos.length > 0}
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
                  <SortButton field="campos"># Campos incluidos</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dependencias
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedModulos.map((modulo, index) => {
                const camposConDependencia = modulo.campos.filter(campo => campo.dependencia);
                
                return (
                  <tr 
                    key={modulo.id} 
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      selectedModulos.includes(modulo.id) && 'bg-orange-50',
                      index % 2 === 1 && 'bg-gray-25'
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedModulos.includes(modulo.id)}
                        onChange={(e) => handleSelectModulo(modulo.id, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Layers className="text-orange-500 mr-2" size={16} />
                        <span className="text-sm font-medium text-gray-900 font-mono">{modulo.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{modulo.titulo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{modulo.campos.length}</span>
                        <span className="ml-1 text-xs text-gray-500">campos</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {camposConDependencia.length > 0 ? (
                        <div className="flex items-center">
                          <Link className="text-blue-500 mr-1\" size={14} />
                          <span className="text-sm text-blue-600 font-medium">{camposConDependencia.length}</span>
                          <span className="ml-1 text-xs text-gray-500">dependencias</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sin dependencias</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setModalState({ isOpen: true, mode: 'view', modulo })}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setModalState({ isOpen: true, mode: 'edit', modulo })}
                          className="text-orange-600 hover:text-orange-800 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteModulo(modulo)}
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

        {sortedModulos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Layers className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No hay módulos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'No se encontraron módulos con el término de búsqueda.'
                : 'Comienza creando un nuevo módulo.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedModulos.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{sortedModulos.length}</span> módulos
            {selectedModulos.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedModulos.length}</span> seleccionados)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Página 1 de 1
          </div>
        </div>
      )}

      {/* Modals */}
      <ModuleFormModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        modulo={modalState.modulo}
        mode={modalState.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        moduloName={deleteModal.modulo?.titulo || ''}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function ModulosPage() {
  return (
    <ProtectedLayout>
      <ModulosContent />
    </ProtectedLayout>
  );
}
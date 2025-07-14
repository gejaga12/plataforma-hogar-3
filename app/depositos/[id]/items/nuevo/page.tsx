'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Package,
  Save,
  X,
  MapPin,
  Tag,
  QrCode,
  Camera,
  Plus,
  Trash2
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface Atributo {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'seleccion' | 'booleano';
  opciones?: string[];
  requerido: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  atributos: string[]; // IDs de atributos
}

interface CreateItemData {
  nombre: string;
  descripcion: string;
  categoria: string;
  ubicacionInterna: string;
  atributos: Record<string, any>;
  imagenes: File[];
}

// Mock API functions
const fetchCategorias = async (): Promise<Categoria[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      id: 'CAT-001',
      nombre: 'Equipos de Climatización',
      descripcion: 'Aires acondicionados, calefactores y ventiladores',
      color: '#3b82f6', // blue
      atributos: ['ATR-001', 'ATR-002', 'ATR-003', 'ATR-005', 'ATR-006', 'ATR-007']
    },
    {
      id: 'CAT-002',
      nombre: 'Herramientas',
      descripcion: 'Herramientas manuales y eléctricas',
      color: '#f97316', // orange
      atributos: ['ATR-001', 'ATR-002', 'ATR-003', 'ATR-007']
    },
    {
      id: 'CAT-003',
      nombre: 'Repuestos',
      descripcion: 'Repuestos para equipos de climatización',
      color: '#10b981', // green
      atributos: ['ATR-001', 'ATR-002', 'ATR-003', 'ATR-004']
    }
  ];
};

const fetchAtributos = async (): Promise<Atributo[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 'ATR-001',
      nombre: 'Marca',
      tipo: 'texto',
      requerido: true
    },
    {
      id: 'ATR-002',
      nombre: 'Modelo',
      tipo: 'texto',
      requerido: true
    },
    {
      id: 'ATR-003',
      nombre: 'Número de Serie',
      tipo: 'texto',
      requerido: true
    },
    {
      id: 'ATR-004',
      nombre: 'Fecha de Fabricación',
      tipo: 'fecha',
      requerido: false
    },
    {
      id: 'ATR-005',
      nombre: 'Potencia (W)',
      tipo: 'numero',
      requerido: false
    },
    {
      id: 'ATR-006',
      nombre: 'Tipo de Refrigerante',
      tipo: 'seleccion',
      opciones: ['R32', 'R410A', 'R22', 'R290'],
      requerido: false
    },
    {
      id: 'ATR-007',
      nombre: 'En Garantía',
      tipo: 'booleano',
      requerido: true
    }
  ];
};

const createItem = async (depositoId: string, data: CreateItemData): Promise<any> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: `ITEM-${Date.now()}`, ...data };
};

function NuevoItemContent() {
  const params = useParams();
  const router = useRouter();
  const depositoId = params.id as string;
  
  const [formData, setFormData] = useState<CreateItemData>({
    nombre: '',
    descripcion: '',
    categoria: '',
    ubicacionInterna: '',
    atributos: {},
    imagenes: []
  });
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const { data: categorias, isLoading: loadingCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
  });

  const { data: atributos, isLoading: loadingAtributos } = useQuery({
    queryKey: ['atributos'],
    queryFn: fetchAtributos,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateItemData) => createItem(depositoId, data),
    onSuccess: (data) => {
      router.push(`/depositos/${depositoId}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAtributoChange = (atributoId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      atributos: {
        ...prev.atributos,
        [atributoId]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...newFiles]
      }));
      
      // Create preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getAtributosForCategoria = (categoriaId: string) => {
    const categoria = categorias?.find(cat => cat.id === categoriaId);
    if (!categoria) return [];
    
    return categoria.atributos
      .map(atributoId => atributos?.find(atr => atr.id === atributoId))
      .filter(Boolean) as Atributo[];
  };

  const isLoading = loadingCategorias || loadingAtributos;
  const selectedCategoriaAtributos = getAtributosForCategoria(formData.categoria);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/depositos/${depositoId}`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Nuevo Item
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Agregar un nuevo item al depósito
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ej: Aire Acondicionado Split"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría *
                </label>
                <div className="flex items-center">
                  <Tag size={16} className="text-gray-400 dark:text-gray-500 absolute ml-3" />
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias?.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="Describe las características del item..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ubicación Interna *
                </label>
                <div className="flex items-center">
                  <MapPin size={16} className="text-gray-400 dark:text-gray-500 absolute ml-3" />
                  <input
                    type="text"
                    name="ubicacionInterna"
                    value={formData.ubicacionInterna}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Ej: Estantería A-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código QR
                </label>
                <div className="flex items-center">
                  <QrCode size={16} className="text-gray-400 dark:text-gray-500 absolute ml-3" />
                  <input
                    type="text"
                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    placeholder="Se generará automáticamente"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Atributos */}
            {formData.categoria && selectedCategoriaAtributos.length > 0 && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Atributos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedCategoriaAtributos.map(atributo => (
                    <div key={atributo.id}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {atributo.nombre} {atributo.requerido && '*'}
                      </label>
                      
                      {atributo.tipo === 'texto' && (
                        <input
                          type="text"
                          value={formData.atributos[atributo.id] || ''}
                          onChange={(e) => handleAtributoChange(atributo.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required={atributo.requerido}
                        />
                      )}
                      
                      {atributo.tipo === 'numero' && (
                        <input
                          type="number"
                          value={formData.atributos[atributo.id] || ''}
                          onChange={(e) => handleAtributoChange(atributo.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required={atributo.requerido}
                        />
                      )}
                      
                      {atributo.tipo === 'fecha' && (
                        <input
                          type="date"
                          value={formData.atributos[atributo.id] || ''}
                          onChange={(e) => handleAtributoChange(atributo.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required={atributo.requerido}
                        />
                      )}
                      
                      {atributo.tipo === 'seleccion' && (
                        <select
                          value={formData.atributos[atributo.id] || ''}
                          onChange={(e) => handleAtributoChange(atributo.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required={atributo.requerido}
                        >
                          <option value="">Seleccionar...</option>
                          {atributo.opciones?.map(opcion => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      )}
                      
                      {atributo.tipo === 'booleano' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`atributo-${atributo.id}`}
                            checked={formData.atributos[atributo.id] || false}
                            onChange={(e) => handleAtributoChange(atributo.id, e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                            required={atributo.requerido}
                          />
                          <label htmlFor={`atributo-${atributo.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                            {formData.atributos[atributo.id] ? 'Sí' : 'No'}
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Imágenes */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Imágenes
              </h3>
              
              <div className="space-y-4">
                {/* Preview de imágenes */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Input para subir imágenes */}
                <div className="flex items-center justify-center">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-orange-500 dark:hover:border-orange-500">
                    <Camera size={48} className="mb-2" />
                    <span className="text-sm font-medium">Haz clic para agregar imágenes</span>
                    <span className="text-xs mt-1">PNG, JPG o JPEG hasta 5MB</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push(`/depositos/${depositoId}`)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={createMutation.isPending}
              >
                <div className="flex items-center space-x-2">
                  <X size={16} />
                  <span>Cancelar</span>
                </div>
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  {createMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Guardar</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function NuevoItemPage() {
  return (
    <ProtectedLayout>
      <NuevoItemContent />
    </ProtectedLayout>
  );
}
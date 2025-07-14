'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, QrCode } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EquipoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  equipo?: any;
  isLoading: boolean;
  tiposEquipo: string[];
  clientes: string[];
  zonas: string[];
}

interface FormData {
  nombre: string;
  tipo: string;
  cliente: string;
  zona: string;
  ubicacionExacta: string;
  fechaInstalacion: string;
  vidaUtilAnios: number;
  estado: 'Identificado' | 'No identificado';
  camposTecnicos: Record<string, any>;
}

const camposPorTipo: Record<string, Array<{
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required?: boolean;
}>> = {
  'Aire Acondicionado': [
    { key: 'marca', label: 'Marca', type: 'text', required: true },
    { key: 'modelo', label: 'Modelo', type: 'text', required: true },
    { key: 'potencia', label: 'Potencia (BTU)', type: 'text', required: true },
    { key: 'refrigerante', label: 'Tipo de Refrigerante', type: 'select', options: ['R32', 'R410A', 'R22'], required: true },
    { key: 'voltaje', label: 'Voltaje', type: 'text' },
    { key: 'amperaje', label: 'Amperaje', type: 'text' }
  ],
  'Calefacción': [
    { key: 'marca', label: 'Marca', type: 'text', required: true },
    { key: 'modelo', label: 'Modelo', type: 'text', required: true },
    { key: 'potencia', label: 'Potencia (kW)', type: 'text', required: true },
    { key: 'combustible', label: 'Tipo de Combustible', type: 'select', options: ['Gas Natural', 'Gas Envasado', 'Eléctrico', 'Gasoil'], required: true },
    { key: 'eficiencia', label: 'Eficiencia (%)', type: 'number' }
  ],
  'Ventilación': [
    { key: 'marca', label: 'Marca', type: 'text', required: true },
    { key: 'modelo', label: 'Modelo', type: 'text', required: true },
    { key: 'caudal', label: 'Caudal (m³/h)', type: 'text', required: true },
    { key: 'nivel_ruido', label: 'Nivel de Ruido (dB)', type: 'text' },
    { key: 'velocidades', label: 'Número de Velocidades', type: 'number' }
  ],
  'Eléctrico': [
    { key: 'marca', label: 'Marca', type: 'text', required: true },
    { key: 'modelo', label: 'Modelo', type: 'text', required: true },
    { key: 'tension', label: 'Tensión (V)', type: 'text', required: true },
    { key: 'corriente', label: 'Corriente (A)', type: 'text', required: true },
    { key: 'frecuencia', label: 'Frecuencia (Hz)', type: 'text' }
  ],
  'Plomería': [
    { key: 'marca', label: 'Marca', type: 'text', required: true },
    { key: 'modelo', label: 'Modelo', type: 'text', required: true },
    { key: 'caudal', label: 'Caudal (m³/h)', type: 'text' },
    { key: 'altura', label: 'Altura (m)', type: 'text' },
    { key: 'presion', label: 'Presión (bar)', type: 'text' }
  ]
};

export function EquipoForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  equipo, 
  isLoading, 
  tiposEquipo, 
  clientes, 
  zonas 
}: EquipoFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: '',
    cliente: '',
    zona: '',
    ubicacionExacta: '',
    fechaInstalacion: '',
    vidaUtilAnios: 10,
    estado: 'No identificado',
    camposTecnicos: {}
  });

  useEffect(() => {
    if (equipo) {
      setFormData({
        nombre: equipo.nombre || '',
        tipo: equipo.tipo || '',
        cliente: equipo.cliente || '',
        zona: equipo.zona || '',
        ubicacionExacta: equipo.ubicacionExacta || '',
        fechaInstalacion: equipo.fechaInstalacion || '',
        vidaUtilAnios: equipo.vidaUtilAnios || 10,
        estado: equipo.estado || 'No identificado',
        camposTecnicos: equipo.camposTecnicos || {}
      });
    } else {
      setFormData({
        nombre: '',
        tipo: '',
        cliente: '',
        zona: '',
        ubicacionExacta: '',
        fechaInstalacion: '',
        vidaUtilAnios: 10,
        estado: 'No identificado',
        camposTecnicos: {}
      });
    }
    setCurrentStep(1);
    setShowQRPreview(false);
  }, [equipo, isOpen]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset campos técnicos si cambia el tipo
    if (field === 'tipo') {
      setFormData(prev => ({
        ...prev,
        camposTecnicos: {}
      }));
    }
  };

  const handleCampoTecnicoChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      camposTecnicos: {
        ...prev.camposTecnicos,
        [key]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateQR = () => {
    setShowQRPreview(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.nombre && formData.tipo && formData.cliente && formData.zona && formData.ubicacionExacta;
      case 2:
        const camposRequeridos = camposPorTipo[formData.tipo]?.filter(campo => campo.required) || [];
        return camposRequeridos.every(campo => formData.camposTecnicos[campo.key]);
      case 3:
        return formData.fechaInstalacion && formData.vidaUtilAnios > 0;
      default:
        return false;
    }
  };

  const camposTecnicos = camposPorTipo[formData.tipo] || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {equipo ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step 
                      ? 'bg-orange-600' 
                      : 'bg-gray-200 dark:bg-gray-600'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Datos Generales</span>
            <span>Campos Técnicos</span>
            <span>Datos Operativos</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Datos Generales */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Datos Generales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Ej: Aire Acondicionado Central - Oficina Principal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Equipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposEquipo.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cliente *
                  </label>
                  <select
                    value={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente} value={cliente}>{cliente}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zona *
                  </label>
                  <select
                    value={formData.zona}
                    onChange={(e) => handleInputChange('zona', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Seleccionar zona</option>
                    {zonas.map(zona => (
                      <option key={zona} value={zona}>{zona}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ubicación Exacta *
                </label>
                <textarea
                  value={formData.ubicacionExacta}
                  onChange={(e) => handleInputChange('ubicacionExacta', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="Describe la ubicación exacta del equipo (piso, sector, referencias específicas)"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Campos Técnicos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Campos Técnicos - {formData.tipo}
              </h3>
              
              {camposTecnicos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {camposTecnicos.map((campo) => (
                    <div key={campo.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {campo.label} {campo.required && '*'}
                      </label>
                      {campo.type === 'select' ? (
                        <select
                          value={formData.camposTecnicos[campo.key] || ''}
                          onChange={(e) => handleCampoTecnicoChange(campo.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required={campo.required}
                        >
                          <option value="">Seleccionar...</option>
                          {campo.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={campo.type}
                          value={formData.camposTecnicos[campo.key] || ''}
                          onChange={(e) => handleCampoTecnicoChange(campo.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required={campo.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Selecciona un tipo de equipo en el paso anterior para ver los campos técnicos disponibles.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Datos Operativos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Datos Operativos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Instalación *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInstalacion}
                    onChange={(e) => handleInputChange('fechaInstalacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vida Útil Estimada (años) *
                  </label>
                  <input
                    type="number"
                    value={formData.vidaUtilAnios}
                    onChange={(e) => handleInputChange('vidaUtilAnios', parseInt(e.target.value) || 0)}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value as 'Identificado' | 'No identificado')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="No identificado">No identificado</option>
                    <option value="Identificado">Identificado</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Código QR</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Se generará automáticamente al guardar el equipo
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateQR}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <QrCode size={16} />
                    <span>Vista Previa QR</span>
                  </button>
                </div>

                {showQRPreview && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center">
                      <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                        <QrCode size={48} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Vista previa del código QR
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-600 mt-8">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              {currentStep === 1 ? (
                <>
                  <X size={16} />
                  <span>Cancelar</span>
                </>
              ) : (
                <>
                  <ChevronLeft size={16} />
                  <span>Anterior</span>
                </>
              )}
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Siguiente</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid(currentStep) || isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>{equipo ? 'Actualizando...' : 'Guardando...'}</span>
                  </>
                ) : (
                  <>
                    <span>{equipo ? 'Actualizar Equipo' : 'Guardar Equipo'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
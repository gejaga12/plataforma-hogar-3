'use client';

import { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, Calendar } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Employee {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  puesto: string;
  area: string;
  supervisor?: string;
  fechaIngreso: string;
  activo: boolean;
  avatar?: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, 'id'>, supervisorId: string) => void;
  isLoading?: boolean;
  selectedSupervisorId?: string;
}

const areaOptions = [
  'GERENCIA',
  'RRHH',
  'IT',
  'ADMINISTRACION',
  'TÉCNICA',
  'GESTIÓN DE ACTIVOS',
  'GESTIÓN DE TALENTO',
  'HIGIENE Y SEGURIDAD',
  'GESTIÓN DE CALIDAD',
  'VENTAS'
];

export function AddEmployeeModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false,
 
  selectedSupervisorId
}: AddEmployeeModalProps) {
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    nombre: '',
    email: '',
    telefono: '',
    puesto: '',
    area: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    activo: true
  });
  
  const [supervisorId, setSupervisorId] = useState(selectedSupervisorId || '');
  
  // Update supervisor ID when selectedSupervisorId changes
  useEffect(() => {
    if (selectedSupervisorId) {
      setSupervisorId(selectedSupervisorId);
    }
  }, [selectedSupervisorId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, supervisorId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Agregar Nuevo Empleado
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Completo *
              </label>
              <div className="flex items-center">
                <User size={16} className="text-gray-400 dark:text-gray-500 absolute ml-3" />
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ej: Juan Carlos Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <div className="flex items-center">
                <Mail size={16} className="text-gray-400 dark:text-gray-500 absolute ml-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="email@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
              </label>
              <div className="flex items-center">
                <Phone size={16} className="text-gray-400 dark:text-gray-500 absolute ml-3" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="+54 11 1234-5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Ingreso *
              </label>
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 dark:text-gray-500 absolute ml-3" />
                <input
                  type="date"
                  value={formData.fechaIngreso}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaIngreso: e.target.value }))}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
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
                placeholder="Ej: Desarrollador Frontend"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área *
              </label>
              <div className="flex items-center">
                <Building size={16} className="text-gray-400 dark:text-gray-500 absolute ml-3" />
                <select
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Seleccionar área</option>
                  {areaOptions.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supervisor *
            </label>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Seleccionar supervisor</option>
             
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
            />
            <label htmlFor="activo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Empleado activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                  <span className="ml-2">Agregando...</span>
                </>
              ) : (
                'Agregar Empleado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
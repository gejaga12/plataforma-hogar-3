'use client';

import { useState } from 'react';
import { X, Calendar, Users, Pin } from 'lucide-react';
import { Novedad } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface NovedadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (novedad: Omit<Novedad, 'id'>) => void;
  novedad?: Novedad;
  isLoading?: boolean;
}

const iconosDisponibles = ['🔔', '⚠️', '🚨', '✅', '📢', '🎉'];
const rolesDisponibles = ['admin', 'rrhh', 'tecnico', 'supervisor', 'operador'];

export function NovedadFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  novedad, 
  isLoading = false 
}: NovedadFormModalProps) {
  const [formData, setFormData] = useState<Omit<Novedad, 'id'>>({
    titulo: novedad?.titulo || '',
    descripcion: novedad?.descripcion || '',
    icono: novedad?.icono || '🔔',
    fecha: novedad?.fecha || new Date().toISOString(),
    reacciones: novedad?.reacciones || { like: 0, love: 0, seen: 0 },
    rolesDestinatarios: novedad?.rolesDestinatarios || ['admin', 'tecnico'],
    pin: novedad?.pin || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => {
      const isSelected = prev.rolesDestinatarios.includes(role);
      
      if (isSelected) {
        return {
          ...prev,
          rolesDestinatarios: prev.rolesDestinatarios.filter(r => r !== role)
        };
      } else {
        return {
          ...prev,
          rolesDestinatarios: [...prev.rolesDestinatarios, role]
        };
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {novedad ? 'Editar Novedad' : 'Crear Nueva Novedad'}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icono
              </label>
              <div className="flex flex-wrap gap-2">
                {iconosDisponibles.map((icono) => (
                  <button
                    key={icono}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icono }))}
                    className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-colors ${
                      formData.icono === icono
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {icono}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="date"
                  value={formData.fecha.split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    fecha: `${e.target.value}T00:00:00Z`
                  }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destinatarios *
              </label>
              <div className="flex flex-wrap gap-2">
                {rolesDisponibles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleToggle(role)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      formData.rolesDestinatarios.includes(role)
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
              {formData.rolesDestinatarios.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Selecciona al menos un rol</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="pin-novedad"
                checked={formData.pin}
                onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
              />
              <label htmlFor="pin-novedad" className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                <Pin size={16} className="mr-1" />
                Fijar en dashboard
              </label>
            </div>
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
              disabled={isLoading || formData.rolesDestinatarios.length === 0}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {novedad ? 'Guardando...' : 'Creando...'}
                  </span>
                </>
              ) : (
                novedad ? 'Guardar cambios' : 'Crear novedad'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
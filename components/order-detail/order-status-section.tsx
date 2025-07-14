'use client';

import { useState } from 'react';
import { CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface OrderStatusSectionProps {
  orden: {
    estado: string;
    calificacion: 'positiva' | 'negativa' | null;
  };
  onUpdateEstado: (estado: string) => void;
  onCalificar: (calificacion: 'positiva' | 'negativa') => void;
  isLoading: boolean;
}

export function OrderStatusSection({ orden, onUpdateEstado, onCalificar, isLoading }: OrderStatusSectionProps) {
  const [selectedEstado, setSelectedEstado] = useState(orden.estado);

  const estadoOptions = [
    { value: 'Pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { value: 'En proceso', label: 'En proceso', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    { value: 'Finalizado', label: 'Finalizado', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    { value: 'Cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
  ];

  const handleEstadoChange = (nuevoEstado: string) => {
    setSelectedEstado(nuevoEstado);
    onUpdateEstado(nuevoEstado);
  };

  const getEstadoColor = (estado: string) => {
    const option = estadoOptions.find(opt => opt.value === estado);
    return option?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CheckCircle className="text-orange-500" size={20} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Estado y Calificación</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Orden */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Estado de Orden de Trabajo
          </label>
          <div className="space-y-3">
            <select
              value={selectedEstado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {estadoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estado actual:</span>
              <span className={cn(
                'px-3 py-1 text-sm font-medium rounded-full',
                getEstadoColor(selectedEstado)
              )}>
                {selectedEstado}
              </span>
              {isLoading && <LoadingSpinner size="sm" />}
            </div>
          </div>
        </div>

        {/* Calificación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Calificar
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onCalificar('positiva')}
                disabled={isLoading}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50',
                  orden.calificacion === 'positiva'
                    ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-300 dark:hover:border-green-700'
                )}
              >
                <ThumbsUp size={20} />
                <span>Positiva</span>
              </button>

              <button
                onClick={() => onCalificar('negativa')}
                disabled={isLoading}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50',
                  orden.calificacion === 'negativa'
                    ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-700'
                )}
              >
                <ThumbsDown size={20} />
                <span>Negativa</span>
              </button>
            </div>

            {orden.calificacion && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Calificación actual:</span>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  orden.calificacion === 'positiva' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                )}>
                  {orden.calificacion === 'positiva' ? 'Positiva' : 'Negativa'}
                </span>
              </div>
            )}

            {!orden.calificacion && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aún no se ha calificado esta orden de trabajo
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Clock, Save } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface OrderWorkTimeSectionProps {
  orden: {
    horaInicio: string | null;
    horaFin: string | null;
  };
  onUpdateTiempo: (data: any) => void;
  isLoading: boolean;
}

export function OrderWorkTimeSection({ orden, onUpdateTiempo, isLoading }: OrderWorkTimeSectionProps) {
  const [horaInicio, setHoraInicio] = useState(orden.horaInicio || '');
  const [horaFin, setHoraFin] = useState(orden.horaFin || '');
  const [minutosTrabajados, setMinutosTrabajados] = useState(() => {
    if (orden.horaInicio && orden.horaFin) {
      const inicio = new Date(`2000-01-01T${orden.horaInicio}:00`);
      const fin = new Date(`2000-01-01T${orden.horaFin}:00`);
      const diff = fin.getTime() - inicio.getTime();
      return Math.floor(diff / (1000 * 60));
    }
    return 0;
  });

  const calcularMinutos = (inicio: string, fin: string) => {
    if (!inicio || !fin) return 0;
    
    try {
      const inicioDate = new Date(`2000-01-01T${inicio}:00`);
      const finDate = new Date(`2000-01-01T${fin}:00`);
      const diff = finDate.getTime() - inicioDate.getTime();
      return Math.max(0, Math.floor(diff / (1000 * 60)));
    } catch {
      return 0;
    }
  };

  const handleHoraInicioChange = (value: string) => {
    setHoraInicio(value);
    if (value && horaFin) {
      setMinutosTrabajados(calcularMinutos(value, horaFin));
    }
  };

  const handleHoraFinChange = (value: string) => {
    setHoraFin(value);
    if (horaInicio && value) {
      setMinutosTrabajados(calcularMinutos(horaInicio, value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTiempo({
      horaInicio,
      horaFin,
      minutosTrabajados
    });
  };

  const formatMinutosToHours = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="text-orange-500" size={20} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fecha y Hora de Trabajo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora de Inicio
            </label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => handleHoraInicioChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora de Fin
            </label>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => handleHoraFinChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minutos Trabajados
            </label>
            <div className="space-y-2">
              <input
                type="number"
                value={minutosTrabajados}
                onChange={(e) => setMinutosTrabajados(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {minutosTrabajados > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Equivale a: {formatMinutosToHours(minutosTrabajados)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
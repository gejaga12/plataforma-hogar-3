'use client';

import { MapPin, Building } from 'lucide-react';

interface EquipoUbicacionProps {
  zona: string;
  ubicacion: string;
}

export function EquipoUbicacion({ zona, ubicacion }: EquipoUbicacionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Zona
        </label>
        <div className="flex items-center space-x-2">
          <Building size={16} className="text-gray-400 dark:text-gray-500" />
          <p className="text-sm text-gray-900 dark:text-gray-100">{zona}</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ubicación Exacta
        </label>
        <div className="flex items-start space-x-2">
          <MapPin size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
            {ubicacion}
          </p>
        </div>
      </div>
    </div>
  );
}
'use client';

import { ReactNode, useState } from 'react';
import { Bell, X, ThumbsUp, Heart, Eye } from 'lucide-react';
import { NovedadCard } from './novedad-card';
import { NovedadModal } from './novedad-modal';
import { Novedad } from '@/utils/types';

interface DashboardHeaderProps {
  nombreUsuario: string;
  panelTitle: string;
  icon: ReactNode;
  novedades: Novedad[];
  onCerrarNovedad: (id: string) => void;
  onReaccionar: (id: string, tipo: 'like' | 'love' | 'seen') => void;
}

export function DashboardHeader({
  nombreUsuario,
  panelTitle,
  icon,
  novedades,
  onCerrarNovedad,
  onReaccionar
}: DashboardHeaderProps) {
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null);
  
  // Ordenar novedades: primero las fijadas, luego por fecha
  const sortedNovedades = [...novedades].sort((a, b) => {
    if (a.pin && !b.pin) return -1;
    if (!a.pin && b.pin) return 1;
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleOpenNovedad = (novedad: Novedad) => {
    setSelectedNovedad(novedad);
    // Marcar como vista automáticamente
    onReaccionar(novedad.id, 'seen');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ¡Bienvenido, {nombreUsuario}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">{today}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-0">
          {icon}
          <span>{panelTitle}</span>
        </div>
      </div>

      {/* Novedades */}
      {sortedNovedades.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Bell className="mr-2 text-orange-500" size={20} />
              Novedades
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {sortedNovedades.length} {sortedNovedades.length === 1 ? 'novedad' : 'novedades'}
            </span>
          </div>

          <div className="space-y-3">
            {sortedNovedades.map((novedad) => (
              <NovedadCard
                key={novedad.id}
                novedad={novedad}
                onCerrar={() => onCerrarNovedad(novedad.id)}
                onReaccionar={(tipo) => onReaccionar(novedad.id, tipo)}
                onClick={() => handleOpenNovedad(novedad)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedNovedad && (
        <NovedadModal
          novedad={selectedNovedad}
          onClose={() => setSelectedNovedad(null)}
          onCerrar={() => {
            onCerrarNovedad(selectedNovedad.id);
            setSelectedNovedad(null);
          }}
          onReaccionar={(tipo) => onReaccionar(selectedNovedad.id, tipo)}
        />
      )}
    </div>
  );
}
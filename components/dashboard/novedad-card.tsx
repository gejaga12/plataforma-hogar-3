'use client';

import { useState } from 'react';
import { X, ThumbsUp, Heart, Eye, Pin } from 'lucide-react';
import { Novedad } from '@/utils/types';
import { cn } from '@/utils/cn';

interface NovedadCardProps {
  novedad: Novedad;
  onCerrar: () => void;
  onReaccionar: (tipo: 'like' | 'love' | 'seen') => void;
  onClick: () => void;
}

export function NovedadCard({ novedad, onCerrar, onReaccionar, onClick }: NovedadCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Determinar el color de fondo según el icono
  const getBgColor = () => {
    const iconMap: Record<string, string> = {
      '🔔': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      '⚠️': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      '🚨': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      '✅': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      '📢': 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      '🎉': 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    };
    
    return iconMap[novedad.icono] || 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={cn(
        "relative border rounded-lg p-4 transition-all",
        getBgColor(),
        novedad.pin && "border-orange-300 dark:border-orange-700 shadow-md",
        "hover:shadow-md cursor-pointer"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="text-2xl mr-3 flex-shrink-0">{novedad.icono}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pr-6">
              {novedad.titulo}
              {novedad.pin && (
                <Pin size={14} className="inline-block ml-2 text-orange-500" />
              )}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(novedad.fecha)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
            {novedad.descripcion}
          </p>
          
          {/* Reacciones */}
          <div className="flex items-center space-x-4 mt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onReaccionar('like');
              }}
              className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ThumbsUp size={14} />
              <span>{novedad.reacciones.like}</span>
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onReaccionar('love');
              }}
              className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Heart size={14} />
              <span>{novedad.reacciones.love}</span>
            </button>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Eye size={14} />
              <span>{novedad.reacciones.seen}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCerrar();
        }}
        className={cn(
          "absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
          !showActions && "opacity-0"
        )}
      >
        <X size={16} />
      </button>
    </div>
  );
}
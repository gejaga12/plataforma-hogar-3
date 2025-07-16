'use client';

import { X, ThumbsUp, Heart, Eye, Calendar, Users, Pin } from 'lucide-react';
import { Novedad } from '@/utils/types';
import { cn } from '@/lib/utils';

interface NovedadModalProps {
  novedad: Novedad;
  onClose: () => void;
  onCerrar: () => void;
  onReaccionar: (tipo: 'like' | 'love' | 'seen') => void;
}

export function NovedadModal({ novedad, onClose, onCerrar, onReaccionar }: NovedadModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{novedad.icono}</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {novedad.titulo}
                {novedad.pin && (
                  <Pin size={16} className="inline-block ml-2 text-orange-500" />
                )}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>{formatDate(novedad.fecha)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={16} />
                <span>
                  Para: {novedad.rolesDestinatarios.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                </span>
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {novedad.descripcion}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => onReaccionar('like')}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ThumbsUp size={18} />
                <span>{novedad.reacciones.like}</span>
              </button>
              
              <button 
                onClick={() => onReaccionar('love')}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Heart size={18} />
                <span>{novedad.reacciones.love}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Eye size={18} />
                <span>{novedad.reacciones.seen}</span>
              </div>
            </div>

            <button
              onClick={onCerrar}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
            >
              Cerrar novedad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
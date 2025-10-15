'use client';

import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ComentarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comentario: string) => void;
  isLoading?: boolean;
}

export function ComentarioModal({ isOpen, onClose, onSubmit, isLoading = false }: ComentarioModalProps) {
  const [comentario, setComentario] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comentario.trim()) {
      onSubmit(comentario);
      setComentario('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <MessageSquare className="mr-2 text-orange-500" size={20} />
              Agregar Comentario
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Escribe tus observaciones aquí..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
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
              disabled={isLoading || !comentario.trim()}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Guardando...</span>
                </>
              ) : (
                'Guardar Comentario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Paperclip, Download, Trash2, Eye, File, X } from 'lucide-react';
import { Archivo } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AdjuntoNodoProps {
  archivos: Archivo[];
  onUpload: (file: File) => void;
  onDelete: (idArchivo: string) => void;
}

export function AdjuntoNodo({ archivos, onUpload, onDelete }: AdjuntoNodoProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadHover, setUploadHover] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDownload = (archivo: Archivo) => {
    // En una implementación real, aquí se descargaría el archivo
    window.open(archivo.url, '_blank');
  };

  const handlePreview = (archivo: Archivo) => {
    setPreviewUrl(archivo.url);
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  const getIconForFileType = (tipo: string) => {
    if (tipo.includes('pdf')) return 'pdf';
    if (tipo.includes('image')) return 'image';
    if (tipo.includes('word') || tipo.includes('document')) return 'doc';
    if (tipo.includes('excel') || tipo.includes('sheet')) return 'xls';
    return 'file';
  };

  return (
    <div className="space-y-3">
      {/* Lista de archivos */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {archivos.map((archivo) => (
          <div 
            key={archivo.id} 
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <File className="text-orange-500 flex-shrink-0" size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {archivo.nombre}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(archivo.tamaño / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePreview(archivo)}
                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                title="Ver"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => handleDownload(archivo)}
                className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                title="Descargar"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => onDelete(archivo.id)}
                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {archivos.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            No hay archivos adjuntos
          </div>
        )}
      </div>

      {/* Botón para subir archivos */}
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          uploadHover 
            ? "border-orange-500 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/10" 
            : "border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-500"
        )}
        onMouseEnter={() => setUploadHover(true)}
        onMouseLeave={() => setUploadHover(false)}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        <Paperclip className={cn(
          "mx-auto h-6 w-6 mb-1",
          uploadHover ? "text-orange-500" : "text-gray-400 dark:text-gray-500"
        )} />
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Haz clic para adjuntar
        </p>
      </div>

      {/* Modal de vista previa */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full bg-white dark:bg-gray-800 rounded-lg p-4">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="mt-6">
              {previewUrl.includes('.pdf') ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-[80vh]" 
                  title="PDF Preview"
                />
              ) : previewUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-[80vh] mx-auto" 
                />
              ) : (
                <div className="text-center py-12">
                  <File className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-gray-900 dark:text-gray-100">
                    Vista previa no disponible
                  </p>
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    <Download size={16} className="mr-2" />
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
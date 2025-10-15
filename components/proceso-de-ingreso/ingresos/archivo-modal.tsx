'use client';

import { useState, useRef } from 'react';
import { Paperclip, Upload, X, File } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ArchivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  isLoading?: boolean;
}

export function ArchivoModal({ isOpen, onClose, onSubmit, isLoading = false }: ArchivoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onSubmit(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Paperclip className="mr-2 text-orange-500" size={20} />
              Adjuntar Archivo
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div 
              onClick={handleBrowseClick}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
            >
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <File className="h-12 w-12 text-orange-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Haz clic para seleccionar un archivo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    O arrastra y suelta aquí
                  </p>
                </div>
              )}
            </div>
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
              disabled={isLoading || !selectedFile}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Subiendo...</span>
                </>
              ) : (
                'Subir Archivo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
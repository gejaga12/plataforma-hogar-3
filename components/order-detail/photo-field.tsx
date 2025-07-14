'use client';

import { useState } from 'react';
import { Camera, Plus, X, Eye } from 'lucide-react';

interface CampoFormulario {
  id: string;
  nombre: string;
  titulo: string;
  tipo: string;
  valor: any;
  requerido: boolean;
  tareaTecnico: string;
  vistaInforme: string;
  fotos?: string[];
}

interface PhotoFieldProps {
  campo: CampoFormulario;
}

export function PhotoField({ campo }: PhotoFieldProps) {
  const [fotos, setFotos] = useState<string[]>(campo.fotos || []);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);

  const handleAgregarFoto = () => {
    // Simular agregar una nueva foto
    const nuevaFoto = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`;
    setFotos(prev => [...prev, nuevaFoto]);
  };

  const handleReemplazarFoto = (index: number) => {
    // Simular reemplazar una foto
    const nuevaFoto = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`;
    setFotos(prev => prev.map((foto, i) => i === index ? nuevaFoto : foto));
  };

  const handleDeshabilitarFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleVerFoto = (foto: string) => {
    setFotoSeleccionada(foto);
  };

  return (
    <div className="space-y-4">
      {/* Galería de fotos */}
      {fotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fotos.map((foto, index) => (
            <div key={index} className="relative group">
              <img
                src={foto}
                alt={`Foto ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
              />
              
              {/* Overlay con botones */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleVerFoto(foto)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  title="Ver foto"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleReemplazarFoto(index)}
                  className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors"
                  title="Reemplazar foto"
                >
                  <Camera size={16} />
                </button>
                <button
                  onClick={() => handleDeshabilitarFoto(index)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  title="Deshabilitar foto"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Camera className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">No hay fotos cargadas</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleAgregarFoto}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          <span>Agregar foto</span>
        </button>

        {fotos.length > 0 && (
          <button
            onClick={() => handleReemplazarFoto(fotos.length - 1)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
          >
            <Camera size={16} />
            <span>Reemplazar foto</span>
          </button>
        )}
      </div>

      {/* Modal para ver foto */}
      {fotoSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={fotoSeleccionada}
              alt="Foto ampliada"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setFotoSeleccionada(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
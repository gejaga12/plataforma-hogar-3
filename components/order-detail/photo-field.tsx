"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Plus, X, Eye } from "lucide-react";
import { OTService } from "@/utils/api/apiOTs"; // 👈 donde está traerImagesById

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
  onChange?: (fotos: string[]) => void;
}

export function PhotoField({ campo, onChange }: PhotoFieldProps) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🔹 Cargar fotos del backend
  useEffect(() => {
    const fetchFotos = async () => {
      try {
        if (campo.fotos && campo.fotos.length > 0) {
          const urls = await Promise.all(
            campo.fotos.map(async (fotoId) => {
              return await OTService.traerImagesById(fotoId);
            })
          );
          setFotos(urls);
          onChange?.(urls);
        }
      } catch (error) {
        console.error("Error al traer imágenes:", error);
      }
    };

    fetchFotos();
  }, [campo.fotos, onChange]);

  // 🔹 Subir nueva foto
  const handleAgregarFoto = () => {
    fileInputRef.current?.click();
  };

  // 🔹 Ver foto en modal
  const handleVerFoto = (foto: string) => {
    setFotoSeleccionada(foto);
  };

  return (
    <div className="space-y-4">
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />

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

              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleVerFoto(foto)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  title="Ver foto"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Camera className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No hay fotos cargadas
          </p>
        </div>
      )}

      {/* Botón para agregar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleAgregarFoto}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          <span>Agregar foto</span>
        </button>
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

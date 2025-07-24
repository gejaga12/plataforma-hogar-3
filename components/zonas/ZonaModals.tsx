"use client";

import { CreateZonaData } from "@/app/zonas/page";
import { ZonaService } from "@/lib/api/apiZonas";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import React, { useState } from "react";

interface ZonaModalsProps {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  onClose: () => void;
  isloading: boolean;
  onSubmit: (data: CreateZonaData) => void;
}

const ZonaModals: React.FC<ZonaModalsProps> = ({
  mode,
  onClose,
  isOpen,
  isloading,
  onSubmit,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["zonas"],
    queryFn: () => ZonaService.allInfoZona(),
  });

  const paises = data?.paises ?? [];

  const [nombreZona, setNombreZona] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState<string | null>(null);

  const handleSeleccionPais = (id: string) => {
    setPaisSeleccionado(id);
  };

  const handleCrear = () => {
    if (!nombreZona || !paisSeleccionado) return;
    // Acá luego se ejecutará el submit
    console.log("Crear zona con:", { nombreZona, paisId: paisSeleccionado });
    onSubmit({ name: nombreZona, paisId: paisSeleccionado });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create" && "Crear Nuevo Usuario"}
              {mode === "edit" && "Editar Usuario"}
              {mode === "view" && "Detalles del Usuario"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Zona
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 uppercase"
                value={nombreZona}
                onChange={(e) => setNombreZona(e.target.value)}
                placeholder="Ej: Zona Norte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccioná el país
              </label>
              {isLoading ? (
                <p className="text-sm text-gray-500">Cargando países...</p>
              ) : (
                <div className="space-y-2">
                  {paises.map((pais) => (
                    <label
                      key={pais.id}
                      className="flex items-center gap-2 cursor-pointer text-gray-800"
                    >
                      <input
                        type="radio"
                        name="pais"
                        value={pais.id}
                        checked={paisSeleccionado === pais.id}
                        onChange={() => handleSeleccionPais(pais.id)}
                        className="accent-blue-600"
                      />
                      <span>{pais.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={isloading || !nombreZona || !paisSeleccionado}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isloading ? "Creando..." : "Crear Zona"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZonaModals;

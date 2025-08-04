"use client";

import { X } from "lucide-react";
import React, { useState } from "react";
import { Pais, Provincia } from "@/utils/types";
import toast from "react-hot-toast";
import { CreateRegionDto } from "@/api/apiZonas";
import ProvinciaModal from "./Zona-provincia-modal";

interface ZonaModalsProps {
  paises: Pais[];
  provincias: Provincia[];
  isOpen: boolean;
  mode: "create";
  onClose: () => void;
  isloading: boolean;
  onSubmit: (data: CreateRegionDto) => void;
  createPaisMutation: (name: string) => void;
  createPronvinciaMutation: (name: string) => void;
}

const ZonaModals: React.FC<ZonaModalsProps> = ({
  mode,
  isOpen,
  isloading,
  paises,
  provincias,
  onClose,
  onSubmit,
  createPaisMutation,
  createPronvinciaMutation,
}) => {
  const isEmpty = (val?: string | null) => !val || val.trim().length === 0;

  const [paisSeleccionado, setPaisSeleccionado] = useState<string | null>(null);
  const [provSeleccionada, setProvSeleccionada] = useState<string | null>(null);

  const nombreZona = useInput();
  const nombrePais = useInput();
  const nombreProvincia = useInput();

  const handleSeleccionPais = (id: string) => {
    setPaisSeleccionado(id);
  };

  const handleSeleccionProvincia = (id: string) => {
    setProvSeleccionada(id);
  };

  const handleCrear = () => {
    if (isEmpty(nombreZona.value) || isEmpty(paisSeleccionado)) {
      toast.error("Faltan campos obligatorios");
      return;
    }
    onSubmit({
      name: nombreZona.value,
      paisId: paisSeleccionado!,
      provincias: provSeleccionada ? [provSeleccionada] : [],
    });
  };

  const handleCrearPais = () => {
    const nombreFinal = nombrePais.value.trim().toUpperCase();
    if (!nombreFinal) return;

    console.log("🛰️ Enviando país:", nombreFinal);

    createPaisMutation(nombreFinal);
    nombrePais.clear();
  };

  const handleCrearProvincia = () => {
    const nombreFinal = nombreProvincia.value.trim().toUpperCase();
    if (!nombreFinal) return;
    createPronvinciaMutation(nombreFinal);
    nombreProvincia.clear();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-900">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-400">
              {mode === "create" && "Crear Nueva Zona"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {/* {zona} */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-400 mb-1">
                Nombre de la Zona
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 uppercase dark:bg-gray-700 dark:focus:border-blue-800"
                value={nombreZona.value}
                onChange={nombreZona.onChange}
                placeholder="NEA"
              />
            </div>

            {/* seleccion de pais */}
            <div className="flex justify-around gap-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">
                  Seleccioná el país
                </label>
                {isloading ? (
                  <p className="text-sm text-gray-500">Cargando países...</p>
                ) : (
                  <div className="space-y-2">
                    {paises.map((pais) => (
                      <label
                        key={pais.id}
                        className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-400"
                      >
                        <input
                          type="radio"
                          name="pais"
                          value={pais.id}
                          checked={paisSeleccionado === pais.id}
                          onChange={() => handleSeleccionPais(pais.id)}
                          className="accent-blue-600 dark:accent-violet-600"
                        />
                        <span>{pais.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">
                  Selecciona las provincias
                </label>
                <div>
                  {provincias.map((provincia) => (
                    <label
                      key={provincia.id}
                      className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-400"
                    >
                      <input
                        type="checkbox"
                        name="provincia"
                        value={provincia.id}
                        checked={provSeleccionada === provincia.id}
                        onChange={() => handleSeleccionProvincia(provincia.id)}
                        className="accent-blue-600 dark:accent-violet-600"
                      />
                      <span>
                        {provincia.name ?? "No hay provincias disponibles"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* acciones */}
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

            <hr className="border-gray-800 dark:border-gray-500" />

            {/* pais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1 ">
                Crear Pais
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 uppercase dark:bg-gray-700 dark:focus:border-blue-800"
                  value={nombrePais.value}
                  onChange={nombrePais.onChange}
                  placeholder="Argentina"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCrearPais();
                    }
                  }}
                />
                <button
                  onClick={handleCrearPais}
                  className="px-3 py-2 w-1/5 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer"
                  disabled={!nombrePais}
                >
                  Crear País
                </button>
              </div>
            </div>

            {/* provincia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1 ">
                Crear Provincia
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 uppercase dark:bg-gray-700 dark:focus:border-blue-800"
                  value={nombreProvincia.value}
                  onChange={nombreProvincia.onChange}
                  placeholder="Buenos Aires"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCrearProvincia();
                    }
                  }}
                />
                <button
                  onClick={handleCrearProvincia}
                  className="px-3 py-2 w-1/5 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer"
                  disabled={!nombreProvincia}
                >
                  Crear Provincia
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZonaModals;

//hook para inputs
function useInput(initial = "") {
  const [value, setValue] = useState(initial);
  const clear = () => setValue("");
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(e.target.value),
    clear,
  };
}

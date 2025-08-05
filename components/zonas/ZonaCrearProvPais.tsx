import React from "react";
import { useInput } from "./ZonaModals";
import { MapPinPlus, X } from "lucide-react";

interface props {
  modalCreatePaisProv: {
    isOpen: boolean;
    mode: "provincia" | "pais" | undefined;
  };
  setModalCreatePaisProv: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      mode: "provincia" | "pais" | undefined;
    }>
  >;
  createPaisMutation: (name: string) => void;
  createPronvinciaMutation: (name: string) => void;
}

const ZonaCrearProvPais: React.FC<props> = ({
  modalCreatePaisProv,
  setModalCreatePaisProv,
  createPaisMutation,
  createPronvinciaMutation,
}) => {
  const nombrePais = useInput();
  const nombreProvincia = useInput();

  const handleCrearProvincia = () => {
    const nombreFinal = nombreProvincia.value.trim().toUpperCase();
    if (!nombreFinal) return;
    createPronvinciaMutation(nombreFinal);
    nombreProvincia.clear();
    setModalCreatePaisProv({ isOpen: false, mode: undefined });
  };

  const handleCrearPais = () => {
    const nombreFinal = nombrePais.value.trim().toUpperCase();
    if (!nombreFinal) return;

    console.log("🛰️ Enviando país:", nombreFinal);

    createPaisMutation(nombreFinal);
    nombrePais.clear();
    setModalCreatePaisProv({ isOpen: false, mode: undefined });
  };

  if (!modalCreatePaisProv.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md h-64 max-h-80 relative">
        <button
          onClick={() =>
            setModalCreatePaisProv({ isOpen: false, mode: undefined })
          }
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <X />
        </button>

        <div className="p-6">
          {modalCreatePaisProv.mode === "pais" && (
            <div className="space-y-12">
              <div className="flex items-center space-x-2 mb-4 mt-5">
                <MapPinPlus className="text-red-500 dark:text-red-400" size={24} />
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-400">
                  Crear País
                </h3>
              </div>
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
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  disabled={!nombrePais.value.trim()}
                >
                  Crear
                </button>
              </div>
            </div>
          )}

          {modalCreatePaisProv.mode === "provincia" && (
            <div className="space-y-12">
              <div className="flex items-center space-x-2 mb-4 mt-5">
                <MapPinPlus className="text-red-500 dark:text-red-400" size={24} />
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-400">
                  Crear Provincia
                </h3>
              </div>
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
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  disabled={!nombreProvincia.value.trim()}
                >
                  Crear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZonaCrearProvPais;

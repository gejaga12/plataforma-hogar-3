import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Sector } from "@/utils/types";

interface SectorModalProps {
  modo: "create" | "edit";
  sector: Sector | null;
  sucursalid: string;
  onClose: () => void;
  onSave: (sector: Sector) => void;
  isPending: boolean;
}

const SectorModal: React.FC<SectorModalProps> = ({
  modo,
  sector,
  sucursalid,
  isPending,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(sector?.name || "");
  const [codigo, setCodigo] = useState(sector?.codigo || "");

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const payload: Sector = {
    name,
    codigo,
    sucursalid,
    ...(modo === "edit" && sector?.id ? { id: sector.id } : {}), // solo si edita
  };

  onSave(payload);
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {modo === "create" ? "Crear Sector" : "Editar Sector"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Código</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-orange-500"
              required
              disabled={modo === "edit"}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-orange-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {isPending ? (
                <LoadingSpinner /> // 👈 muestra spinner mientras se crea
              ) : (
                <span>{modo === "create" ? "Crear" : "Guardar"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectorModal;

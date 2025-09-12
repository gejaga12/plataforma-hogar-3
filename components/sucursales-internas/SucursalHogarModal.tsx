"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sucursal } from "@/utils/types";
import { capitalizeFirstLetter } from "@/utils/normalize";

interface CrearSucursalInternaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<Sucursal, "id">) => void;
}

export const CrearSucursalInternaModal: React.FC<
  CrearSucursalInternaModalProps
> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    coords: { lan: "", lng: "" },
    codigo: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        address: "",
        coords: { lan: "", lng: "" },
        codigo: "",
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "lan" || name === "lng") {
      setFormData({
        ...formData,
        coords: { ...formData.coords, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    const payload: Omit<Sucursal, "id"> = {
      name: capitalizeFirstLetter(formData.name).trim(),
      address: capitalizeFirstLetter(formData.address).trim(),
      coords: {
        lan: formData.coords.lan ? Number(formData.coords.lan) : 0,
        lng: formData.coords.lng ? Number(formData.coords.lng) : 0,
      },
      codigo: capitalizeFirstLetter(formData.codigo).trim(),
    };
    console.log("enviando payload:", payload);
    onSubmit(payload);

    setFormData({
      name: "",
      address: "",
      coords: { lan: "", lng: "" },
      codigo: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Crear nueva sucursal interna
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <input
            type="text"
            name="address"
            placeholder="Dirección"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <input
            type="text"
            name="lan"
            placeholder="Latitud"
            value={formData.coords.lan}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <input
            type="text"
            name="lng"
            placeholder="Longitud"
            value={formData.coords.lng}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            name="codigo"
            placeholder="Codigo"
            value={formData.codigo}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
};

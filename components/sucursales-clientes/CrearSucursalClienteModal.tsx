import React, { useState } from "react";
import { X } from "lucide-react";
import { Cliente, Sucursal } from "@/utils/types";
import { capitalizeFirstLetter } from "@/utils/normalize";

interface SucursalForm {
  name: string;
  address: string;
  coords: { lan: string; lng: string }; // 👈 string en el form
  codigo: string;
  sucHogar: string;
  cliente: string;
}

interface CrearSucursalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Sucursal) => void;
  sucursalesHogar: Sucursal[]; // luego tipás si tenés interface
  clientes: Cliente[];
}

export const CrearSucursalClienteModal: React.FC<CrearSucursalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sucursalesHogar,
  clientes,
}) => {
  const [formData, setFormData] = useState<SucursalForm>({
    name: "",
    address: "",
    coords: { lan: "", lng: "" },
    codigo: "",
    sucHogar: "",
    cliente: "",
  });

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

  const handleSelect = (field: "sucHogar" | "cliente", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload: Sucursal = {
      name: capitalizeFirstLetter(formData.name),
      codigo: capitalizeFirstLetter(formData.codigo ?? ""),
      address: capitalizeFirstLetter(formData.address ?? ""),
      coords: {
        lan: formData.coords?.lan ? Number(formData.coords.lan) : 0,
        lng: formData.coords?.lng ? Number(formData.coords.lng) : 0,
      },
      sucHogar: formData.sucHogar || undefined,
      cliente: formData.cliente || undefined,
    };

    console.log("payload:", payload);

    onSubmit(payload);
    onClose();
    setFormData({
      name: "",
      address: "",
      coords: { lan: "", lng: "" },
      codigo: "",
      sucHogar: "",
      cliente: "",
    });
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
          Crear nueva sucursal
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
            value={formData.coords?.lan}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            name="lng"
            placeholder="Longitud"
            value={formData.coords?.lng}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <input
            type="text"
            name="codigo"
            placeholder="Código interno"
            value={formData.codigo}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          {/* Lista de sucursales hogar */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Sucursal Hogar
            </p>
            <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
              {sucursalesHogar.map((suc) => (
                <div
                  key={suc.id}
                  className={`cursor-pointer px-4 py-2 hover:bg-orange-100 dark:hover:bg-orange-800 ${
                    formData.sucHogar === suc.id
                      ? "bg-orange-200 dark:bg-orange-700"
                      : ""
                  }`}
                  onClick={() => handleSelect("sucHogar", suc.id!)}
                >
                  {suc.name}
                </div>
              ))}
            </div>
          </div>

          {/* Lista de clientes */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </p>
            <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
              {clientes?.map((cli) => (
                <div
                  key={cli.id}
                  className={`cursor-pointer px-4 py-2 hover:bg-orange-100 dark:hover:bg-orange-800 ${
                    formData.cliente === cli.id
                      ? "bg-orange-200 dark:bg-orange-700"
                      : ""
                  }`}
                  onClick={() => handleSelect("cliente", cli.id!)}
                >
                  {cli.name}
                </div>
              ))}
            </div>
          </div>
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

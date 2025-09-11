import React, { useState } from "react";
import { X } from "lucide-react";
import { SucursalCliente } from "@/utils/types";

interface CrearSucursalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  sucursalesHogar: any[]; // luego tipás si tenés interface
  clientes: any[];
}

export const CrearSucursalModal: React.FC<CrearSucursalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sucursalesHogar,
  clientes,
}) => {
  const [formData, setFormData] = useState<SucursalCliente>({
    name: "",
    address: "",
    lan: undefined,
    lng: undefined,
    codigo: "",
    sucHogar: { id: "", name: "" },
    cliente: { name: "", razonSocial: "", cuit: "", codigo: "" },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (field: "sucHogar" | "client", value: any) => {
    if (field === "sucHogar") {
      setFormData({ ...formData, sucHogar: value });
    } else {
      setFormData({ ...formData, cliente: value });
    }
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      lan: formData.lan ? Number(formData.lan) : null,
      lng: formData.lng ? Number(formData.lng) : null,
    };
    onSubmit(payload);
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
            value={formData.lan}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            name="lng"
            placeholder="Longitud"
            value={formData.lng}
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
                  onClick={() => handleSelect("sucHogar", suc.id)}
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
                  onClick={() => handleSelect("client", cli.id)}
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

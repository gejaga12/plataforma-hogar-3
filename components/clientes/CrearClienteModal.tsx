import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import React from "react";
import { Cliente } from "@/utils/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mutate: (data: Cliente) => void;
}

const CreateClientModal = ({ isOpen, onClose, mutate }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Cliente>();

  const onSubmit = (data: Cliente) => {
    mutate(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Crear Cliente
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <input
              {...register("name", { required: "Campo obligatorio" })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Razón Social
            </label>
            <input
              {...register("razonSocial", { required: "Campo obligatorio" })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.razonSocial && (
              <p className="text-xs text-red-600 mt-1">
                {errors.razonSocial.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CUIT
            </label>
            <input
              {...register("cuit", {
                required: "Campo obligatorio",
                pattern: {
                  value: /^\d{11}$/,
                  message:
                    "El CUIT debe tener exactamente 11 dígitos numéricos",
                },
              })}
              maxLength={11}
              inputMode="numeric"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.cuit && (
              <p className="text-xs text-red-600 mt-1">{errors.cuit.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código
            </label>
            <input
              {...register("codigo", { required: "Campo obligatorio" })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.codigo && (
              <p className="text-xs text-red-600 mt-1">
                {errors.codigo.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              Crear Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;

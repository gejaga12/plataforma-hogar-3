import { Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface KeyValue {
  key: string;
  value: "string" | "number" | "date" | "boolean";
}

interface TipoEquipoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { name: string; kv: KeyValue[] }) => void;
}

const TipoEquipoModal = ({
  isOpen,
  onClose,
  onSubmit,
}: TipoEquipoModalProps) => {
  const [name, setName] = useState("");
  const [kv, setKv] = useState<KeyValue[]>([{ key: "", value: "string" }]);

  const resetForm = () => {
    setName("");
    setKv([{ key: "", value: "string" }]);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        resetForm();
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleKeyChange = (index: number, newKey: string) => {
    const updated = [...kv];
    updated[index].key = newKey;
    setKv(updated);
  };

  const handleValueChange = (index: number, newType: KeyValue["value"]) => {
    const updated = [...kv];
    updated[index].value = newType;
    setKv(updated);
  };

  const addKeyValue = () => {
    setKv([...kv, { key: "", value: "string" }]);
  };

  const removeKeyValue = (index: number) => {
    setKv(kv.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ name, kv });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Crear nuevo tipo de equipo
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del equipo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
              placeholder="Ej: Auto"
            />
          </div>

          {/* Key / Value pairs */}
          <div className="space-y-4">
            {kv.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 items-center border border-gray-200 dark:border-gray-600 p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                {/* Key */}
                <input
                  type="text"
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-500 px-3 py-2 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                />

                {/* Value (solo tipo) */}
                <select
                  value={item.value}
                  onChange={(e) =>
                    handleValueChange(
                      index,
                      e.target.value as KeyValue["value"]
                    )
                  }
                  className="rounded-lg border border-gray-300 dark:border-gray-500 px-3 py-2 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="date">date</option>
                  <option value="boolean">boolean</option>
                </select>

                {kv.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyValue(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Botón agregar */}
          <button
            type="button"
            onClick={addKeyValue}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            + Agregar campo
          </button>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TipoEquipoModal;

import { PhoneForm, PhoneType } from "@/utils/api/apiTel";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

interface TelefonosModalProps {
  phoneDraft: PhoneForm[];
  setPhoneDraft: React.Dispatch<React.SetStateAction<PhoneForm[]>>;
  removePhoneRow: (index: number) => void;
  addPhoneRow: () => void;
  savePhones: () => void;
  setShowPhoneModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const TelefonosModal: React.FC<TelefonosModalProps> = ({
  phoneDraft,
  setPhoneDraft,
  removePhoneRow,
  addPhoneRow,
  savePhones,
  setShowPhoneModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium dark:text-gray-200">
            Teléfonos del usuario
          </h4>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {phoneDraft.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
            >
              {/* input tel */}
              <input
                type="text"
                value={row.tel}
                onChange={(e) => {
                  const v = e.target.value;
                  setPhoneDraft((prev) =>
                    prev.map((r, i) => (i === idx ? { ...r, tel: v } : r))
                  );
                }}
                placeholder="Ej: 1123456789"
                className="md:col-span-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
              />

              {/* select tipo */}
              <select
                value={row.phoneType}
                onChange={(e) => {
                  const v = e.target.value as PhoneType;
                  setPhoneDraft((prev) =>
                    prev.map((r, i) => (i === idx ? { ...r, phoneType: v } : r))
                  );
                }}
                className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
              >
                <option value={PhoneType.PRIMARY}>Principal</option>
                <option value={PhoneType.SEC}>Secundario</option>
                <option value={PhoneType.EM}>Emergencia</option>
              </select>

              {/* eliminar fila (opcional) */}
              <button
                type="button"
                onClick={() => removePhoneRow(idx)}
                className="md:col-span-5 inline-flex items-center text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 size={14} className="mr-1" /> Quitar
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addPhoneRow}
            className="inline-flex items-center text-sm px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <Plus size={16} className="mr-1" /> Agregar otro
          </button>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowPhoneModal(false)}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={savePhones}
            className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelefonosModal;

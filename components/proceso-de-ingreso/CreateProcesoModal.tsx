import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { ProcesoIngreso } from "@/utils/types";

interface CreateProcesoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ProcesoIngreso>) => void;
  isLoading: boolean;
}

const CreateProcesoModal = ({ isOpen, onClose, onSubmit, isLoading }: CreateProcesoModalProps) => {
  const [formData, setFormData] = useState({
    nombreIngresante: '',
    puesto: '',
    areaDestino: '',
    fechaEstimadaIngreso: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Nuevo Proceso de Ingreso
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Ingresante *
            </label>
            <input
              type="text"
              value={formData.nombreIngresante}
              onChange={(e) => setFormData(prev => ({ ...prev, nombreIngresante: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Puesto *
            </label>
            <input
              type="text"
              value={formData.puesto}
              onChange={(e) => setFormData(prev => ({ ...prev, puesto: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área de Destino *
            </label>
            <select
              value={formData.areaDestino}
              onChange={(e) => setFormData(prev => ({ ...prev, areaDestino: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Seleccionar área</option>
              <option value="IT">IT</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
              <option value="Operaciones">Operaciones</option>
              <option value="Administración">Administración</option>
              <option value="Gestión de Calidad">Gestión de Calidad</option>
              <option value="Gestión de Activos">Gestión de Activos</option>
              <option value="Higiene y Seguridad">Higiene y Seguridad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Estimada de Ingreso *
            </label>
            <input
              type="date"
              value={formData.fechaEstimadaIngreso}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaEstimadaIngreso: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Crear Proceso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProcesoModal;
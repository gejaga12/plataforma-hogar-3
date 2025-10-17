import { useMemo, useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { ProcessPayload } from "@/utils/api/apiProcesoIngreso";

interface CreateProcesoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  flujos: Array<{ _id?: string; id?: string; code?: string; type?: string }>;
  onSubmit: (data: { flowId: string; payload: ProcessPayload }) => void;
}

const CreateProcesoModal = ({
  isOpen,
  onClose,
  isLoading,
  flujos,
  onSubmit,
}: CreateProcesoModalProps) => {
  const [formData, setFormData] = useState({
    usuario: "",
    prioridad: "media",
    puesto: "",
    areaDestino: "",
    fechaEstimadaIngreso: "",
    fechaInicio: "", // si querés default: new Date().toISOString().slice(0,16) para datetime-local
  });
  const [estadoGeneral] = useState("iniciado");
  const [flowId, setFlowId] = useState("");

  const flujoOptions = useMemo(
    () =>
      (flujos || []).map((f) => ({
        value: (f._id || f.id || "") as string,
        label: `${f.code ?? "(sin code)"}${f.type ? ` · ${f.type}` : ""}`,
      })),
    [flujos]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowId) {
      alert("Seleccioná un flujo base.");
      return;
    }

    const payload: ProcessPayload = {
      usuario: formData.usuario,
      fechaInicio: formData.fechaInicio || new Date().toISOString(),
      prioridad: formData.prioridad,
      puesto: formData.puesto,
      areaDestino: formData.areaDestino,
      fechaEstimadaIngreso: formData.fechaEstimadaIngreso,
      estadoGeneral,
      pasos: [],
      createdAt: new Date().toISOString(),
      // updatedAt: se omite en creación
    };
    console.log("[CREATE PROCESO] flowId:", flowId, "payload:", payload);
    onSubmit({ flowId, payload });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Nuevo Proceso de Ingreso
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Flujo base */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flujo base *
            </label>
            <select
              value={flowId}
              onChange={(e) => setFlowId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar flujo</option>
              {flujoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario (ingresante) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario / Ingresante *
            </label>
            <input
              type="text"
              value={formData.usuario}
              onChange={(e) =>
                setFormData((p) => ({ ...p, usuario: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad *
            </label>
            <select
              value={formData.prioridad}
              onChange={(e) =>
                setFormData((p) => ({ ...p, prioridad: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          {/* Puesto / Área */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puesto *
              </label>
              <input
                type="text"
                value={formData.puesto}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, puesto: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área de Destino *
              </label>
              <select
                value={formData.areaDestino}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, areaDestino: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="datetime-local"
                value={formData.fechaInicio}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fechaInicio: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Estimada de Ingreso *
              </label>
              <input
                type="date"
                value={formData.fechaEstimadaIngreso}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    fechaEstimadaIngreso: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Crear Proceso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProcesoModal;

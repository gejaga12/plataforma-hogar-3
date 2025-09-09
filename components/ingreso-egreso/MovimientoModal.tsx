import { useEffect, useState } from "react";
import { MovimientoIngresoEgreso } from "@/components/ingreso-egreso/IngresoEgresoContent";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingresoService } from "@/api/apiIngreso";
import toast from "react-hot-toast";

export interface CreateMovimientoData {
  usuarioId: string; // UUID del usuario seleccionado
  tipo: "INGRESO" | "EGRESO"; // Se convierte a typeAction (lowercase)
  reason: string; // Motivo del movimiento (se mapea a `reason`)
  modo: "normal" | "eventual" | "viaje"; // Modo de jornada
  ubicacion?: {
    direccion?: string;
    latitud?: number;
    longitud?: number;
  };
  observaciones?: string; // Campo opcional para anotar detalles adicionales
}

interface MovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimiento?: MovimientoIngresoEgreso;
  mode: "create" | "view";
}

const MovimientoModal = ({
  isOpen,
  onClose,
  movimiento,
  mode,
}: MovimientoModalProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        lan: formData.ubicacion?.latitud,
        lng: formData.ubicacion?.longitud,
        typeAction: formData.tipo.toLowerCase(),
        reason: formData.reason,
        modo: formData.modo,
      };

      console.log("enviado ingreso-egreso:", payload);

      return await ingresoService.createIngreso(payload);
    },
    onSuccess: () => {
      toast.success("Movimiento creado");
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Error al registrar el movimiento"
      );
    },
  });

  const [formData, setFormData] = useState<CreateMovimientoData>({
    usuarioId: movimiento?.usuario.id || "",
    tipo: movimiento?.tipo || "INGRESO",
    reason: "",
    modo: "normal",
    ubicacion: movimiento?.ubicacion,
    observaciones: movimiento?.observaciones || "",
  });

  useEffect(() => {
    if (isOpen && mode === "view" && movimiento) {
      setFormData({
        usuarioId: movimiento.usuario.id || "",
        tipo: movimiento.tipo,
        reason: movimiento.motivo || "",
        modo: movimiento.modo as "normal" | "eventual" | "viaje",
        ubicacion: movimiento.ubicacion,
        observaciones: movimiento.observaciones || "",
      });
    }
  }, [isOpen, mode, movimiento]);

  if (!isOpen) return null;

  const isReadOnly = mode === "view";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create" && "Registrar Movimiento"}
              {mode === "view" && "Detalles del Movimiento"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate();
          }}
          className="p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tipo: e.target.value as "INGRESO" | "EGRESO",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              >
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: Inicio de jornada laboral, Visita a cliente, etc."
              required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modo de jornada *
            </label>
            <select
              value={formData.modo}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  modo: e.target.value as "normal" | "eventual" | "viaje",
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              disabled={isReadOnly}
            >
              <option value="normal">Normal</option>
              <option value="eventual">Eventual</option>
              <option value="viaje">Viaje</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.ubicacion?.direccion || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ubicacion: { ...prev.ubicacion, direccion: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Dirección o ubicación del movimiento"
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observaciones: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Información adicional sobre el movimiento"
              disabled={isReadOnly}
            />
          </div>

          {mode === "view" && movimiento && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispositivo
                </label>
                <p className="text-sm text-gray-900">
                  {movimiento.dispositivo || "No especificado"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address
                </label>
                <p className="text-sm text-gray-900">
                  {movimiento.ipAddress || "No disponible"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registrado por
                </label>
                <p className="text-sm text-gray-900">
                  {movimiento.registradoPor || "Sistema"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de registro
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(movimiento.createdAt).toLocaleString("es-ES")}
                </p>
              </div>
            </div>
          )}

          {!isReadOnly && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                disabled={isPending}
              >
                {isPending ? "Creando..." : "Confirmar"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MovimientoModal;

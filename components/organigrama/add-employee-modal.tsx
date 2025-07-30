"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { JerarquiaService } from "@/api/apiJerarquia";
import toast from "react-hot-toast";
import { queryClient } from "@/utils/query-client";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodoId?: string;
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  nodoId,
}: AddEmployeeModalProps) {
  const { usuarios } = useAuth();

  const [usuarioId, setUsuarioId] = useState<string | undefined>(undefined);

  const tablaRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setUsuarioId(undefined);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUsuarioId(undefined);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const asociarUsuarioMutation = useMutation({
    mutationFn: ({ orgid, userid }: { orgid: string; userid: string }) =>
      JerarquiaService.asociarUsuarioANodo(orgid, userid),
    onSuccess: () => {
      toast.success("Usuario asignado al nodo correctamente");
      queryClient.invalidateQueries({ queryKey: ["jerarquia"] });
      setUsuarioId(undefined);
      handleClose();
    },

    onError: (error: any) => {
      console.error("Error al asociar usuario:", error.message);
      toast.error("No se pudo asociar el usuario");
    },
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Asignar un empleado
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asignar usuario (opcional)
          </label>
          <div
            ref={tablaRef}
            className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded"
          >
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-100">
              <thead className="bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 uppercase">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setUsuarioId(user.id)}
                    className={`cursor-pointer ${
                      usuarioId === user.id
                        ? "bg-orange-100 dark:bg-orange-600 text-orange-900 dark:text-white"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <td className="px-4 py-2">{user.id}</td>
                    <td className="px-4 py-2">{user.fullName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {usuarioId && (
          <div className="flex justify-end px-6 pb-4">
            <button
              onClick={() => {
                if (!nodoId) {
                  toast.error("No hay nodo seleccionado");
                  return; // <- narrowing: después de esto nodoId es string
                }
                if (!usuarioId) {
                  toast.error("Seleccioná un usuario");
                  return;
                }

                console.log("🚀 Enviando mutación con:", {
                  orgid: nodoId,
                  userid: usuarioId,
                });

                asociarUsuarioMutation.mutate({
                  orgid: nodoId, // <- ahora TS no se queja
                  userid: usuarioId,
                });
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Confirmar asignación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

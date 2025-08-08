"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

  const [usuarioId, setUsuarioId] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const tablaRef = useRef<HTMLDivElement>(null);

  const usuariosFiltrados = useMemo(() => {
    return usuarios
      .filter((user) => user.jerarquia === null)
      .filter((user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [usuarios, searchTerm]);

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
    mutationFn: ({ orgid, userid }: { orgid: string; userid: number }) =>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] min-h-[40vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-400">
              Asignar un empleado
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="mt-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="p-2">
          <div
            ref={tablaRef}
            className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded"
          >
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-100">
              <thead className="bg-orange-500 dark:bg-gray-700 text-xs text-white dark:text-gray-300 uppercase">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((user) => (
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
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      No hay usuarios disponibles para asignar.
                    </td>
                  </tr>
                )}
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
                asociarUsuarioMutation.mutate({
                  orgid: nodoId,
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

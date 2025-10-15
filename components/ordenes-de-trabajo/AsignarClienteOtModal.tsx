'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Ots, UserAdapted } from '@/utils/types';
import { AuthService } from '@/utils/api/apiAuth';
import { OTService } from '@/utils/api/apiOTs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const AsignarOTModal = ({
  open,
  onClose,
  ot,
}: {
  open: boolean;
  onClose: () => void;
  ot: Ots | null;
}) => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');

  // Helper para mostrar algo legible del Task
  const getTaskLabel = (o: Ots | null) => {
    if (!o?.task) return 'Sin tarea asociada';
    // Task tiene: code (string), priority ('alta'|'media'|'baja'), etc.
    const code = o.task.code || 'Tarea';
    const pr = o.task.priority ? ` · Prioridad: ${o.task.priority}` : '';
    return `${code}${pr}`;
  };

  // 🔹 Traer lista de usuarios
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<UserAdapted[]>({
    queryKey: ['users', 10, 0],
    queryFn: () => AuthService.getUsers(10, 0),
    enabled: open,
  });

  // 🔹 Mutation asignar OT
  const asignarClienteAOT = useMutation({
    mutationFn: ({ otId, userId }: { otId: number; userId: number }) =>
      OTService.asignarOT(otId, userId),
    onSuccess: () => {
      toast.success('OT asignada con éxito ✅');
      queryClient.invalidateQueries({ queryKey: ['ots-backlog'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al asignar OT ❌');
    },
  });

  if (!open || !ot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Asignar OT #{ot.id}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getTaskLabel(ot)}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Comentario */}
          <textarea
            placeholder="Comentario..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />

          {/* Lista de usuarios */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Selecciona un usuario
            </h4>
            {isLoading && <p className="text-sm text-gray-500">Cargando...</p>}
            {isError && <p className="text-sm text-red-500">Error al cargar usuarios</p>}

            <div className="max-h-48 overflow-y-auto border rounded-md divide-y dark:divide-gray-700">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="usuario"
                    checked={selectedUser === u.id}
                    onChange={() => setSelectedUser(u.id)}
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {u.fullName}
                  </span>
                </label>
              ))}
              {users.length === 0 && !isLoading && !isError && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No hay usuarios para asignar.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (selectedUser) {
                asignarClienteAOT.mutate({ otId: ot.id, userId: selectedUser });
              }
            }}
            disabled={asignarClienteAOT.isPending || !selectedUser}
            className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {asignarClienteAOT.isPending ? 'Asignando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

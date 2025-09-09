import { AuthService } from "@/api/apiAuth";
import { TaskServices } from "@/api/apiFormularios";
import { OTService } from "@/api/apiOTs";
import { Task } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import React, { useState } from "react";

interface CrearOTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    commentary: string;
    task: string;
    userId?: number;
  }) => void;
}

const CrearOTModal: React.FC<CrearOTModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [commentary, setCommentary] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const {
    data: tasks,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks", 10, 0],
    queryFn: () => TaskServices.getTasks(10, 0),
  });

  const {
    data: users,
    isLoading: loadingUsers,
    isError: errorUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users", 10, 0], // puedes parametrizar limit/offset
    queryFn: () => AuthService.getUsers(10, 0),
  });

  const handleSubmit = () => {
    if (!selectedTask) {
      alert("Debes seleccionar una Task");
      return;
    }

    onSubmit({
      commentary,
      task: selectedTask,
      userId: selectedUser ? selectedUser : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Crear Orden de Trabajo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X />
          </button>
        </div>

        {/* Comentario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comentario
          </label>
          <textarea
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            rows={3}
            placeholder="Escribe un comentario..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Selección de Task */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Seleccionar Task
          </label>
          <input
            type="text"
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            placeholder="Buscar task..."
            className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            {isLoading && (
              <p className="p-3 text-sm text-gray-500">Cargando tareas...</p>
            )}
            {isError && (
              <p className="p-3 text-sm text-red-500">
                {(error as Error).message}
              </p>
            )}
            {tasks &&
              tasks
                .filter((t: Task) =>
                  (t?.code ?? "")
                    .toLowerCase()
                    .includes(taskSearch.toLowerCase())
                )
                .map((task: Task) => (
                  <div
                    key={task.id}
                    onClick={() =>
                      setSelectedTask(task.id ? String(task.id) : null)
                    }
                    className={`px-3 py-2 cursor-pointer ${
                      selectedTask === task.id
                        ? "bg-orange-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {task.code}
                  </div>
                ))}
          </div>
        </div>

        {/* Selección de Usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asignar Usuario
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            {loadingUsers && (
              <p className="p-3 text-sm text-gray-500">Cargando usuarios...</p>
            )}
            {errorUsers && (
              <p className="p-3 text-sm text-red-500">
                {(usersError as Error).message}
              </p>
            )}
            {users &&
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`px-3 py-2 cursor-pointer ${
                    selectedUser === user.id
                      ? "bg-orange-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {user.fullName || (
                    <span className="italic text-gray-400">Sin nombre</span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Footer - Botones */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
          >
            Crear OT
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearOTModal;

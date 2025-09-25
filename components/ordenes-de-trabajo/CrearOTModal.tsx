"use client";

import { AuthService } from "@/utils/api/apiAuth";
import { ClientService } from "@/utils/api/apiCliente";
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
    priority?: "baja" | "media" | "alta" | "default";
  }) => void;
}

const CrearOTModal: React.FC<CrearOTModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [commentary, setCommentary] = useState("");
  const [prioridad, setPrioridad] = useState<
    "baja" | "media" | "alta" | "default"
  >("default");

  // Selecciones jerárquicas
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedSucursal, setSelectedSucursal] = useState<any>(null);
  const [selectedSector, setSelectedSector] = useState<any>(null);
  const [selectedEquipo, setSelectedEquipo] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");

  // 🔹 Clientes → sucursales → sectores → equipos → tasks
  const { data: clientes, isLoading: loadingClientes } = useQuery({
    queryKey: ["clientes", 10, 0],
    queryFn: () => ClientService.listarClientesCompletos(10, 0),
  });

  console.log("clientes para ot:", clientes);

  // 🔹 Usuarios
  const {
    data: users,
    isLoading: loadingUsers,
    isError: errorUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users", 10, 0],
    queryFn: () => AuthService.getUsers(10, 0),
  });

  const resetForm = () => {
    setCommentary("");
    setPrioridad("default");
    setSelectedClient(null);
    setSelectedSucursal(null);
    setSelectedSector(null);
    setSelectedEquipo(null);
    setSelectedTask(null);
    setSelectedUser(null);
    setUserSearch("");
  };

  const handleSubmit = () => {
    if (!selectedTask) {
      alert("Debes seleccionar una Task");
      return;
    }

    onSubmit({
      commentary,
      task: selectedTask,
      userId: selectedUser ? selectedUser : undefined,
      priority: prioridad !== "default" ? prioridad : undefined,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Crear Orden de Trabajo
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X />
          </button>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 md:divide-x md:divide-gray-200 dark:md:divide-gray-700">
          {/* Selección Jerárquica Cliente -> Task */}
          <div className="space-y-4 pr-0 md:pr-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cliente
              </label>
              {loadingClientes && <p>Cargando clientes...</p>}
              <select
                value={selectedClient?.id || ""}
                onChange={(e) => {
                  const client = clientes?.clients.find(
                    (c: any) => c.id === e.target.value
                  );
                  setSelectedClient(client);
                  setSelectedSucursal(null);
                  setSelectedSector(null);
                  setSelectedEquipo(null);
                  setSelectedTask(null);
                }}
                className="w-full p-2 border rounded-lg dark:bg-gray-700"
              >
                <option value="">Seleccionar cliente</option>
                {clientes?.clients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sucursal */}
            {selectedClient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sucursal
                </label>
                <select
                  value={selectedSucursal?.id || ""}
                  onChange={(e) => {
                    const suc = selectedClient.suc.find(
                      (s: any) => s.id === e.target.value
                    );
                    setSelectedSucursal(suc);
                    setSelectedSector(null);
                    setSelectedEquipo(null);
                    setSelectedTask(null);
                  }}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="">Seleccionar sucursal</option>
                  {selectedClient.suc.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sector */}
            {selectedSucursal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sector
                </label>
                <select
                  value={selectedSector?.id || ""}
                  onChange={(e) => {
                    const sec = selectedSucursal.sectores.find(
                      (s: any) => s.id === e.target.value
                    );
                    setSelectedSector(sec);
                    setSelectedEquipo(null);
                    setSelectedTask(null);
                  }}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="">Seleccionar sector</option>
                  {selectedSucursal.sectores.map((sec: any) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Equipo */}
            {selectedSector && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Equipo
                </label>
                <select
                  value={selectedEquipo?.id || ""}
                  onChange={(e) => {
                    const eq = selectedSector.equipos.find(
                      (eq: any) => eq.id === e.target.value
                    );
                    setSelectedEquipo(eq);
                    setSelectedTask(null);
                  }}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="">Seleccionar equipo</option>
                  {selectedSector.equipos.map((eq: any) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Task */}
            {selectedEquipo && selectedEquipo.pt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task
                </label>
                <select
                  value={selectedTask || ""}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="">Seleccionar Task</option>
                  <option value={selectedEquipo.pt}>
                    {clientes?.pts?.name || "Task asociada"}
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* Selección Usuario */}
          <div className="space-y-2 pl-0 md:pl-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Asignar Usuario
            </label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
              {loadingUsers && (
                <p className="p-3 text-sm">Cargando usuarios...</p>
              )}
              {errorUsers && (
                <p className="p-3 text-sm text-red-500">
                  Error al cargar usuarios
                </p>
              )}
              {users &&
                users
                  .filter((u) =>
                    (u.fullName ?? "")
                      .toLowerCase()
                      .includes(userSearch.toLowerCase())
                  )
                  .map((user) => (
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
                        <span className="italic">Sin nombre</span>
                      )}
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Segunda fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 md:divide-x md:divide-gray-200 dark:md:divide-gray-700">
          {/* Prioridad */}
          <div className="space-y-2 pr-0 md:pr-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prioridad
            </label>
            <select
              value={prioridad}
              onChange={(e) =>
                setPrioridad(
                  e.target.value as "baja" | "media" | "alta" | "default"
                )
              }
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="default">Sin prioridad</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          {/* Comentario */}
          <div className="space-y-2 pl-0 md:pl-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={handleClose}
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

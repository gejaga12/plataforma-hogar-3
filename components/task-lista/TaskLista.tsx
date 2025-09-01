"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, Plus, Layers, X, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactFlowProvider } from "reactflow";
import { FlowLienzo } from "./FlowLienzo";
import { TaskServices } from "@/api/apiFormularios";
import { Task } from "@/utils/types";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import { LoadingSpinner } from "../ui/loading-spinner";

type Item = {
  id: string;
  nombre: string;
};

export function TaskLista() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [closing, setClosing] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const {
    data: taskListData,
    isLoading: loadingTasks,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => TaskServices.getTasks(20, 0),
  });

  const tasks: Task[] = useMemo(
    () => (Array.isArray(taskListData) ? taskListData : []),
    [taskListData]
  );

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await TaskServices.deleteTask(id);
    },
    onSuccess: () => {
      toast.success("Tarea eliminada.");
      setModalOpen(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast.error("Error al eliminar la tarea. Intenten nuevamente");
      console.log("mensaje del error:", error);
    },
  });

  const filtered = useMemo(
    () =>
      tasks.filter((t) =>
        (t.code ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [tasks, searchTerm]
  );

  const {
    data: selectedTask,
    isLoading: loadingDetail,
    isError: errorDetail,
    error: errorTask,
  } = useQuery({
    queryKey: ["task", selectedTaskId],
    queryFn: () => TaskServices.getTaskbyId(selectedTaskId!),
    enabled: !!selectedTaskId,
  });

  useEffect(() => {
    if (selectedTaskId && !closing) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedTaskId, closing]);

  const handleOpen = (id: string) => {
    setSelectedTaskId(id);
    setClosing(false);
  };

  const handleClose = () => {
    // animación de salida: deslizar a la derecha y luego desmontar
    setClosing(true);
    setTimeout(() => {
      setSelectedTaskId(null);
      setClosing(false);
    }, 300); // debe coincidir con duration-300
  };

  const handleClickEliminar = (item: Item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧩 Tareas</h1>
          <p className="text-gray-600 mt-1">
            Visualizá el flujo de subtareas por árbol
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar tareas por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estado de carga / error */}
      {loadingTasks && <p className="text-gray-500">Cargando tareas...</p>}
      {isError && (
        <p className="text-red-500">
          Error al cargar tareas: {(error as any)?.message}
        </p>
      )}

      {/* LISTA (full width; el modal se superpone, no deforma el layout) */}
      <div className="space-y-4">
        {filtered.map((task) => {
          const isSelected = task.id === selectedTaskId && !closing;
          return (
            <div
              key={task.id}
              onClick={() => handleOpen(task.id!)}
              className={`cursor-pointer border border-gray-200 rounded-lg bg-white hover:bg-orange-50 transition shadow-sm ${
                isSelected ? "ring-2 ring-orange-400" : ""
              }`}
            >
              {/* Fila principal: panel rojo (peer) + contenido */}
              <div className="flex items-stretch">
                {/* Contenido: se corre a la izquierda SOLO cuando la franja está en hover */}
                <div className="flex-1 p-4 transition-all duration-300 ease-out peer-hover:mr-20 sm:peer-hover:mr-24">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="text-orange-500" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">
                          {task.code}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 capitalize">
                        Prioridad: {task.priority}
                      </p>
                    </div>

                    <div className="text-right text-sm text-gray-600 space-y-1">
                      <div>
                        Duración: {task.duration?.horas ?? 0}h{" "}
                        {task.duration?.minutos ?? 0}m
                      </div>
                      {task.paro && (
                        <div>
                          Paro: {task.paro.horas}h {task.paro.minutos}m
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Panel rojo: franja fija que se expande SOLO al hover del propio botón */}
                <button
                  type="button"
                  aria-label="Eliminar tarea"
                  title="Eliminar tarea"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickEliminar({ id: task.id!, nombre: task.code });
                  }}
                  className="peer group relative bg-red-600 text-white transition-[width] duration-300 ease-out w-4 hover:w-20 sm:hover:w-24 min-w-[1rem] overflow-visible rounded-r-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  <Trash2 className="absolute inset-0 m-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !loadingTasks && (
          <p className="text-gray-500">No hay tareas para mostrar.</p>
        )}
      </div>

      {/* MODAL Lienzo */}
      {selectedTaskId && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            aria-label="Cerrar"
            onClick={handleClose}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              closing ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Panel deslizante */}
          <div
            className={`fixed right-0 top-0 h-screen w-full lg:w-1/2 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ${
              closing ? "translate-x-full" : "translate-x-0"
            }`}
          >
            {/* Header del panel */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h3 className="text-base font-semibold text-gray-800">
                {loadingDetail
                  ? "Cargando estructura..."
                  : "Estructura de la tarea"}
              </h3>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 text-white hover:bg-gray-700 shadow"
              >
                <X size={16} />
                Ocultar
              </button>
            </div>

            {/* Contenido scrollable a toda altura */}
            <div className="h-[calc(100vh-42px)] overflow-auto p-3">
              {loadingDetail ? (
                <div className="h-full grid place-items-center text-gray-500">
                  Cargando…
                </div>
              ) : errorDetail ? (
                <div className="h-full grid place-items-center text-red-500">
                  Error: {(errorTask as any)?.message}
                </div>
              ) : selectedTask ? (
                <ReactFlowProvider>
                  <div className="h-[80vh] lg:h-[calc(100vh-90px)]">
                    {/* FlowLienzo llenará 100% de este contenedor */}
                    <FlowLienzo task={selectedTask} />
                  </div>
                </ReactFlowProvider>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          if (selectedItem) {
            console.log("Eliminando tarea con ID:", selectedItem.id);
            deleteTaskMutation.mutate(selectedItem.id);
          }
        }}
        title={`Eliminar "${selectedItem?.nombre}"`}
        message="¿Estás seguro? Esta acción no se puede deshacer."
      />
    </div>
  );
}

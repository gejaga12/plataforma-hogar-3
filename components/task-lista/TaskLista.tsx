"use client";
import React, { useState } from "react";
import { Search, Filter, Plus, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ReactFlowProvider } from "reactflow";
import { FlowLienzo } from "./FlowLienzo";
import { TaskServices } from "@/api/apiFormularios";
import { Task } from "@/utils/types";

export function TaskLista() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => TaskServices.getTasks(20, 0),
  });

  const tasks: Task[] = data || [];

  console.log("tasks traidas:", tasks);

  const filtered = tasks.filter((t) =>
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
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

  console.log('arbol:', selectedTask);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧩 Tareas</h1>
          <p className="text-gray-600 mt-1">
            Estructura visual de tareas con subtareas principales y secundarias
          </p>
        </div>

        <button
          onClick={() => console.log("clicked")}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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

          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTaskId(task.id!)}
            className="cursor-pointer border border-gray-200 rounded-lg p-4 bg-white hover:bg-orange-50 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
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
                  ⏱️ Duración: {task.duration?.horas ?? 0}h{" "}
                  {task.duration?.minutos ?? 0}m
                </div>
                {task.paro && (
                  <div>
                    ✂️ Corte: {task.paro.horas}h {task.paro.minutos}m
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* React Flow Canvas */}
      {selectedTaskId && (
        <div className="mt-6 border-t pt-6">
          <ReactFlowProvider>
            {loadingDetail ? (
              <p className="text-gray-500">Cargando estructura...</p>
            ) : errorDetail ? (
              <p className="text-red-500">Error: {errorTask?.message}</p>
            ) : selectedTask ? (
              <FlowLienzo task={selectedTask} />
            ) : null}
          </ReactFlowProvider>
        </div>
      )}
    </div>
  );
}

"use client";

import { Calendar, Plus } from "lucide-react";

interface AgendaHeaderProps {
  onCreateEvent: () => void;
}

export function AgendaHeader({ onCreateEvent }: AgendaHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Calendar size={25} /> 
          <span>Agenda de Trabajo</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona tus reuniones, tareas y eventos importantes
        </p>
      </div>

      <button
        onClick={onCreateEvent}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
      >
        <Plus size={20} />
        <span>Nuevo Evento</span>
      </button>
    </div>
  );
}

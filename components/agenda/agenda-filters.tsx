'use client';

import { Calendar, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { AgendaView, AgendaEventType } from '@/utils/types';
import { cn } from '@/lib/utils';

interface AgendaFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: AgendaEventType | '';
  onTypeFilterChange: (value: AgendaEventType | '') => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  viewMode: AgendaView;
  onViewModeChange: (value: AgendaView) => void;
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function AgendaFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  viewMode,
  onViewModeChange,
  currentDate,
  onPrevious,
  onNext,
  onToday
}: AgendaFiltersProps) {
  // Format the current date range based on view mode
  const formatDateRange = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (viewMode === 'week') {
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay(); // 0 for Sunday, 1 for Monday, etc.
      startOfWeek.setDate(startOfWeek.getDate() - day);
      
      // Get the end of the week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      // Format the date range
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${endOfWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      } else if (startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
        return `${startOfWeek.getDate()} de ${startOfWeek.toLocaleDateString('es-ES', { month: 'long' })} - ${endOfWeek.getDate()} de ${endOfWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      } else {
        return `${startOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} - ${endOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      }
    } else if (viewMode === 'month') {
      return currentDate.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
    
    return '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as AgendaEventType | '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Todos los tipos</option>
            <option value="meeting">Reuniones</option>
            <option value="task">Tareas</option>
            <option value="deadline">Fechas límite</option>
            <option value="training">Capacitaciones</option>
            <option value="reminder">Recordatorios</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Todas las prioridades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <button
            onClick={onPrevious}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatDateRange()}
          </h2>
          
          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          
          <button
            onClick={onToday}
            className="ml-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onViewModeChange('day')}
            className={cn(
              "px-3 py-1 rounded",
              viewMode === 'day' 
                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            Día
          </button>
          <button 
            onClick={() => onViewModeChange('week')}
            className={cn(
              "px-3 py-1 rounded",
              viewMode === 'week' 
                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            Semana
          </button>
          <button 
            onClick={() => onViewModeChange('month')}
            className={cn(
              "px-3 py-1 rounded",
              viewMode === 'month' 
                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            Mes
          </button>
          <button 
            onClick={() => onViewModeChange('list')}
            className={cn(
              "px-3 py-1 rounded",
              viewMode === 'list' 
                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            Lista
          </button>
        </div>
      </div>
    </div>
  );
}
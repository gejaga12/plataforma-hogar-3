'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronUp, 
  ChevronDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { AgendaEvent } from '@/utils/types';
import { cn } from '@/lib/utils';

interface AgendaListProps {
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
}

export function AgendaList({ events, onEventClick }: AgendaListProps) {
  const [sortField, setSortField] = useState<'startDate' | 'title' | 'priority'>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Group events by date
  const groupedEvents: Record<string, AgendaEvent[]> = {};
  
  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    if (sortField === 'startDate') {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortField === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      return sortDirection === 'asc' ? priorityA - priorityB : priorityB - priorityA;
    }
    return 0;
  });

  // Group events by date
  sortedEvents.forEach(event => {
    const date = new Date(event.startDate).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    
    groupedEvents[date].push(event);
  });

  // Handle sort
  const handleSort = (field: 'startDate' | 'title' | 'priority') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get event type badge
  const getEventTypeBadge = (type: AgendaEventType) => {
    switch (type) {
      case 'meeting':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300">
            Reunión
          </span>
        );
      case 'task':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
            Tarea
          </span>
        );
      case 'deadline':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
            Fecha límite
          </span>
        );
      case 'training':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
            Capacitación
          </span>
        );
      case 'reminder':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
            Recordatorio
          </span>
        );
      default:
        return null;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            Alta
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
            Media
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
            Baja
          </span>
        );
      default:
        return null;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 flex items-center">
            <CheckCircle size={12} className="mr-1" />
            Confirmado
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
            Pendiente
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
            Completado
          </span>
        );
      default:
        return null;
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if an event is today
  const isToday = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  // Check if an event is in the past
  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Table header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('startDate')}
                    className="flex items-center space-x-1"
                  >
                    <span>Fecha y hora</span>
                    {sortField === 'startDate' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-1"
                  >
                    <span>Evento</span>
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('priority')}
                    className="flex items-center space-x-1"
                  >
                    <span>Prioridad</span>
                    {sortField === 'priority' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Participantes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedEvents.map((event, index) => (
                <tr 
                  key={event.id} 
                  onClick={() => onEventClick(event)}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors",
                    index % 2 === 1 && "bg-gray-50 dark:bg-gray-750"
                  )}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
                        <Calendar size={16} className="mr-2 text-gray-400 dark:text-gray-500" />
                        <span className={cn(
                          isToday(event.startDate) && "text-orange-600 dark:text-orange-400 font-semibold",
                          isPast(event.startDate) && !isToday(event.startDate) && "text-gray-500 dark:text-gray-400"
                        )}>
                          {new Date(event.startDate).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Clock size={16} className="mr-2 text-gray-400 dark:text-gray-500" />
                        {formatTime(event.startDate)}
                        {event.endDate && ` - ${formatTime(event.endDate)}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.title}</div>
                    {event.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {event.description}
                      </div>
                    )}
                    {event.relatedOrder && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Orden: {event.relatedOrder}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getEventTypeBadge(event.type)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getPriorityBadge(event.priority)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(event.status)}
                  </td>
                  <td className="px-4 py-4">
                    {event.location ? (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin size={16} className="mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {event.participants && event.participants.length > 0 ? (
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                          {event.participants.slice(0, 3).map((participant, i) => (
                            <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                              {participant.avatar ? (
                                <img 
                                  src={participant.avatar} 
                                  alt={participant.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                    {participant.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {event.participants.length > 3 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            +{event.participants.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay eventos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No se encontraron eventos con los filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
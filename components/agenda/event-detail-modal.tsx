'use client';

import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Edit,
  X,
  RefreshCw,
  FileText
} from 'lucide-react';
import { AgendaEvent } from '@/utils/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/utils/cn';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: AgendaEvent;
  onEdit: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function EventDetailModal({ 
  isOpen, 
  onClose, 
  event, 
  onEdit, 
  onDelete, 
  isLoading 
}: EventDetailModalProps) {
  if (!isOpen) return null;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get event type label
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'Reunión';
      case 'task':
        return 'Tarea';
      case 'deadline':
        return 'Fecha límite';
      case 'training':
        return 'Capacitación';
      case 'reminder':
        return 'Recordatorio';
      default:
        return type;
    }
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300';
      case 'task':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300';
      case 'deadline':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'training':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'reminder':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Get recurrence label
  const getRecurrenceLabel = (recurrence: string | null) => {
    if (!recurrence) return 'No se repite';
    
    switch (recurrence) {
      case 'daily':
        return 'Diariamente';
      case 'weekly':
        return 'Semanalmente';
      case 'monthly':
        return 'Mensualmente';
      case 'quarterly':
        return 'Trimestralmente';
      case 'yearly':
        return 'Anualmente';
      default:
        return recurrence;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Detalles del Evento
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Event title and badges */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {event.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className={cn(
                  "px-3 py-1 text-sm font-medium rounded-full",
                  getEventTypeColor(event.type)
                )}>
                  {getEventTypeLabel(event.type)}
                </span>
                <span className={cn(
                  "px-3 py-1 text-sm font-medium rounded-full",
                  getPriorityColor(event.priority)
                )}>
                  Prioridad: {getPriorityLabel(event.priority)}
                </span>
                <span className={cn(
                  "px-3 py-1 text-sm font-medium rounded-full",
                  getStatusColor(event.status)
                )}>
                  {getStatusLabel(event.status)}
                </span>
              </div>
            </div>

            {/* Event description */}
            {event.description && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Event details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</h4>
                    <p className="text-gray-900 dark:text-gray-100">{formatDate(event.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Hora</h4>
                    <p className="text-gray-900 dark:text-gray-100">
                      {formatTime(event.startDate)}
                      {event.endDate && ` - ${formatTime(event.endDate)}`}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</h4>
                      <p className="text-gray-900 dark:text-gray-100">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.recurrence && (
                  <div className="flex items-start">
                    <RefreshCw className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recurrencia</h4>
                      <p className="text-gray-900 dark:text-gray-100">{getRecurrenceLabel(event.recurrence)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {event.participants && event.participants.length > 0 && (
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Participantes</h4>
                      <div className="mt-2 space-y-2">
                        {event.participants.map((participant, index) => (
                          <div key={index} className="flex items-center">
                            {participant.avatar ? (
                              <img 
                                src={participant.avatar} 
                                alt={participant.name} 
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-2">
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                  {participant.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <span className="text-gray-900 dark:text-gray-100">{participant.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {event.relatedOrder && (
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Orden relacionada</h4>
                      <p className="text-blue-600 dark:text-blue-400 underline">{event.relatedOrder}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Creado por</h4>
                    <p className="text-gray-900 dark:text-gray-100">
                      {event.participants?.find(p => p.id === event.createdBy)?.name || 'Usuario'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Editar</span>
              </button>
              <button
                onClick={onDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
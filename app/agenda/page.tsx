'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AgendaEvent, AgendaEventType, AgendaView } from '@/utils/types';
import { AgendaCalendar } from '@/components/agenda/agenda-calendar';
import { EventModal } from '@/components/agenda/event-modal';
import { EventDetailModal } from '@/components/agenda/event-detail-modal';
import { AgendaHeader } from '@/components/agenda/agenda-header';
import { AgendaFilters } from '@/components/agenda/agenda-filters';
import { AgendaList } from '@/components/agenda/agenda-list';

// Mock data for events
const mockEvents: AgendaEvent[] = [
  {
    id: '1',
    title: 'Reunión de equipo',
    description: 'Revisión semanal de proyectos y asignación de tareas',
    startDate: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endDate: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    type: 'meeting',
    location: 'Sala de conferencias A',
    participants: [
      { id: 'user-1', name: 'Juan Pérez', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { id: 'user-2', name: 'María González', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { id: 'user-3', name: 'Carlos Rodríguez' }
    ],
    createdBy: 'user-1',
    status: 'confirmed',
    priority: 'medium',
    recurrence: null,
    color: '#4f46e5'
  },
  {
    id: '2',
    title: 'Mantenimiento preventivo - Cliente ABC',
    description: 'Revisión de equipos de aire acondicionado en oficinas centrales',
    startDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    type: 'task',
    location: 'Av. Libertador 1234, CABA',
    participants: [],
    createdBy: 'user-1',
    status: 'pending',
    priority: 'high',
    relatedOrder: 'ORD-2025-001',
    recurrence: null,
    color: '#f59e0b'
  },
  {
    id: '3',
    title: 'Entrega de informes mensuales',
    description: 'Fecha límite para la entrega de informes de actividad del mes',
    startDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    type: 'deadline',
    participants: [],
    createdBy: 'user-1',
    status: 'pending',
    priority: 'medium',
    recurrence: 'monthly',
    color: '#ef4444'
  },
  {
    id: '4',
    title: 'Capacitación: Nuevos protocolos de seguridad',
    description: 'Sesión obligatoria para todos los técnicos sobre los nuevos protocolos de seguridad en campo',
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    type: 'training',
    location: 'Sala de capacitación',
    participants: [
      { id: 'user-1', name: 'Juan Pérez', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { id: 'user-3', name: 'Carlos Rodríguez' },
      { id: 'user-4', name: 'Ana López', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }
    ],
    createdBy: 'user-2',
    status: 'completed',
    priority: 'high',
    recurrence: null,
    color: '#0ea5e9'
  },
  {
    id: '5',
    title: 'Llamada con proveedor',
    description: 'Discusión sobre nuevos equipos y repuestos',
    startDate: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    endDate: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    type: 'meeting',
    location: 'Llamada virtual',
    participants: [
      { id: 'user-1', name: 'Juan Pérez', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }
    ],
    createdBy: 'user-1',
    status: 'confirmed',
    priority: 'low',
    recurrence: null,
    color: '#4f46e5'
  },
  {
    id: '6',
    title: 'Revisión de presupuesto trimestral',
    description: 'Análisis de gastos y proyecciones para el próximo trimestre',
    startDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    type: 'meeting',
    location: 'Sala de juntas',
    participants: [
      { id: 'user-2', name: 'María González', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { id: 'user-5', name: 'Pedro Martín' }
    ],
    createdBy: 'user-2',
    status: 'confirmed',
    priority: 'medium',
    recurrence: 'quarterly',
    color: '#4f46e5'
  },
  {
    id: '7',
    title: 'Instalación de equipos - Hospital Central',
    description: 'Instalación de nuevos equipos de climatización en área de pediatría',
    startDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    type: 'task',
    location: 'Hospital Central, Av. 9 de Julio 890',
    participants: [
      { id: 'user-3', name: 'Carlos Rodríguez' },
      { id: 'user-4', name: 'Ana López', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }
    ],
    createdBy: 'user-2',
    status: 'pending',
    priority: 'high',
    relatedOrder: 'ORD-2025-003',
    recurrence: null,
    color: '#f59e0b'
  },
  {
    id: '8',
    title: 'Recordatorio: Renovación de certificaciones',
    description: 'Fecha límite para renovar certificaciones técnicas anuales',
    startDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    type: 'reminder',
    participants: [],
    createdBy: 'user-1',
    status: 'pending',
    priority: 'medium',
    recurrence: 'yearly',
    color: '#8b5cf6'
  }
];

// Fetch events from API (mocked)
const fetchEvents = async (): Promise<AgendaEvent[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockEvents;
};

// Create a new event (mocked)
const createEvent = async (event: Omit<AgendaEvent, 'id'>): Promise<AgendaEvent> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ...event,
    id: `${Date.now()}`
  };
};

// Update an existing event (mocked)
const updateEvent = async (event: AgendaEvent): Promise<AgendaEvent> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return event;
};

// Delete an event (mocked)
const deleteEvent = async (eventId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
};

// Enhanced mock available users for participant selection with zone, area, and position
const availableUsers = [
  { id: 'user-1', name: 'Juan Pérez', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', zone: 'CABA', area: 'Técnica', position: 'Técnico Senior' },
  { id: 'user-2', name: 'María González', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', zone: 'GBA Norte', area: 'Administración', position: 'Gerente' },
  { id: 'user-3', name: 'Carlos Rodríguez', zone: 'CABA', area: 'Técnica', position: 'Técnico Junior' },
  { id: 'user-4', name: 'Ana López', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', zone: 'GBA Sur', area: 'Ventas', position: 'Ejecutiva de Ventas' },
  { id: 'user-5', name: 'Pedro Martín', zone: 'GBA Oeste', area: 'Técnica', position: 'Supervisor' },
  { id: 'user-6', name: 'Luis García', zone: 'CABA', area: 'IT', position: 'Desarrollador' },
  { id: 'user-7', name: 'Sofía Fernández', zone: 'GBA Norte', area: 'RRHH', position: 'Analista' },
  { id: 'user-8', name: 'Javier Rodríguez', zone: 'GBA Sur', area: 'Técnica', position: 'Técnico Senior' },
  { id: 'user-9', name: 'Valentina Torres', zone: 'CABA', area: 'Administración', position: 'Asistente' },
  { id: 'user-10', name: 'Matías Sánchez', zone: 'GBA Oeste', area: 'Ventas', position: 'Gerente Regional' },
];

function AgendaContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<AgendaView>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AgendaEventType | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [editMode, setEditMode] = useState(false);

  const queryClient = useQueryClient();

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['agenda-events'],
    queryFn: fetchEvents,
  });

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
      setShowEventModal(false);
    }
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
      setShowEventModal(false);
      setShowDetailModal(false);
      setSelectedEvent(null);
      setEditMode(false);
    }
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
      setShowDetailModal(false);
      setSelectedEvent(null);
    }
  });

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !typeFilter || event.type === typeFilter;
    const matchesPriority = !priorityFilter || event.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle creating a new event
  const handleCreateEvent = (eventData: Omit<AgendaEvent, 'id'>) => {
    createMutation.mutate(eventData);
  };

  // Handle updating an event
  const handleUpdateEvent = (eventData: AgendaEvent) => {
    updateMutation.mutate(eventData);
  };

  // Handle deleting an event
  const handleDeleteEvent = (eventId: string) => {
    deleteMutation.mutate(eventId);
  };

  // Open event detail modal
  const handleEventClick = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  // Open edit modal from detail view
  const handleEditFromDetail = () => {
    setShowDetailModal(false);
    setEditMode(true);
    setShowEventModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AgendaHeader 
        onCreateEvent={() => {
          setSelectedEvent(null);
          setEditMode(false);
          setShowEventModal(true);
        }}
      />

      {/* Filters and View Controls */}
      <AgendaFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentDate={currentDate}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
      />

      {/* Calendar or List View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando agenda...</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <AgendaList 
              events={filteredEvents} 
              onEventClick={handleEventClick}
            />
          ) : (
            <AgendaCalendar
              events={filteredEvents}
              currentDate={currentDate}
              viewMode={viewMode}
              onEventClick={handleEventClick}
            />
          )}
        </>
      )}

      {/* Event Creation/Edit Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditMode(false);
        }}
        onSubmit={editMode ? handleUpdateEvent : handleCreateEvent}
        event={editMode ? selectedEvent : null}
        isLoading={createMutation.isPending || updateMutation.isPending}
        availableUsers={availableUsers}
      />

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          event={selectedEvent}
          onEdit={handleEditFromDetail}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

export default function AgendaPage() {
  return (
    <ProtectedLayout>
      <AgendaContent />
    </ProtectedLayout>
  );
}
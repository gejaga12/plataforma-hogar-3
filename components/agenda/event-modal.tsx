'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  X,
  FileText,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { AgendaEvent } from '@/utils/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: any) => void;
  event: AgendaEvent | null;
  isLoading: boolean;
  availableUsers: { id: string; name: string; avatar?: string; zone?: string; area?: string; position?: string }[];
}

// Enhanced mock data with additional user properties
const enhancedUsers = [
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

export function EventModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  event, 
  isLoading,
  availableUsers
}: EventModalProps) {
  const [formData, setFormData] = useState<Omit<AgendaEvent, 'id'>>({
    title: '',
    description: '',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
    type: 'meeting',
    location: '',
    participants: [],
    createdBy: 'user-1', // Current user ID
    status: 'pending',
    priority: 'medium',
    recurrence: null,
    color: '#4f46e5'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showParticipantSearch, setShowParticipantSearch] = useState(false);
  const [zoneFilter, setZoneFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  
  // Ref for dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize form data when editing an event
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        endDate: event.endDate || '',
        type: event.type,
        location: event.location || '',
        participants: event.participants || [],
        createdBy: event.createdBy,
        status: event.status,
        priority: event.priority,
        recurrence: event.recurrence,
        relatedOrder: event.relatedOrder,
        color: event.color || '#4f46e5'
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        type: 'meeting',
        location: '',
        participants: [],
        createdBy: 'user-1',
        status: 'pending',
        priority: 'medium',
        recurrence: null,
        color: '#4f46e5'
      });
    }
  }, [event]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowParticipantSearch(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extract unique zones, areas, and positions
  const zones = Array.from(new Set(enhancedUsers.map(user => user.zone).filter(Boolean)));
  const areas = Array.from(new Set(enhancedUsers.map(user => user.area).filter(Boolean)));
  const positions = Array.from(new Set(enhancedUsers.map(user => user.position).filter(Boolean)));

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If editing, include the ID
    if (event) {
      onSubmit({
        ...formData,
        id: event.id
      });
    } else {
      onSubmit(formData);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle date changes
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const dateValue = formData[field] ?? new Date().toISOString();
    const currentDate = new Date(dateValue);
    const [year, month, day] = value.split('-').map(Number);
    
    currentDate.setFullYear(year);
    currentDate.setMonth(month - 1);
    currentDate.setDate(day);
    
    handleInputChange(field, currentDate.toISOString());
  };

  // Handle time changes
  const handleTimeChange = (field: 'startDate' | 'endDate', value: string) => {
    const currentDate = new Date(formData[field] ?? new Date().toISOString());
    const [hours, minutes] = value.split(':').map(Number);
    
    currentDate.setHours(hours);
    currentDate.setMinutes(minutes);
    
    handleInputChange(field, currentDate.toISOString());
  };

  // Add participant
  const handleAddParticipant = (user: { id: string; name: string; avatar?: string }) => {
    if (!formData.participants.some(p => p.id === user.id)) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, user]
      }));
    }
    setSearchTerm('');
    setShowParticipantSearch(false); // Close dropdown after selection
  };

  // Remove participant
  const handleRemoveParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== userId)
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setZoneFilter('');
    setAreaFilter('');
    setPositionFilter('');
    setSearchTerm('');
  };

  // Filter available users based on search term and filters
  const filteredUsers = enhancedUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesZone = zoneFilter === '' || user.zone === zoneFilter;
    const matchesArea = areaFilter === '' || user.area === areaFilter;
    const matchesPosition = positionFilter === '' || user.position === positionFilter;
    
    const notAlreadySelected = !formData.participants.some(p => p.id === user.id);
    
    return matchesSearch && matchesZone && matchesArea && matchesPosition && notAlreadySelected;
  });

  // Format date for input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format time for input
  const formatTimeForInput = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {event ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title and Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Título del evento"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="meeting">Reunión</option>
                <option value="task">Tarea</option>
                <option value="deadline">Fecha límite</option>
                <option value="training">Capacitación</option>
                <option value="reminder">Recordatorio</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Descripción del evento"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de inicio *
              </label>
              <div className="flex items-center">
                <Calendar className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
                <input
                  type="date"
                  value={formatDateForInput(formData.startDate)}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora de inicio *
              </label>
              <div className="flex items-center">
                <Clock className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
                <input
                  type="time"
                  value={formatTimeForInput(formData.startDate)}
                  onChange={(e) => handleTimeChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de fin
              </label>
              <div className="flex items-center">
                <Calendar className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
                <input
                  type="date"
                  value={formData.endDate ? formatDateForInput(formData.endDate) : ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora de fin
              </label>
              <div className="flex items-center">
                <Clock className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
                <input
                  type="time"
                  value={formData.endDate ? formatTimeForInput(formData.endDate) : ''}
                  onChange={(e) => handleTimeChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación
            </label>
            <div className="flex items-center">
              <MapPin className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ubicación del evento"
              />
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Participantes
            </label>
            <div className="space-y-3">
              {/* Selected participants */}
              {formData.participants.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.participants.map((participant) => (
                    <div 
                      key={participant.id}
                      className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full pl-1 pr-2 py-1"
                    >
                      {participant.avatar ? (
                        <img 
                          src={participant.avatar} 
                          alt={participant.name} 
                          className="w-6 h-6 rounded-full mr-1 object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-1">
                          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                            {participant.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300 mr-1">{participant.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add participant button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowParticipantSearch(!showParticipantSearch)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Users size={16} />
                  <span>Agregar participantes</span>
                  <ChevronDown size={16} className="ml-auto" />
                </button>

                {/* Enhanced participant search dropdown */}
                {showParticipantSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Buscar usuarios..."
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                        <Filter size={12} className="mr-1" />
                        Filtrar por:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={zoneFilter}
                          onChange={(e) => setZoneFilter(e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Todas las zonas</option>
                          {zones.map(zone => (
                            <option key={zone} value={zone}>{zone}</option>
                          ))}
                        </select>
                        
                        <select
                          value={areaFilter}
                          onChange={(e) => setAreaFilter(e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Todas las áreas</option>
                          {areas.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                        
                        <select
                          value={positionFilter}
                          onChange={(e) => setPositionFilter(e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Todos los puestos</option>
                          {positions.map(position => (
                            <option key={position} value={position}>{position}</option>
                          ))}
                        </select>
                      </div>
                      
                      {(zoneFilter || areaFilter || positionFilter) && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 mt-2"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto p-2">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <div 
                            key={user.id}
                            onClick={() => handleAddParticipant(user)}
                            className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                          >
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-8 h-8 rounded-full mr-3 object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-gray-900 dark:text-gray-100 font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.position && <span>{user.position}</span>}
                                {user.area && <span> • {user.area}</span>}
                                {user.zone && <span> • {user.zone}</span>}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No se encontraron usuarios con los filtros aplicados
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Priority, Status, and Recurrence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Completado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recurrencia
              </label>
              <select
                value={formData.recurrence || ''}
                onChange={(e) => handleInputChange('recurrence', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">No se repite</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensualmente</option>
                <option value="quarterly">Trimestralmente</option>
                <option value="yearly">Anualmente</option>
              </select>
            </div>
          </div>

          {/* Related Order */}
          {formData.type === 'task' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Orden de trabajo relacionada
              </label>
              <div className="flex items-center">
                <FileText className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
                <input
                  type="text"
                  value={formData.relatedOrder || ''}
                  onChange={(e) => handleInputChange('relatedOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ej: ORD-2025-001"
                />
              </div>
            </div>
          )}

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-10 h-10 rounded border-0 p-0 cursor-pointer"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Selecciona un color para el evento
              </span>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{event ? 'Actualizando...' : 'Creando...'}</span>
                </>
              ) : (
                <span>{event ? 'Actualizar evento' : 'Crear evento'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
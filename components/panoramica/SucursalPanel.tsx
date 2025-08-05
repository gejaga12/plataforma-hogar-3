'use client';

import { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  Calendar, 
  ExternalLink,
  Building,
  Home,
  BarChart2,
  Layers,
  AlertTriangle,
  FileText,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Sucursal } from '@/app/panoramica/page';
import { EquiposTabla } from './EquiposTabla';
import { SucursalDashboard } from './SucursalDashboard';
import { TagEstado } from '@/components/ui/TagEstado';
import { cn } from '@/utils/cn';

interface SucursalPanelProps {
  sucursal: Sucursal;
  onClose: () => void;
}

// Mock data para incidencias
interface Incidencia {
  id: string;
  titulo: string;
  fecha: string;
  tipo: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'ABIERTA' | 'EN_PROCESO' | 'RESUELTA' | 'CERRADA';
}

const mockIncidencias: Record<string, Incidencia[]> = {
  'suc-001': [
    {
      id: 'INC-001',
      titulo: 'Falla en sistema de climatización',
      fecha: '2024-05-15',
      tipo: 'ALTA',
      estado: 'RESUELTA'
    }
  ],
  'suc-003': [
    {
      id: 'INC-002',
      titulo: 'Corte de energía en sector A',
      fecha: '2024-06-01',
      tipo: 'CRITICA',
      estado: 'ABIERTA'
    },
    {
      id: 'INC-003',
      titulo: 'Fuga de agua en baño',
      fecha: '2024-05-20',
      tipo: 'MEDIA',
      estado: 'EN_PROCESO'
    }
  ],
  'suc-004': [
    {
      id: 'INC-004',
      titulo: 'Aire acondicionado no funciona',
      fecha: '2024-05-25',
      tipo: 'MEDIA',
      estado: 'RESUELTA'
    }
  ]
};

export function SucursalPanel({ sucursal, onClose }: SucursalPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'equipos' | 'dashboard'>('info');
  const [showMantenimientos, setShowMantenimientos] = useState(true);
  const [showIncidencias, setShowIncidencias] = useState(true);

  const handleOpenGoogleMaps = () => {
    const { lat, lng } = sucursal.coordenadas;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtener incidencias para esta sucursal
  const incidencias = mockIncidencias[sucursal.id] || [];

  // Función para obtener color según tipo de incidencia
  const getIncidenciaTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'CRITICA': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'ALTA': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'MEDIA': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'BAJA': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Función para obtener color según estado de incidencia
  const getIncidenciaStatusColor = (estado: string) => {
    switch (estado) {
      case 'ABIERTA': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'EN_PROCESO': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'RESUELTA': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'CERRADA': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {sucursal.tipo === 'hogar' ? (
              <Home className="text-blue-600 dark:text-blue-400" size={20} />
            ) : (
              <Building className="text-orange-600 dark:text-orange-400" size={20} />
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
              {sucursal.nombre}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <TagEstado 
            estado={sucursal.estado === 'activo' ? 'activo' : 'inactivo'} 
          />
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            sucursal.tipo === 'hogar' 
              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400" 
              : "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400"
          )}>
            {sucursal.tipo === 'hogar' ? 'Hogar' : 'Cliente'}
          </span>
          {sucursal.cliente && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
              {sucursal.cliente}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin size={16} className="mr-1 flex-shrink-0" />
          <span className="truncate">{sucursal.direccion}</span>
        </div>

        <button
          onClick={handleOpenGoogleMaps}
          className="mt-3 w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-1"
        >
          <ExternalLink size={14} />
          <span>Ver en Google Maps</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('info')}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === 'info'
              ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          Información
        </button>
        <button
          onClick={() => setActiveTab('equipos')}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === 'equipos'
              ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          Equipos
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === 'dashboard'
              ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          Dashboard
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Información de contacto */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Información de contacto</h3>
              
              {sucursal.telefono && (
                <div className="flex items-center text-sm">
                  <Phone size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{sucursal.telefono}</span>
                </div>
              )}
              
              {sucursal.email && (
                <div className="flex items-center text-sm">
                  <Mail size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{sucursal.email}</span>
                </div>
              )}
              
              {sucursal.horario && (
                <div className="flex items-center text-sm">
                  <Clock size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{sucursal.horario}</span>
                </div>
              )}
              
              {sucursal.responsable && (
                <div className="flex items-center text-sm">
                  <User size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{sucursal.responsable}</span>
                </div>
              )}
            </div>

            {/* Información de visitas */}
            {sucursal.tipo === 'cliente' && (
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Información de visitas</h3>
                
                <div className="flex items-center text-sm">
                  <Calendar size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Última visita: {formatDate(sucursal.ultimaVisita)}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Próxima visita: {formatDate(sucursal.proximaVisita)}
                  </span>
                </div>
              </div>
            )}

            {/* Resumen de equipos */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Resumen de equipos</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total equipos</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {sucursal.equipos?.length || 0}
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
                  <div className="text-xs text-green-600 dark:text-green-400">Equipos activos</div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                    {sucursal.equipos?.filter(e => e.estado === 'activo').length || 0}
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg">
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">En reparación</div>
                  <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                    {sucursal.equipos?.filter(e => e.estado === 'en_reparacion').length || 0}
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                  <div className="text-xs text-red-600 dark:text-red-400">Dados de baja</div>
                  <div className="text-lg font-semibold text-red-700 dark:text-red-300">
                    {sucursal.equipos?.filter(e => e.estado === 'dado_de_baja').length || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Últimos mantenimientos */}
            {sucursal.mantenimientos && sucursal.mantenimientos.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowMantenimientos(!showMantenimientos)}
                >
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Últimos mantenimientos</h3>
                  {showMantenimientos ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                
                {showMantenimientos && (
                  <div className="space-y-2">
                    {sucursal.mantenimientos.slice(0, 3).map(mantenimiento => (
                      <div 
                        key={mantenimiento.id} 
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {new Date(mantenimiento.fecha).toLocaleDateString('es-ES')}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            mantenimiento.tipo === 'preventivo' 
                              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400" 
                              : mantenimiento.tipo === 'correctivo'
                                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400"
                                : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          )}>
                            {mantenimiento.tipo.charAt(0).toUpperCase() + mantenimiento.tipo.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Técnico: {mantenimiento.tecnico}
                          </div>
                          <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            OT: {mantenimiento.id}
                          </div>
                        </div>
                        {mantenimiento.observaciones && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {mantenimiento.observaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Incidencias */}
            {incidencias.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowIncidencias(!showIncidencias)}
                >
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <AlertTriangle size={16} className="text-orange-500 mr-2" />
                    Incidencias ({incidencias.length})
                  </h3>
                  {showIncidencias ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                
                {showIncidencias && (
                  <div className="space-y-2">
                    {incidencias.map(incidencia => (
                      <div 
                        key={incidencia.id} 
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {incidencia.titulo}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(incidencia.fecha).toLocaleDateString('es-ES')}
                          </div>
                          <div className="flex space-x-1">
                            <span className={cn(
                              "px-1.5 py-0.5 text-xs font-medium rounded-full",
                              getIncidenciaTypeColor(incidencia.tipo)
                            )}>
                              {incidencia.tipo}
                            </span>
                            <span className={cn(
                              "px-1.5 py-0.5 text-xs font-medium rounded-full",
                              getIncidenciaStatusColor(incidencia.estado)
                            )}>
                              {incidencia.estado}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                          {incidencia.id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'equipos' && (
          <EquiposTabla equipos={sucursal.equipos || []} />
        )}

        {activeTab === 'dashboard' && (
          <SucursalDashboard 
            sucursal={sucursal} 
            mantenimientos={sucursal.mantenimientos || []} 
          />
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  Plus, 
  Filter, 
  Search, 
  Clock, 
  MapPin, 
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/utils/cn';

interface Incidencia {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'ABIERTA' | 'EN_PROCESO' | 'RESUELTA' | 'CERRADA';
  ubicacion: string;
  reportadoPor: string;
  asignadoA?: string;
  fechaCreacion: string;
  fechaResolucion?: string;
}

const mockIncidencias: Incidencia[] = [
  {
    id: '1',
    titulo: 'Corte de energía en Sector A',
    descripcion: 'Falla eléctrica general que afecta todo el sector A del edificio',
    tipo: 'CRITICA',
    estado: 'ABIERTA',
    ubicacion: 'Edificio Central - Sector A',
    reportadoPor: 'Juan Pérez',
    fechaCreacion: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    titulo: 'Fuga de agua en baño',
    descripcion: 'Pérdida de agua en el baño del 3er piso',
    tipo: 'ALTA',
    estado: 'EN_PROCESO',
    ubicacion: 'Piso 3 - Baño Principal',
    reportadoPor: 'María González',
    asignadoA: 'Carlos Rodríguez',
    fechaCreacion: '2024-01-15T10:15:00Z'
  },
  {
    id: '3',
    titulo: 'Aire acondicionado no funciona',
    descripcion: 'El sistema de climatización de la oficina 205 no responde',
    tipo: 'MEDIA',
    estado: 'RESUELTA',
    ubicacion: 'Oficina 205',
    reportadoPor: 'Ana López',
    asignadoA: 'Pedro Martín',
    fechaCreacion: '2024-01-14T16:45:00Z',
    fechaResolucion: '2024-01-15T09:30:00Z'
  }
];

const tipoConfig = {
  CRITICA: { label: 'Crítica', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  ALTA: { label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  MEDIA: { label: 'Media', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  BAJA: { label: 'Baja', color: 'bg-blue-100 text-blue-800', icon: AlertTriangle }
};

const estadoConfig = {
  ABIERTA: { label: 'Abierta', color: 'bg-red-100 text-red-800', icon: XCircle },
  EN_PROCESO: { label: 'En Proceso', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  RESUELTA: { label: 'Resuelta', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CERRADA: { label: 'Cerrada', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
};

function IncidenciasContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');

  const filteredIncidencias = mockIncidencias.filter(incidencia => {
    const matchesSearch = incidencia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incidencia.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !tipoFilter || incidencia.tipo === tipoFilter;
    const matchesEstado = !estadoFilter || incidencia.estado === estadoFilter;
    
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">❗ Incidencias</h1>
          <p className="text-gray-600 mt-1">
            Registro de eventos inesperados y problemas técnicos
          </p>
        </div>
        
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus size={20} />
          <span>Nueva Incidencia</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar incidencias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="CRITICA">Crítica</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>

            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="ABIERTA">Abierta</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTA">Resuelta</option>
              <option value="CERRADA">Cerrada</option>
            </select>

            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Incidencias List */}
      <div className="space-y-4">
        {filteredIncidencias.map((incidencia) => {
          const tipoInfo = tipoConfig[incidencia.tipo];
          const estadoInfo = estadoConfig[incidencia.estado];
          const TipoIcon = tipoInfo.icon;
          const EstadoIcon = estadoInfo.icon;

          return (
            <div key={incidencia.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {incidencia.titulo}
                    </h3>
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1', tipoInfo.color)}>
                      <TipoIcon size={12} />
                      <span>{tipoInfo.label}</span>
                    </span>
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1', estadoInfo.color)}>
                      <EstadoIcon size={12} />
                      <span>{estadoInfo.label}</span>
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    {incidencia.descripcion}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>{incidencia.ubicacion}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>Reportado por: {incidencia.reportadoPor}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{formatDate(incidencia.fechaCreacion)}</span>
                </div>
              </div>

              {incidencia.asignadoA && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>Asignado a: <strong>{incidencia.asignadoA}</strong></span>
                  </div>
                </div>
              )}

              {incidencia.fechaResolucion && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle size={16} />
                    <span>Resuelto el: {formatDate(incidencia.fechaResolucion)}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">ID: {incidencia.id}</span>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Ver detalles →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredIncidencias.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay incidencias</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || tipoFilter || estadoFilter 
              ? 'No se encontraron incidencias con los filtros aplicados.'
              : 'No hay incidencias registradas en este momento.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default function IncidenciasPage() {
  return (
    <ProtectedLayout>
      <IncidenciasContent />
    </ProtectedLayout>
  );
}
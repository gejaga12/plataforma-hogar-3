'use client';

import { useState } from 'react';
import { 
  User, 
  Building, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  PlayCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { ProcesoIngreso } from '@/utils/types';
import { cn } from '@/lib/utils';

interface IngresoDetailSidebarProps {
  proceso: ProcesoIngreso;
  onUpdateEstado: (estado: 'iniciado' | 'en_progreso' | 'completado' | 'detenido') => void;
}

export function IngresoDetailSidebar({ proceso, onUpdateEstado }: IngresoDetailSidebarProps) {
  const [showPasos, setShowPasos] = useState(true);

  const getEstadoConfig = (estado: string) => {
    const configs = {
      'iniciado': { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
        icon: PlayCircle,
        label: 'Iniciado'
      },
      'en_progreso': { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
        icon: Clock,
        label: 'En Progreso'
      },
      'completado': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
        icon: CheckCircle,
        label: 'Completado'
      },
      'detenido': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
        icon: XCircle,
        label: 'Detenido'
      }
    };
    return configs[estado as keyof typeof configs] || configs.iniciado;
  };

  const estadoConfig = getEstadoConfig(proceso.estadoGeneral);
  const EstadoIcon = estadoConfig.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calcular estadísticas
  const totalPasos = proceso.pasos.length;
  const pasosPendientes = proceso.pasos.filter(p => p.estado === 'pendiente').length;
  const pasosEnCurso = proceso.pasos.filter(p => p.estado === 'en_curso').length;
  const pasosBloqueados = proceso.pasos.filter(p => p.estado === 'bloqueado').length;
  const pasosCompletados = proceso.pasos.filter(p => p.estado === 'completo').length;
  const progreso = totalPasos > 0 ? Math.round((pasosCompletados / totalPasos) * 100) : 0;

  return (
    <div className="lg:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Información General */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información General
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <div className="flex items-center space-x-2">
              <span className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1',
                estadoConfig.color
              )}>
                <EstadoIcon size={16} />
                <span>{estadoConfig.label}</span>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ingresante
            </label>
            <div className="flex items-center space-x-2">
              <User size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-gray-100">{proceso.nombreIngresante}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Puesto
            </label>
            <span className="text-sm text-gray-900 dark:text-gray-100">{proceso.puesto}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área Destino
            </label>
            <div className="flex items-center space-x-2">
              <Building size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-gray-100">{proceso.areaDestino}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Estimada de Ingreso
            </label>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {formatDate(proceso.fechaEstimadaIngreso)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Progreso
        </h2>
        
        <div className="space-y-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-orange-600 h-2.5 rounded-full" 
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
            {progreso}% completado
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400">Pendientes</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pasosPendientes}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg">
              <div className="text-xs text-yellow-600 dark:text-yellow-400">En curso</div>
              <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">{pasosEnCurso}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
              <div className="text-xs text-red-600 dark:text-red-400">Bloqueados</div>
              <div className="text-lg font-semibold text-red-700 dark:text-red-300">{pasosBloqueados}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
              <div className="text-xs text-green-600 dark:text-green-400">Completados</div>
              <div className="text-lg font-semibold text-green-700 dark:text-green-300">{pasosCompletados}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pasos */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowPasos(!showPasos)}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pasos del Proceso
          </h2>
          {showPasos ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
        
        {showPasos && (
          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-2">
            {proceso.pasos.map((paso) => {
              const pasoEstadoConfig = getEstadoConfig(
                paso.estado === 'bloqueado' ? 'detenido' : 
                paso.estado === 'pendiente' ? 'iniciado' : 
                paso.estado
              );
              const PasoIcon = pasoEstadoConfig.icon;

              return (
                <div 
                  key={paso.id} 
                  className={cn(
                    'p-3 rounded-lg border text-sm',
                    paso.estado === 'completo' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' :
                    paso.estado === 'en_curso' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' :
                    paso.estado === 'bloqueado' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                    'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{paso.nombre}</span>
                    <span className={cn(
                      'p-1 rounded-full',
                      pasoEstadoConfig.color
                    )}>
                      <PasoIcon size={14} />
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {paso.area} • {paso.responsable}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Acciones
        </h2>
        
        <div className="space-y-3">
          <select
            value={proceso.estadoGeneral}
            onChange={(e) => onUpdateEstado(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="iniciado">Iniciado</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completado</option>
            <option value="detenido">Detenido</option>
          </select>

          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
            Finalizar Proceso
          </button>

          <button className="w-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-lg transition-colors">
            Detener Proceso
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  MessageSquare, 
  Paperclip,
  Building
} from 'lucide-react';
import { PasoIngreso, EstadoPaso } from '@/utils/types';
import { cn } from '@/utils/cn';

interface NodoPasoProps {
  data: PasoIngreso & {
    onEstadoCambio: (id: string, nuevoEstado: EstadoPaso) => void;
    onComentarioClick: (id: string) => void;
    onArchivoClick: (id: string) => void;
  };
  isConnectable: boolean;
}

const getEstadoConfig = (estado: EstadoPaso) => {
  const configs = {
    'pendiente': { 
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      icon: Clock,
      label: 'Pendiente'
    },
    'en_curso': { 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800',
      icon: Clock,
      label: 'En curso'
    },
    'bloqueado': { 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-300 dark:border-red-800',
      icon: AlertTriangle,
      label: 'Bloqueado'
    },
    'completo': { 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300 dark:border-green-800',
      icon: CheckCircle,
      label: 'Completo'
    }
  };
  return configs[estado];
};

const NodoPasoComponent = ({ data, isConnectable }: NodoPasoProps) => {
  const estadoConfig = getEstadoConfig(data.estado);
  const EstadoIcon = estadoConfig.icon;

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value as EstadoPaso;
    data.onEstadoCambio(data.id, nuevoEstado);
  };

  return (
    <div className={cn(
      'p-4 rounded-xl shadow-md border-2 w-64',
      estadoConfig.color,
      // Asegurar que el nodo esté por encima de las conexiones
      'relative z-10 bg-white dark:bg-gray-800'
    )}>
      {/* Handles para las conexiones */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500"
      />

      {/* Contenido del nodo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1',
            estadoConfig.color
          )}>
            <EstadoIcon size={12} />
            <span>{estadoConfig.label}</span>
          </span>
          <select
            value={data.estado}
            onChange={handleEstadoChange}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En curso</option>
            <option value="bloqueado">Bloqueado</option>
            <option value="completo">Completo</option>
          </select>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{data.nombre}</h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Building size={14} className="mr-1" />
            <span>{data.area}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <User size={14} className="mr-1" />
            <span>{data.responsable}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar size={14} className="mr-1" />
            <span>
              {new Date(data.fechaEstimada).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {data.observaciones && (
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded border border-gray-200 dark:border-gray-700">
            {data.observaciones}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button
            onClick={() => data.onComentarioClick(data.id)}
            className="p-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
            title="Agregar comentario"
          >
            <MessageSquare size={14} />
          </button>
          <button
            onClick={() => data.onArchivoClick(data.id)}
            className="p-1.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors"
            title="Adjuntar archivo"
          >
            <Paperclip size={14} />
          </button>
          {data.adjuntos && data.adjuntos.length > 0 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full">
              {data.adjuntos.length} {data.adjuntos.length === 1 ? 'archivo' : 'archivos'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const NodoPaso = memo(NodoPasoComponent);
NodoPaso.displayName = 'NodoPaso';
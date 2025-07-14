'use client';

import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagEstadoProps {
  estado: 'activo' | 'inactivo' | 'en_reparacion' | 'dado_de_baja';
  size?: 'sm' | 'md';
}

export function TagEstado({ estado, size = 'md' }: TagEstadoProps) {
  const getEstadoConfig = () => {
    switch (estado) {
      case 'activo':
        return {
          color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
          icon: CheckCircle
        };
      case 'en_reparacion':
        return {
          color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
          icon: AlertTriangle
        };
      case 'dado_de_baja':
      case 'inactivo':
        return {
          color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
          icon: XCircle
        };
      default:
        return {
          color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
          icon: CheckCircle
        };
    }
  };

  const { color, icon: Icon } = getEstadoConfig();
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs';

  const getLabel = () => {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'inactivo': return 'Inactivo';
      case 'en_reparacion': return 'En reparación';
      case 'dado_de_baja': return 'Dado de baja';
      default: return estado;
    }
  };

  return (
    <span className={cn(
      'font-medium rounded-full flex items-center space-x-1 w-fit',
      color,
      sizeClasses
    )}>
      <Icon size={size === 'sm' ? 10 : 12} />
      <span>{getLabel()}</span>
    </span>
  );
}
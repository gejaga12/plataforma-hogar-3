'use client';

import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Layers, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Mantenimiento, Sucursal } from '@/utils/types';

interface SucursalDashboardProps {
  sucursal: Sucursal;
  mantenimientos: Mantenimiento[];
}

export function SucursalDashboard({ sucursal, mantenimientos }: SucursalDashboardProps) {
  // Preparar datos para el gráfico de mantenimientos por mes
  const mantenimientosPorMes = useMemo(() => {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    // Inicializar contadores para cada mes
    const contadores = meses.map(mes => ({
      name: mes,
      preventivo: 0,
      correctivo: 0,
      instalacion: 0
    }));
    
    // Contar mantenimientos por mes y tipo
    mantenimientos.forEach(mantenimiento => {
      const fecha = new Date(mantenimiento.fecha);
      const mes = fecha.getMonth();
      
      contadores[mes][mantenimiento.tipo] += 1;
    });
    
    return contadores;
  }, [mantenimientos]);

  // Calcular estadísticas
  const totalEquipos = sucursal.equipos?.length || 0;
  const equiposActivos = sucursal.equipos?.filter(e => e.habilitado === 'ok').length || 0;
  const totalMantenimientos = mantenimientos.length;
  
  // Encontrar el último mantenimiento
  const ultimoMantenimiento = useMemo(() => {
    if (!mantenimientos.length) return null;
    
    return mantenimientos.reduce((latest, current) => {
      const latestDate = new Date(latest.fecha).getTime();
      const currentDate = new Date(current.fecha).getTime();
      return currentDate > latestDate ? current : latest;
    }, mantenimientos[0]);
  }, [mantenimientos]);

  // Colores para el gráfico
  const colors = {
    preventivo: '#3b82f6', // blue
    correctivo: '#f97316', // orange
    instalacion: '#10b981'  // green
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Layers className="text-gray-400 dark:text-gray-500" size={16} />
            <div className="text-xs text-gray-500 dark:text-gray-400">Total equipos</div>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {totalEquipos}
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500 dark:text-green-400" size={16} />
            <div className="text-xs text-green-600 dark:text-green-400">Equipos activos</div>
          </div>
          <div className="text-lg font-semibold text-green-700 dark:text-green-300 mt-1">
            {equiposActivos}
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="text-blue-500 dark:text-blue-400" size={16} />
            <div className="text-xs text-blue-600 dark:text-blue-400">Mantenimientos</div>
          </div>
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 mt-1">
            {totalMantenimientos}
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="text-orange-500 dark:text-orange-400" size={16} />
            <div className="text-xs text-orange-600 dark:text-orange-400">Último mantenimiento</div>
          </div>
          <div className="text-sm font-semibold text-orange-700 dark:text-orange-300 mt-1">
            {ultimoMantenimiento 
              ? new Date(ultimoMantenimiento.fecha).toLocaleDateString('es-ES')
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Gráfico de mantenimientos por mes */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Mantenimientos por mes
        </h3>
        
        <div className="h-64">
          {mantenimientos.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mantenimientosPorMes}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem'
                  }}
                />
                <Bar dataKey="preventivo" stackId="a" name="Preventivo" radius={[4, 4, 0, 0]}>
                  {mantenimientosPorMes.map((entry, index) => (
                    <Cell key={`cell-preventivo-${index}`} fill={colors.preventivo} />
                  ))}
                </Bar>
                <Bar dataKey="correctivo" stackId="a" name="Correctivo" radius={[4, 4, 0, 0]}>
                  {mantenimientosPorMes.map((entry, index) => (
                    <Cell key={`cell-correctivo-${index}`} fill={colors.correctivo} />
                  ))}
                </Bar>
                <Bar dataKey="instalacion" stackId="a" name="Instalación" radius={[4, 4, 0, 0]}>
                  {mantenimientosPorMes.map((entry, index) => (
                    <Cell key={`cell-instalacion-${index}`} fill={colors.instalacion} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <Calendar className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay datos de mantenimiento</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leyenda del gráfico */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Preventivo</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Correctivo</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Instalación</span>
        </div>
      </div>
    </div>
  );
}
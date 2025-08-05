'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, 
  Medal,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Filter,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  User,
  Calendar
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatsCard } from '@/components/dashboard/stats-card';
import { cn } from '@/utils/cn';


interface TecnicoRanking {
  id: string;
  nombreCompleto: string;
  avatar?: string;
  otFinalizadas: number;
  otPendientes: number;
  otEnProceso: number;
  valoracionPromedio: number;
  minutosTrabajos: number;
  promedioHoraIngreso: string;
  promedioHoraEgreso: string;
  zona: string;
}

interface RankingStats {
  tecnicosActivos: number;
  otFinalizadasTotales: number;
  valoracionGeneral: number;
  promedioMinutosTrabajados: number;
}

// Mock data
const mockTecnicos: TecnicoRanking[] = [
  {
    id: '1',
    nombreCompleto: 'Juan Carlos Pérez',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    otFinalizadas: 45,
    otPendientes: 3,
    otEnProceso: 2,
    valoracionPromedio: 4.8,
    minutosTrabajos: 12450,
    promedioHoraIngreso: '08:15',
    promedioHoraEgreso: '17:30',
    zona: 'ZONA NOA'
  },
  {
    id: '2',
    nombreCompleto: 'María González López',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    otFinalizadas: 38,
    otPendientes: 5,
    otEnProceso: 1,
    valoracionPromedio: 4.6,
    minutosTrabajos: 10890,
    promedioHoraIngreso: '08:30',
    promedioHoraEgreso: '17:15',
    zona: 'ZONA CENTRO'
  },
  {
    id: '3',
    nombreCompleto: 'Carlos Rodríguez',
    otFinalizadas: 42,
    otPendientes: 2,
    otEnProceso: 3,
    valoracionPromedio: 4.7,
    minutosTrabajos: 11760,
    promedioHoraIngreso: '08:00',
    promedioHoraEgreso: '17:45',
    zona: 'ZONA SUR'
  },
  {
    id: '4',
    nombreCompleto: 'Ana López Martínez',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    otFinalizadas: 35,
    otPendientes: 4,
    otEnProceso: 2,
    valoracionPromedio: 4.5,
    minutosTrabajos: 9870,
    promedioHoraIngreso: '08:45',
    promedioHoraEgreso: '17:00',
    zona: 'ZONA ESTE'
  },
  {
    id: '5',
    nombreCompleto: 'Pedro Martín Silva',
    otFinalizadas: 40,
    otPendientes: 1,
    otEnProceso: 4,
    valoracionPromedio: 4.9,
    minutosTrabajos: 11340,
    promedioHoraIngreso: '07:50',
    promedioHoraEgreso: '17:20',
    zona: 'ZONA OESTE'
  },
  {
    id: '6',
    nombreCompleto: 'Luis Fernando García',
    otFinalizadas: 28,
    otPendientes: 6,
    otEnProceso: 1,
    valoracionPromedio: 4.3,
    minutosTrabajos: 8520,
    promedioHoraIngreso: '09:00',
    promedioHoraEgreso: '16:45',
    zona: 'ZONA NOA'
  }
];

const mockStats: RankingStats = {
  tecnicosActivos: 6,
  otFinalizadasTotales: 228,
  valoracionGeneral: 4.6,
  promedioMinutosTrabajados: 10805
};

const fetchRankingData = async (): Promise<{ tecnicos: TecnicoRanking[], stats: RankingStats }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { tecnicos: mockTecnicos, stats: mockStats };
};

type SortField = 'nombreCompleto' | 'otFinalizadas' | 'valoracionPromedio' | 'minutosTrabajos' | 'promedioHoraIngreso';
type SortDirection = 'asc' | 'desc';

function RankingTecnicosContent() {
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('otFinalizadas');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['ranking-tecnicos', selectedTecnico, fechaDesde, fechaHasta],
    queryFn: fetchRankingData,
  });

  const filteredTecnicos = data?.tecnicos?.filter(tecnico => {
    if (selectedTecnico && tecnico.id !== selectedTecnico) return false;
    // Aquí se aplicarían los filtros de fecha en una implementación real
    return true;
  }) || [];

  const sortedTecnicos = [...filteredTecnicos].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'promedioHoraIngreso') {
      // Convert HH:mm to minutes for comparison
      const [aHour, aMin] = a.promedioHoraIngreso.split(':').map(Number);
      const [bHour, bMin] = b.promedioHoraIngreso.split(':').map(Number);
      aValue = aHour * 60 + aMin;
      bValue = bHour * 60 + bMin;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleApplyFilters = () => {
    // Aquí se aplicarían los filtros
    console.log('Aplicar filtros:', { selectedTecnico, fechaDesde, fechaHasta });
  };

  const handleResetFilters = () => {
    setSelectedTecnico('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const formatMinutesToHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={cn(
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            )}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Ranking de Técnicos</h1>
        <p className="text-gray-600 mt-1">
          Métricas promedio por técnico
        </p>
      </div>

      {/* Resumen Global */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Técnicos Activos"
            value={data.stats.tecnicosActivos}
            icon={User}
            color="blue"
          />
          <StatsCard
            title="OT Finalizadas Totales"
            value={data.stats.otFinalizadasTotales}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Valoración General"
            value={`${data.stats.valoracionGeneral.toFixed(1)}/5`}
            icon={Star}
            color="orange"
          />
          <StatsCard
            title="Prom. Minutos Trabajados"
            value={formatMinutesToHours(data.stats.promedioMinutosTrabajados)}
            icon={Clock}
            color="red"
          />
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Técnico
            </label>
            <select
              value={selectedTecnico}
              onChange={(e) => setSelectedTecnico(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los técnicos</option>
              {data?.tecnicos.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.id}>
                  {tecnico.nombreCompleto}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleApplyFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Filter size={16} />
              <span>Aplicar</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Ranking */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="nombreCompleto">Técnico</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="otFinalizadas">OT Finalizadas</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OT Pendientes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OT En Proceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="valoracionPromedio">Valoración Promedio</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="minutosTrabajos">Minutos Trabajados</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="promedioHoraIngreso">Prom. Hora Ingreso</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prom. Hora Egreso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTecnicos.map((tecnico, index) => (
                <tr 
                  key={tecnico.id} 
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    index % 2 === 1 && 'bg-gray-25'
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {tecnico.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={tecnico.avatar}
                            alt={tecnico.nombreCompleto}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {tecnico.nombreCompleto.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tecnico.nombreCompleto}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tecnico.zona}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Trophy className="text-green-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-900">
                        {tecnico.otFinalizadas}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      {tecnico.otPendientes}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {tecnico.otEnProceso}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(tecnico.valoracionPromedio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatMinutesToHours(tecnico.minutosTrabajos)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tecnico.minutosTrabajos.toLocaleString()} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="text-gray-400 mr-1" size={14} />
                      <span className="text-sm text-gray-900">
                        {tecnico.promedioHoraIngreso}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="text-gray-400 mr-1" size={14} />
                      <span className="text-sm text-gray-900">
                        {tecnico.promedioHoraEgreso}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedTecnicos.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron técnicos con los filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {sortedTecnicos.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{sortedTecnicos.length}</span> técnicos
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Página 1 de 1</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RankingTecnicosPage() {
  return (
    <ProtectedLayout>
      <RankingTecnicosContent />
    </ProtectedLayout>
  );
}
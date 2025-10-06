import { useAuth } from "@/hooks/useAuth";
import { DashboardStats, Novedad } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "./dashboard-header";
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Clock,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { StatsCard } from "./stats-card";
import { NovedadesService } from "@/utils/api/apiNovedades";

// Mock function - replace with actual API call
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    totalOrders: 156,
    pendingOrders: 23,
    completedOrders: 118,
    urgentOrders: 8,
    myOrders: 15,
    completionRate: 85,
  };
};

export function DashboardContent() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.[0].name === "admin";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  // Fetch novedades
  const limit = 3;
  const offset = 0;

  const {
    data: novedades = [],
    isLoading: isLoadingNovedades,
  } = useQuery({
    queryKey: ["novedades", { limit, offset, isAdmin }],
    queryFn: () => NovedadesService.obtenerNovedades(limit, offset, isAdmin),
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section with Novedades */}
      <DashboardHeader
        nombreUsuario={user?.fullName || user?.email || "Usuario"}
        panelTitle="Panel de Control Técnico"
        icon={<Wrench size={16} />}
        novedades={novedades}
        loadingNovedades={isLoadingNovedades}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total de Órdenes"
          value={stats?.totalOrders || 0}
          change="+12% vs mes anterior"
          changeType="positive"
          icon={ClipboardList}
          color="orange"
          loading={isLoading}
        />

        <StatsCard
          title="Órdenes Pendientes"
          value={stats?.pendingOrders || 0}
          change="-5% vs semana anterior"
          changeType="positive"
          icon={Clock}
          color="blue"
          loading={isLoading}
        />

        <StatsCard
          title="Órdenes Completadas"
          value={stats?.completedOrders || 0}
          change="+18% vs mes anterior"
          changeType="positive"
          icon={CheckCircle}
          color="green"
          loading={isLoading}
        />

        <StatsCard
          title="Órdenes Urgentes"
          value={stats?.urgentOrders || 0}
          change="3 nuevas hoy"
          changeType="negative"
          icon={AlertTriangle}
          color="red"
          loading={isLoading}
        />

        <StatsCard
          title="Mis Órdenes"
          value={stats?.myOrders || 0}
          change="2 nuevas asignadas"
          changeType="neutral"
          icon={ClipboardList}
          color="orange"
          loading={isLoading}
        />

        <StatsCard
          title="Tasa de Completado"
          value={`${stats?.completionRate || 0}%`}
          change="+3% vs mes anterior"
          changeType="positive"
          icon={TrendingUp}
          color="green"
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <ClipboardList className="text-orange-500 mb-2" size={24} />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Ver Órdenes Pendientes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Revisar órdenes que requieren atención
            </p>
          </button>

          <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <AlertTriangle className="text-red-500 mb-2" size={24} />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Órdenes Urgentes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Atender órdenes de alta prioridad
            </p>
          </button>

          <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <TrendingUp className="text-green-500 mb-2" size={24} />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Ver Reportes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analizar métricas de rendimiento
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

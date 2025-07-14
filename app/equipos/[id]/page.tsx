'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  QrCode,
  Download,
  Edit,
  Calendar,
  MapPin,
  Building,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EquipoQR } from '@/components/equipos/equipo-qr';
import { EquipoUbicacion } from '@/components/equipos/equipo-ubicacion';
import { cn } from '@/lib/utils';

interface Equipo {
  id: string;
  nombre: string;
  tipo: string;
  cliente: string;
  zona: string;
  ubicacionExacta: string;
  fechaInstalacion: string;
  vidaUtilAnios: number;
  ultimoMantenimiento: string;
  estado: 'Identificado' | 'No identificado';
  camposTecnicos: Record<string, any>;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

interface MantenimientoHistorial {
  id: string;
  fecha: string;
  tipo: 'Preventivo' | 'Correctivo' | 'Emergencia';
  tecnico: string;
  descripcion: string;
  estado: 'Completado' | 'Pendiente' | 'En proceso';
  observaciones?: string;
}

interface RutinaPendiente {
  id: string;
  nombre: string;
  tipo: 'Mantenimiento' | 'Inspección' | 'Limpieza';
  fechaProgramada: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  descripcion: string;
}

// Mock data
const mockEquipo: Equipo = {
  id: 'EQ-001',
  nombre: 'Aire Acondicionado Central - Oficina Principal',
  tipo: 'Aire Acondicionado',
  cliente: 'Empresa ABC S.A.',
  zona: 'CABA - Centro',
  ubicacionExacta: 'Piso 3, Oficina Principal, Sector Norte - Techo suspendido sobre escritorios',
  fechaInstalacion: '2022-03-15',
  vidaUtilAnios: 10,
  ultimoMantenimiento: '2024-11-15',
  estado: 'Identificado',
  camposTecnicos: {
    marca: 'Samsung',
    modelo: 'AR24TXHQASINXEU',
    potencia: '24000 BTU',
    refrigerante: 'R32',
    voltaje: '220V',
    amperaje: '12A',
    peso: '45 kg',
    dimensiones: '1200x400x300 mm'
  },
  qrCode: 'QR-EQ-001',
  createdAt: '2022-03-15T10:00:00Z',
  updatedAt: '2024-11-15T14:30:00Z'
};

const mockHistorialMantenimiento: MantenimientoHistorial[] = [
  {
    id: 'MNT-001',
    fecha: '2024-11-15',
    tipo: 'Preventivo',
    tecnico: 'Juan Carlos Pérez',
    descripcion: 'Limpieza de filtros y revisión general del sistema',
    estado: 'Completado',
    observaciones: 'Equipo en buen estado, se recomienda cambio de filtros en 3 meses'
  },
  {
    id: 'MNT-002',
    fecha: '2024-08-20',
    tipo: 'Correctivo',
    tecnico: 'María González',
    descripcion: 'Reparación de sensor de temperatura',
    estado: 'Completado',
    observaciones: 'Sensor reemplazado, sistema funcionando correctamente'
  },
  {
    id: 'MNT-003',
    fecha: '2024-05-10',
    tipo: 'Preventivo',
    tecnico: 'Carlos Rodríguez',
    descripcion: 'Mantenimiento trimestral programado',
    estado: 'Completado',
    observaciones: 'Revisión completa, limpieza de serpentines'
  },
  {
    id: 'MNT-004',
    fecha: '2024-02-15',
    tipo: 'Emergencia',
    tecnico: 'Ana López',
    descripcion: 'Fuga de refrigerante detectada',
    estado: 'Completado',
    observaciones: 'Fuga reparada, sistema recargado con refrigerante'
  }
];

const mockRutinasPendientes: RutinaPendiente[] = [
  {
    id: 'RUT-001',
    nombre: 'Mantenimiento Trimestral',
    tipo: 'Mantenimiento',
    fechaProgramada: '2025-02-15',
    prioridad: 'Media',
    descripcion: 'Limpieza de filtros, revisión de conexiones eléctricas y verificación de niveles de refrigerante'
  },
  {
    id: 'RUT-002',
    nombre: 'Inspección de Seguridad',
    tipo: 'Inspección',
    fechaProgramada: '2025-01-20',
    prioridad: 'Alta',
    descripcion: 'Verificación de sistemas de seguridad y protecciones eléctricas'
  }
];

function EquipoDetalleContent() {
  const params = useParams();
  const router = useRouter();
  const equipoId = params.id as string;
  
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [historialMantenimiento, setHistorialMantenimiento] = useState<MantenimientoHistorial[]>([]);
  const [rutinasPendientes, setRutinasPendientes] = useState<RutinaPendiente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const loadEquipoData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // En una implementación real, aquí harías la llamada a la API
        setEquipo(mockEquipo);
        setHistorialMantenimiento(mockHistorialMantenimiento);
        setRutinasPendientes(mockRutinasPendientes);
      } catch (error) {
        console.error('Error loading equipo data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEquipoData();
  }, [equipoId]);

  const handleEdit = () => {
    router.push(`/equipos?edit=${equipoId}`);
  };

  const handleDownloadQR = () => {
    console.log(`Descargando QR para equipo: ${equipo?.nombre}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEstadoColor = (estado: string) => {
    return estado === 'Identificado' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const getTipoMantenimientoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'Preventivo': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Correctivo': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Emergencia': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getEstadoMantenimientoColor = (estado: string) => {
    const colors: Record<string, string> = {
      'Completado': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'En proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors: Record<string, string> = {
      'Alta': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'Media': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Baja': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando información del equipo...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!equipo) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Equipo no encontrado</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">El equipo solicitado no existe.</p>
          <button
            onClick={() => router.push('/equipos')}
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Volver a Equipos
          </button>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/equipos')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {equipo.nombre}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {equipo.tipo} - {equipo.cliente}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowQRModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <QrCode size={20} />
              <span>Ver QR</span>
            </button>
            <button
              onClick={handleDownloadQR}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download size={20} />
              <span>Descargar QR</span>
            </button>
            <button
              onClick={handleEdit}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit size={20} />
              <span>Editar</span>
            </button>
          </div>
        </div>

        {/* Información General */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Equipo
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{equipo.tipo}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{equipo.cliente}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getEstadoColor(equipo.estado)
                )}>
                  {equipo.estado}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Instalación
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(equipo.fechaInstalacion)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vida Útil Estimada
                </label>
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-900 dark:text-gray-100">{equipo.vidaUtilAnios} años</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Último Mantenimiento
                </label>
                <div className="flex items-center space-x-2">
                  <Wrench size={16} className="text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(equipo.ultimoMantenimiento)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <EquipoUbicacion zona={equipo.zona} ubicacion={equipo.ubicacionExacta} />
            </div>
          </div>
        </div>

        {/* Datos Técnicos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Datos Técnicos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(equipo.camposTecnicos).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historial de Mantenimiento */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Wrench className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historial de Mantenimiento</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {historialMantenimiento.map((mantenimiento) => (
                  <tr key={mantenimiento.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(mantenimiento.fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getTipoMantenimientoColor(mantenimiento.tipo)
                      )}>
                        {mantenimiento.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {mantenimiento.tecnico}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="max-w-48 truncate" title={mantenimiento.descripcion}>
                        {mantenimiento.descripcion}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getEstadoMantenimientoColor(mantenimiento.estado)
                      )}>
                        {mantenimiento.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="max-w-48 truncate" title={mantenimiento.observaciones}>
                        {mantenimiento.observaciones || '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rutinas Pendientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Rutinas Pendientes</h2>
          </div>
          
          <div className="space-y-4">
            {rutinasPendientes.map((rutina) => (
              <div key={rutina.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{rutina.nombre}</h3>
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getPrioridadColor(rutina.prioridad)
                      )}>
                        {rutina.prioridad}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rutina.descripcion}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Tipo: {rutina.tipo}</span>
                      <span>Programado: {formatDate(rutina.fechaProgramada)}</span>
                    </div>
                  </div>
                  <button className="ml-4 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors">
                    Programar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal QR */}
        {showQRModal && (
          <EquipoQR
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            equipo={equipo}
          />
        )}
      </div>
    </ProtectedLayout>
  );
}

export default function EquipoDetallePage() {
  return <EquipoDetalleContent />;
}
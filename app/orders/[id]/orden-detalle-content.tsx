'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { 
  Download,
  Save,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Clock,
  User,
  Building,
  FileText,
  Camera,
  Edit,
  Plus,
  X
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { OrderInfoSection } from '@/components/order-detail/order-info-section';
import { OrderMapsSection } from '@/components/order-detail/order-maps-section';
import { OrderStatusSection } from '@/components/order-detail/order-status-section';
import { OrderWorkTimeSection } from '@/components/order-detail/order-work-time-section';
import { OrderFormSection } from '@/components/order-detail/order-form-section';


interface OrdenDetalle {
  id: string;
  usuario: string;
  formulario: string;
  orden: string;
  sucursal: string;
  cliente: string;
  comentario: string | null;
  sucursalCliente: string;
  facility: string;
  estado: 'Pendiente' | 'En proceso' | 'Finalizado' | 'Cancelado';
  horaInicio: string | null;
  horaFin: string | null;
  fechaCompleta: string;
  postergarPor: string | null;
  creado: string;
  firma: string | null;
  firmaResponsable: string | null;
  ultimaEdicionFormulario: string | null;
  imageSolucioname: string | null;
  ubicacionRecibido: {
    latitud: number;
    longitud: number;
    direccion: string;
  } | null;
  ubicacionCierre: {
    latitud: number;
    longitud: number;
    direccion: string;
  } | null;
  calificacion: 'positiva' | 'negativa' | null;
  modulos: ModuloFormulario[];
}

interface ModuloFormulario {
  id: string;
  pagina: number;
  nombre: string;
  orden: number;
  campos: CampoFormulario[];
}

interface CampoFormulario {
  id: string;
  nombre: string;
  titulo: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'fecha_hora' | 'casilla_verificacion' | 'desplegable' | 'foto';
  valor: any;
  requerido: boolean;
  tareaTecnico: string;
  vistaInforme: string;
  fotos?: string[];
}

// Mock data
const mockOrdenDetalle: OrdenDetalle = {
  id: 'ORD-001',
  usuario: 'Juan Carlos Pérez',
  formulario: 'BSR-2021-SEMESTRAL',
  orden: 'OT-2025-001',
  sucursal: 'ZONA NOA',
  cliente: 'Empresa Constructora San Miguel S.A.',
  comentario: 'Revisión completa del sistema eléctrico y HVAC',
  sucursalCliente: 'Av. Libertador 1234, CABA || Ruta 9 Km 45',
  facility: 'Carlos Mendoza',
  estado: 'En proceso',
  horaInicio: '08:30',
  horaFin: null,
  fechaCompleta: '09/06/2025 08:30 - En curso',
  postergarPor: null,
  creado: '08/06/2025 14:33',
  firma: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  firmaResponsable: 'Juan Carlos Pérez',
  ultimaEdicionFormulario: '09/06/2025 10:15',
  imageSolucioname: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  ubicacionRecibido: {
    latitud: -34.6037,
    longitud: -58.3816,
    direccion: 'Av. Libertador 1234, CABA'
  },
  ubicacionCierre: null,
  calificacion: null,
  modulos: [
    {
      id: 'mod-1',
      pagina: 1,
      nombre: 'Revisión Inicial',
      orden: 1,
      campos: [
        {
          id: 'campo-1',
          nombre: 'existe_aire_acondicionado',
          titulo: '¿Existe aire acondicionado?',
          tipo: 'casilla_verificacion',
          valor: true,
          requerido: true,
          tareaTecnico: 'Verifica si hay aire acondicionado instalado',
          vistaInforme: 'Aire acondicionado presente'
        },
        {
          id: 'campo-2',
          nombre: 'marca_aire_acondicionado',
          titulo: 'Marca del aire acondicionado',
          tipo: 'texto',
          valor: 'Samsung',
          requerido: true,
          tareaTecnico: 'Identifica la marca del equipo',
          vistaInforme: 'Marca del equipo'
        },
        {
          id: 'campo-3',
          nombre: 'estado_equipo',
          titulo: 'Estado del Equipo',
          tipo: 'desplegable',
          valor: 'Funcionando',
          requerido: true,
          tareaTecnico: 'Evalúa el estado actual del equipo',
          vistaInforme: 'Estado del equipo'
        }
      ]
    },
    {
      id: 'mod-2',
      pagina: 1,
      nombre: 'Documentación Fotográfica',
      orden: 2,
      campos: [
        {
          id: 'campo-4',
          nombre: 'foto_evidencia',
          titulo: 'Foto de Evidencia',
          tipo: 'foto',
          valor: null,
          requerido: true,
          tareaTecnico: 'Toma una foto del equipo',
          vistaInforme: 'Evidencia fotográfica',
          fotos: [
            'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
            'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
          ]
        }
      ]
    },
    {
      id: 'mod-3',
      pagina: 2,
      nombre: 'Mantenimiento Preventivo',
      orden: 1,
      campos: [
        {
          id: 'campo-5',
          nombre: 'fecha_mantenimiento',
          titulo: 'Fecha de Próximo Mantenimiento',
          tipo: 'fecha',
          valor: '2025-09-15',
          requerido: false,
          tareaTecnico: 'Programa la próxima fecha de mantenimiento',
          vistaInforme: 'Próximo mantenimiento'
        },
        {
          id: 'campo-6',
          nombre: 'observaciones_tecnico',
          titulo: 'Observaciones del Técnico',
          tipo: 'texto',
          valor: 'Equipo en buen estado, se recomienda limpieza de filtros',
          requerido: false,
          tareaTecnico: 'Anota observaciones importantes',
          vistaInforme: 'Observaciones técnicas'
        }
      ]
    }
  ]
};

const fetchOrdenDetalle = async (id: string): Promise<OrdenDetalle> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockOrdenDetalle;
};

const updateOrdenEstado = async (id: string, estado: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

const updateOrdenTiempo = async (id: string, data: any): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

const calificarOrden = async (id: string, calificacion: 'positiva' | 'negativa'): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

export function OrdenDetalleContent() {
  const params = useParams();
  const queryClient = useQueryClient();
  const ordenId = params.id as string;

  const { data: orden, isLoading } = useQuery({
    queryKey: ['orden-detalle', ordenId],
    queryFn: () => fetchOrdenDetalle(ordenId),
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ estado }: { estado: string }) => updateOrdenEstado(ordenId, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orden-detalle', ordenId] });
    }
  });

  const updateTiempoMutation = useMutation({
    mutationFn: (data: any) => updateOrdenTiempo(ordenId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orden-detalle', ordenId] });
    }
  });

  const calificarMutation = useMutation({
    mutationFn: (calificacion: 'positiva' | 'negativa') => calificarOrden(ordenId, calificacion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orden-detalle', ordenId] });
    }
  });

  const handleExport = () => {
    console.log('Exportar orden:', ordenId);
  };

  const handleFinalizarEdicion = () => {
    console.log('Finalizar edición de formulario');
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Cargando orden de trabajo...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!orden) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Orden no encontrada</h3>
          <p className="mt-1 text-gray-500">La orden de trabajo solicitada no existe.</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Orden de Trabajo (#{orden.id})
            </h1>
            <p className="text-gray-600 mt-1">
              {orden.formulario} - {orden.cliente}
            </p>
          </div>
          
          <button 
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download size={20} />
            <span>Exportar</span>
          </button>
        </div>

        {/* Información General */}
        <OrderInfoSection orden={orden} />

        {/* Mapas */}
        <OrderMapsSection 
          ubicacionRecibido={orden.ubicacionRecibido}
          ubicacionCierre={orden.ubicacionCierre}
        />

        {/* Estado y Calificación */}
        <OrderStatusSection 
          orden={orden}
          onUpdateEstado={(estado) => updateEstadoMutation.mutate({ estado })}
          onCalificar={(calificacion) => calificarMutation.mutate(calificacion)}
          isLoading={updateEstadoMutation.isPending || calificarMutation.isPending}
        />

        {/* Fecha y Hora de Trabajo */}
        <OrderWorkTimeSection 
          orden={orden}
          onUpdateTiempo={(data) => updateTiempoMutation.mutate(data)}
          isLoading={updateTiempoMutation.isPending}
        />

        {/* Formulario */}
        <OrderFormSection modulos={orden.modulos} />

        {/* Botón Final */}
        <div className="flex justify-center pt-6">
          <button
            onClick={handleFinalizarEdicion}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors text-lg font-medium"
          >
            <Save size={24} />
            <span>Finalizar edición de formulario</span>
          </button>
        </div>
      </div>
    </ProtectedLayout>
  );
}
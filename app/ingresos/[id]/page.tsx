'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Save,
  UserPlus,
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
import { IngresoFlow } from '@/components/ingresos/ingreso-flow';
import { IngresoDetailSidebar } from '@/components/ingresos/ingreso-detail-sidebar';
import { ProcesoIngreso, PasoIngreso, EstadoPaso, Archivo } from '@/lib/types';
import { cn } from '@/lib/utils';

// Mock data para un proceso de ingreso completo
const mockProcesosDetalle: Record<string, ProcesoIngreso> = {
  'ING-001': {
    id: 'ING-001',
    nombreIngresante: 'Ana María González',
    puesto: 'Desarrolladora Frontend',
    areaDestino: 'IT',
    fechaEstimadaIngreso: '2025-01-20',
    estadoGeneral: 'en_progreso',
    pasos: [
      {
        id: 'paso-1',
        nombre: 'Solicitud de ingreso',
        area: 'Recursos Humanos',
        estado: 'completo',
        responsable: 'María Fernanda López',
        fechaEstimada: '2025-01-10',
        fechaReal: '2025-01-10',
        observaciones: 'Solicitud aprobada por el gerente de área',
        adjuntos: [
          {
            id: 'adj-1',
            nombre: 'solicitud_aprobada.pdf',
            url: 'https://example.com/solicitud_aprobada.pdf',
            tipo: 'application/pdf',
            tamaño: 1024000,
            fechaSubida: '2025-01-10T15:30:00Z'
          }
        ],
        posicion: { x: 250, y: 50 }
      },
      {
        id: 'paso-2',
        nombre: 'Entrevista técnica',
        area: 'IT',
        estado: 'completo',
        responsable: 'Carlos Rodríguez',
        fechaEstimada: '2025-01-12',
        fechaReal: '2025-01-12',
        observaciones: 'Candidata con excelentes conocimientos en React y TypeScript',
        adjuntos: [
          {
            id: 'adj-2',
            nombre: 'evaluacion_tecnica.pdf',
            url: 'https://example.com/evaluacion_tecnica.pdf',
            tipo: 'application/pdf',
            tamaño: 512000,
            fechaSubida: '2025-01-12T16:45:00Z'
          }
        ],
        dependeDe: ['paso-1'],
        posicion: { x: 250, y: 150 }
      },
      {
        id: 'paso-3',
        nombre: 'Oferta laboral',
        area: 'Recursos Humanos',
        estado: 'completo',
        responsable: 'María Fernanda López',
        fechaEstimada: '2025-01-14',
        fechaReal: '2025-01-14',
        observaciones: 'Oferta aceptada por la candidata',
        adjuntos: [
          {
            id: 'adj-3',
            nombre: 'oferta_firmada.pdf',
            url: 'https://example.com/oferta_firmada.pdf',
            tipo: 'application/pdf',
            tamaño: 768000,
            fechaSubida: '2025-01-14T11:20:00Z'
          }
        ],
        dependeDe: ['paso-2'],
        posicion: { x: 250, y: 250 }
      },
      {
        id: 'paso-4',
        nombre: 'Examen médico',
        area: 'Higiene y Seguridad',
        estado: 'en_curso',
        responsable: 'Pedro Martínez',
        fechaEstimada: '2025-01-16',
        observaciones: 'Programado para el 16/01/2025 a las 10:00',
        dependeDe: ['paso-3'],
        posicion: { x: 250, y: 350 }
      },
      {
        id: 'paso-5',
        nombre: 'Preparación de puesto de trabajo',
        area: 'IT',
        estado: 'en_curso',
        responsable: 'Carlos Rodríguez',
        fechaEstimada: '2025-01-18',
        observaciones: 'Solicitada laptop y accesos a sistemas',
        dependeDe: ['paso-3'],
        posicion: { x: 450, y: 350 }
      },
      {
        id: 'paso-6',
        nombre: 'Inducción',
        area: 'Recursos Humanos',
        estado: 'pendiente',
        responsable: 'María Fernanda López',
        fechaEstimada: '2025-01-20',
        dependeDe: ['paso-4', 'paso-5'],
        posicion: { x: 350, y: 450 }
      },
      {
        id: 'paso-7',
        nombre: 'Asignación de activos',
        area: 'Gestión de Activos',
        estado: 'bloqueado',
        responsable: 'Javier Gómez',
        fechaEstimada: '2025-01-20',
        dependeDe: ['paso-5'],
        posicion: { x: 350, y: 550 }
      }
    ],
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z'
  }
};

// Función para obtener un proceso por ID
const fetchProcesoById = async (id: string): Promise<ProcesoIngreso> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const proceso = mockProcesosDetalle[id];
  if (!proceso) {
    throw new Error('Proceso no encontrado');
  }
  return proceso;
};

// Función para actualizar un paso
const updatePaso = async (procesoId: string, pasoId: string, data: Partial<PasoIngreso>): Promise<PasoIngreso> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // En una implementación real, aquí se haría la llamada a la API
  return data as PasoIngreso;
};

// Función para agregar un comentario
const addComentario = async (procesoId: string, pasoId: string, comentario: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // En una implementación real, aquí se haría la llamada a la API
};

// Función para subir un archivo
const uploadArchivo = async (procesoId: string, pasoId: string, file: File): Promise<Archivo> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Simulación de subida de archivo
  const newArchivo: Archivo = {
    id: `adj-${Date.now()}`,
    nombre: file.name,
    url: URL.createObjectURL(file),
    tipo: file.type,
    tamaño: file.size,
    fechaSubida: new Date().toISOString()
  };
  return newArchivo;
};

function IngresoDetalleContent() {
  const params = useParams();
  const router = useRouter();
  const procesoId = params.id as string;
  const queryClient = useQueryClient();

  const { data: proceso, isLoading, error } = useQuery({
    queryKey: ['proceso-ingreso', procesoId],
    queryFn: () => fetchProcesoById(procesoId),
  });

  const updatePasoMutation = useMutation({
    mutationFn: ({ pasoId, data }: { pasoId: string; data: Partial<PasoIngreso> }) => 
      updatePaso(procesoId, pasoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proceso-ingreso', procesoId] });
    }
  });

  const addComentarioMutation = useMutation({
    mutationFn: ({ pasoId, comentario }: { pasoId: string; comentario: string }) => 
      addComentario(procesoId, pasoId, comentario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proceso-ingreso', procesoId] });
    }
  });

  const uploadArchivoMutation = useMutation({
    mutationFn: ({ pasoId, file }: { pasoId: string; file: File }) => 
      uploadArchivo(procesoId, pasoId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proceso-ingreso', procesoId] });
    }
  });

  const handleEstadoCambio = (pasoId: string, nuevoEstado: EstadoPaso) => {
    updatePasoMutation.mutate({ 
      pasoId, 
      data: { estado: nuevoEstado } 
    });
  };

  const handleComentario = (pasoId: string, comentario: string) => {
    addComentarioMutation.mutate({ pasoId, comentario });
  };

  const handleUploadArchivo = (pasoId: string, file: File) => {
    uploadArchivoMutation.mutate({ pasoId, file });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando proceso de ingreso...</p>
        </div>
      </div>
    );
  }

  if (error || !proceso) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Error al cargar el proceso</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          No se pudo cargar el proceso de ingreso solicitado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a 
            href="/ingresos" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {proceso.nombreIngresante}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {proceso.puesto} - {proceso.areaDestino}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Save size={20} />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Main Content with Flow and Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[600px]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Flujo de Proceso
          </h2>
          
          <IngresoFlow
            pasos={proceso.pasos}
            onEstadoCambio={handleEstadoCambio}
            onComentario={handleComentario}
            onUploadArchivo={handleUploadArchivo}
          />
        </div>

        <IngresoDetailSidebar 
          proceso={proceso}
          onUpdateEstado={(estado) => {
            console.log('Actualizando estado general a:', estado);
            // Aquí iría la mutación para actualizar el estado general
          }}
        />
      </div>
    </div>
  );
}

export default function IngresoDetallePage() {
  return (
    <ProtectedLayout>
      <IngresoDetalleContent />
    </ProtectedLayout>
  );
}
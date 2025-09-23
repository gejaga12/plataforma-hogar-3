"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Save } from "lucide-react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderInfoSection } from "@/components/order-detail/order-info-section";
import { OrderMapsSection } from "@/components/order-detail/order-maps-section";
import { OrderStatusSection } from "@/components/order-detail/order-status-section";
import { OrderWorkTimeSection } from "@/components/order-detail/order-work-time-section";
import {
  CampoFormulario,
  OrderFormSection,
} from "@/components/order-detail/order-form-section";
import { OTService } from "@/api/apiOTs";

export function OrdenDetalleContent() {
  const params = useParams();
  const queryClient = useQueryClient();
  const ordenId = params.id as string;

  const router = useRouter();

  const {
    data: orden,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orden-detalle", ordenId],
    queryFn: () => OTService.obtenerOTDetalleMDA(Number(ordenId)),
    enabled: !!ordenId,
  });

  console.log('orden:', orden);

  const updateEstadoMutation = useMutation({
    mutationFn: async ({ estado }: { estado: string }) => {
      // TODO: conectar con tu endpoint de updateEstado
      console.log("Actualizar estado:", estado);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orden-detalle", ordenId] });
    },
  });

  const updateTiempoMutation = useMutation({
    mutationFn: async (data: any) => {
      // TODO: conectar con tu endpoint de updateTiempo
      console.log("Actualizar tiempo:", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orden-detalle", ordenId] });
    },
  });

  const calificarMutation = useMutation({
    mutationFn: async (calificacion: "positiva" | "negativa") => {
      // TODO: conectar con tu endpoint de calificación
      console.log("Calificar orden:", calificacion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orden-detalle", ordenId] });
    },
  });

  const handleExport = () => {
    console.log("Exportar orden:", ordenId);
  };

  const handleFinalizarEdicion = () => {
    console.log("Finalizar edición de formulario");
  };

  const handleRedirection = () => {
    router.replace("/orders");
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

  if (error) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600">Error</h3>
          <p className="mt-1 text-gray-500">{(error as Error).message}</p>
        </div>
      </ProtectedLayout>
    );
  }

  if (!orden) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            Orden no encontrada
          </h3>
          <p className="mt-1 text-gray-500">
            La orden de trabajo solicitada no existe.
          </p>
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
            <div className="flex gap-2 items-center">
              <button onClick={handleRedirection}>
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Orden de Trabajo (#{orden.id})
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              {orden?.task?.code} - {orden?.tecnico?.fullName}
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
        <OrderInfoSection orden={mapOrdenInfo(orden)} />
        {/* Mapas */}
        <OrderMapsSection
          ubicacionRecibido={orden.ubicacionRecibido}
          ubicacionCierre={orden.ubicacionCierre}
        />
        {/* Estado y Calificación */}
        <OrderStatusSection
          orden={{
            estado: mapTipoBackToFront(orden.state),
            calificacion: null, // por ahora, hasta que el back lo devuelva
          }}
          onUpdateEstado={(estadoFront) =>
            updateEstadoMutation.mutate({
              estado: mapEstadoFrontToBack(estadoFront),
            })
          }
          onCalificar={(calificacion) => calificarMutation.mutate(calificacion)}
          isLoading={
            updateEstadoMutation.isPending || calificarMutation.isPending
          }
        />
        {/* Fecha y Hora de Trabajo */}
        <OrderWorkTimeSection
          orden={mapWorkTimes(orden)}
          onUpdateTiempo={(data) => updateTiempoMutation.mutate(data)}
          isLoading={updateTiempoMutation.isPending}
        />
        {/* Formulario */}
        <OrderFormSection
          modulos={mapSubtasksResultToModulos(orden?.result?.Subtasks || [])}
        />
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

//MAPEOS PARA CONECTAR UI CON BACK
function mapOrdenInfo(orden: any) {
  return {
    id: String(orden.id),
    usuario: orden.tecnico?.fullName || "Sin asignar",
    formulario: orden.task?.typeform || "N/A",
    orden: orden.task?.code || "N/A",
    sucursal: "N/A", // acá depende cómo viene la info
    cliente: "N/A",
    comentario: orden.commentary,
    sucursalCliente: "N/A",
    facility: "N/A",
    estado: orden.state || "Pendiente",
    horaInicio: orden.en_camino
      ? new Date(orden.en_camino).toLocaleTimeString()
      : null,
    horaFin: orden.finalizado
      ? new Date(orden.finalizado).toLocaleTimeString()
      : null,
    fechaCompleta: orden.pendiente
      ? new Date(orden.pendiente).toLocaleString()
      : "N/A",
    postergarPor: orden.postergado
      ? new Date(orden.postergado).toLocaleString()
      : null,
    creado: orden.Audit?.createdAt
      ? new Date(orden.Audit.createdAt).toLocaleString()
      : "N/A",
    firma: null, // tu JSON real no trae imagen de firma
    firmaResponsable: null, // idem
    ultimaEdicionFormulario: orden.Audit?.updatedAt
      ? new Date(orden.Audit.updatedAt).toLocaleString()
      : null,
    imageSolucioname: null, // idem
  };
}

function mapSubtasksResultToModulos(subtasks: any[]) {
  return [
    {
      id: "mod-resultado",
      pagina: 1,
      nombre: "Resultado",
      orden: 1,
      campos: subtasks.map((st, index) => ({
        id: `campo-${index}`,
        nombre: st.description || `campo-${index}`,
        titulo: st.description || `Campo ${index + 1}`,
        tipo: mapTipoBackToFront(st.type),
        valor: st.result && st.result.length > 0 ? st.result[0] : null,
        requerido: false, // el back no lo manda, por ahora fijo en false
        tareaTecnico: "", // el back no lo manda
        vistaInforme: "", // el back no lo manda
        fotos: st.type === "foto" ? st.result : undefined,
      })),
    },
  ];
}

function mapTipoBackToFront(type: string): CampoFormulario["tipo"] {
  switch (type) {
    case "text":
      return "texto";
    case "foto":
      return "foto";
    case "si/no":
      return "casilla_verificacion";
    case "select":
      return "desplegable";
    case "number":
      return "numero";
    case "fecha":
      return "fecha";
    case "titulo":
      return "titulo";
    default:
      return "texto";
  }
}

export function mapEstadoFrontToBack(estado: string): string {
  switch (estado) {
    case "Pendiente":
      return "pendiente";
    case "En proceso":
      return "en_camino";
    case "Finalizado":
      return "finalizado";
    case "Cancelado":
      return "cancelado";
    default:
      return "pendiente";
  }
}

export function mapEstadoBackToFront(estado: string): string {
  switch (estado) {
    case "pendiente":
      return "Pendiente";
    case "en_camino":
      return "En proceso";
    case "finalizado":
      return "Finalizado";
    case "cancelado":
      return "Cancelado";
    default:
      return "Pendiente";
  }
}

function mapWorkTimes(orden: any) {
  const formatHour = (iso: string | undefined) => {
    if (!iso) return null;
    const date = new Date(iso);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");


    return `${hours}:${minutes}`;
  };

  return {
    horaInicio: orden.en_camino ? formatHour(orden.en_camino) : null,
    horaFin: orden.finalizado ? formatHour(orden.finalizado) : null,
  };
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  QrCode,
  Download,
  Edit,
  Calendar,
  Wrench,
  Clock,
  Settings,
} from "lucide-react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EquipoQR } from "@/components/equipos/equipo-qr";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { EquipoService } from "@/utils/api/apiEquipo";
import { capitalizeFirstLetter } from "@/utils/normalize";

interface EquipoAPI {
  id: string;
  name: string;
  type: string;
  habilitado: string;
  fueraDeServicio: boolean;
  kv: { key: string; value: any; type: string | number | boolean }[];
  pt: string;
  qr: string | null;
  relations: number;
  Audit: {
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

function EquipoDetalleContent() {
  const params = useParams();
  const router = useRouter();
  const equipoId = params?.id as string;

  const [showQRModal, setShowQRModal] = useState(false);

  const {
    data: equipo,
    isLoading,
    isError,
  } = useQuery<EquipoAPI>({
    queryKey: ["equipo", equipoId],
    queryFn: () => EquipoService.mostrarEquipoId(equipoId),
    enabled: !!equipoId,
  });

  const handleEdit = () => {
    router.push(`/equipos?edit=${equipoId}`);
  };

  const handleDownloadQR = () => {
    console.log(`Descargando QR para equipo: ${equipo?.name}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatBoolean = (value: boolean) => {
    return value ? "SI" : "NO";
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "ok":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "reparacion":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "no_ok":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Cargando información del equipo...
            </p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (isError || !equipo) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Equipo no encontrado
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            El equipo solicitado no existe.
          </p>
          <button
            onClick={() => router.push("/equipos")}
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
              onClick={() => router.push("/equipos")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {equipo?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {equipo?.type} - conectar más adelante
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Información General
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Equipo
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {equipo?.type}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  conectar más adelante
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getEstadoColor(equipo?.habilitado ?? "-")
                  )}
                >
                  {equipo?.habilitado}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Instalación
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar
                    size={16}
                    className="text-gray-400 dark:text-gray-500"
                  />
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    conectar más adelante
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vida Útil Estimada
                </label>
                <div className="flex items-center space-x-2">
                  <Clock
                    size={16}
                    className="text-gray-400 dark:text-gray-500"
                  />
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    conectar más adelante
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Último Mantenimiento
                </label>
                <div className="flex items-center space-x-2">
                  <Wrench
                    size={16}
                    className="text-gray-400 dark:text-gray-500"
                  />
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    conectar más adelante
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Zona / Ubicación Exacta
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  conectar más adelante
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Datos Técnicos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Datos Técnicos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipo?.kv?.map((campo) => {
              let displayValue: string | number | boolean = campo.value;

              if (campo.type === "date" && typeof campo.value === "string") {
                displayValue = formatDate(campo.value);
              } else if (
                campo.type === "string" &&
                typeof campo.value === "string"
              ) {
                displayValue = capitalizeFirstLetter(campo.value);
              } else if (
                campo.type === "boolean" &&
                typeof campo.value === "boolean"
              ) {
                displayValue = formatBoolean(campo.value);
              }

              return (
                <div key={campo.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {campo.key.replace(/_/g, " ")}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {String(displayValue)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historial de Mantenimiento */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Historial de Mantenimiento
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            conectar más adelante
          </p>
        </div>

        {/* Rutinas Pendientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Rutinas Pendientes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            conectar más adelante
          </p>
        </div>

        {/* Modal QR */}
        {showQRModal && (
          <EquipoQR
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            equipo={{
              id: equipo?.id,
              name: equipo?.name ?? "Sin nombre",
              defId: equipo?.type,
              qrId: equipo?.qr,
              habilitado: equipo?.habilitado as any,
              fueraDeServicio: equipo?.fueraDeServicio ?? false,
            }}
          />
        )}
      </div>
    </ProtectedLayout>
  );
}

export default function EquipoDetallePage() {
  return <EquipoDetalleContent />;
}

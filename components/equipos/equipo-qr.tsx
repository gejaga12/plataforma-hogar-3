"use client";

import { Equipo } from "@/utils/types";
import { X, Download, Share2, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface EquipoQRProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo;
  size?: "sm" | "md" | "lg";
  showDownload?: boolean;
}

export function EquipoQR({
  isOpen,
  onClose,
  equipo,
  showDownload = true,
}: EquipoQRProps) {
  const handleDownload = () => {
    // Simular descarga del QR
    console.log(`Descargando QR para equipo: ${equipo.name}`);

    // En una implementación real, aquí generarías y descargarías el QR
    const link = document.createElement("a");
    link.download = `QR-${equipo.id}-${equipo.name.replace(/\s+/g, "-")}.png`;
    link.href = "#"; // Aquí iría la URL del QR generado
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR - ${equipo.name}`,
          text: `Código QR para el equipo: ${equipo.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback para navegadores sin Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Código QR del Equipo
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {equipo.name ?? "-"}
            </h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">ID:</span> {equipo.id ?? "-"}
              </p>
              <p>
                <span className="font-medium">Tipo:</span> {equipo.defId ?? "-"}
              </p>
            </div>
          </div>

          {/* QR real */}
          <div className="flex justify-center mb-6">
            {equipo.qrId ? (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                <QRCodeCanvas
                  id={`qr-canvas-${equipo.qrId}`}
                  value={equipo.qrId}
                  size={200}
                  level="H"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1 items-center">
                <div
                  className="flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Este equipo aún no tiene QR asignado"
                >
                  <QrCode
                    size={32}
                    className="text-gray-600 dark:text-gray-400"
                  />
                </div>
                <p className="text-center text-sm text-gray-400">Sin QR asignado</p>
              </div>
            )}
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
              Instrucciones de uso:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>
                • Escanea este código con la app móvil para acceder al equipo
              </li>
              <li>• El código contiene la información técnica del equipo</li>
              <li>• Puedes imprimir este código y pegarlo en el equipo</li>
            </ul>
          </div>

          {/* Acciones */}
          {showDownload && (
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Download size={16} />
                <span>Descargar</span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Share2 size={16} />
                <span>Compartir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

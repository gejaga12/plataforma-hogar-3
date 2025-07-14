'use client';

import { X, Download, Share2, QrCode } from 'lucide-react';

interface EquipoQRProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: {
    id: string;
    nombre: string;
    tipo: string;
    cliente: string;
    zona: string;
    qrCode: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showDownload?: boolean;
}

export function EquipoQR({ 
  isOpen, 
  onClose, 
  equipo, 
  size = 'lg', 
  showDownload = true 
}: EquipoQRProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };

  const handleDownload = () => {
    // Simular descarga del QR
    console.log(`Descargando QR para equipo: ${equipo.nombre}`);
    
    // En una implementación real, aquí generarías y descargarías el QR
    const link = document.createElement('a');
    link.download = `QR-${equipo.id}-${equipo.nombre.replace(/\s+/g, '-')}.png`;
    link.href = '#'; // Aquí iría la URL del QR generado
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR - ${equipo.nombre}`,
          text: `Código QR para el equipo: ${equipo.nombre}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback para navegadores sin Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
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
          {/* Equipment Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {equipo.nombre}
            </h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">ID:</span> {equipo.id}</p>
              <p><span className="font-medium">Tipo:</span> {equipo.tipo}</p>
              <p><span className="font-medium">Cliente:</span> {equipo.cliente}</p>
              <p><span className="font-medium">Zona:</span> {equipo.zona}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
              <div className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center`}>
                <div className="text-center">
                  <QrCode size={size === 'lg' ? 64 : size === 'md' ? 48 : 32} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {equipo.qrCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
              Instrucciones de uso:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Escanea este código con la app móvil para acceder al equipo</li>
              <li>• El código contiene toda la información técnica del equipo</li>
              <li>• Puedes imprimir este código y pegarlo en el equipo</li>
            </ul>
          </div>

          {/* Action Buttons */}
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
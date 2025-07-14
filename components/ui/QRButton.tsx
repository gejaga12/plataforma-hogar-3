'use client';

import { useState } from 'react';
import { QrCode, Download, X } from 'lucide-react';

interface QRButtonProps {
  qrCodeUrl: string;
  label?: string;
}

export function QRButton({ qrCodeUrl, label }: QRButtonProps) {
  const [showQR, setShowQR] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // En una implementación real, aquí se descargaría el QR
    console.log('Descargando QR:', qrCodeUrl);
  };

  return (
    <>
      <button
        onClick={() => setShowQR(true)}
        className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors text-xs"
      >
        <QrCode size={14} />
        <span>{label || 'Ver QR'}</span>
      </button>

      {/* Modal QR */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Código QR</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 mb-4">
              <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {qrCodeUrl}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>Descargar QR</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
'use client';

import { MapPin } from 'lucide-react';

interface OrderMapsSectionProps {
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
}

export function OrderMapsSection({ ubicacionRecibido, ubicacionCierre }: OrderMapsSectionProps) {
  const generateMapUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}&zoom=15`;
  };

  const generateStaticMapUrl = (lat: number, lng: number) => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x300&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="text-orange-500" size={20} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mapas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ubicación Recibido */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Ubicación Recibido</h3>
          {ubicacionRecibido ? (
            <div className="space-y-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                {/* Placeholder para el mapa - En producción usar Google Maps */}
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mapa de Google</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {ubicacionRecibido.latitud}, {ubicacionRecibido.longitud}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={16} />
                <span>{ubicacionRecibido.direccion}</span>
              </div>
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                Ver en Google Maps
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No hay ubicación de recibido registrada</p>
            </div>
          )}
        </div>

        {/* Ubicación Cierre */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Ubicación Cierre</h3>
          {ubicacionCierre ? (
            <div className="space-y-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                {/* Placeholder para el mapa - En producción usar Google Maps */}
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mapa de Google</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {ubicacionCierre.latitud}, {ubicacionCierre.longitud}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={16} />
                <span>{ubicacionCierre.direccion}</span>
              </div>
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                Ver en Google Maps
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ubicacionRecibido ? 'Orden aún no cerrada' : 'No hay ubicación de cierre registrada'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
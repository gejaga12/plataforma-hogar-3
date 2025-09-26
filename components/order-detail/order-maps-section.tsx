"use client";

import { MapPin } from "lucide-react";
import { GoogleMapBox } from "../ui/GoogleMapBox";
import { useInView } from "@/hooks/useInView";
import React, { useState } from "react";

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

function MapCard({
  title,
  ubicacion,
  forceShow = false,
}: {
  title: string;
  ubicacion: { latitud: number; longitud: number; direccion: string } | null;
  forceShow?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>("200px");
  const [show, setShow] = useState(false);
  const shouldMountMap = forceShow || show || inView;

  return (
    <div>
      <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>

      {ubicacion ? (
        <div className="space-y-3">
          <div
            ref={ref}
            className="h-64 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
          >
            {shouldMountMap ? (
              <GoogleMapBox lat={ubicacion.latitud} lng={ubicacion.longitud} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <button
                  onClick={() => setShow(true)}
                  className="px-3 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500"
                >
                  Mostrar mapa
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin size={16} />
            <span>{ubicacion.direccion}</span>
          </div>

          <a
            href={`https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors text-center block"
          >
            Ver en Google Maps
          </a>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No hay ubicación registrada
          </p>
        </div>
      )}
    </div>
  );
}

function OrderMapsSectionBase({
  ubicacionRecibido,
  ubicacionCierre,
}: OrderMapsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="text-orange-500" size={20} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Mapas
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MapCard title="Ubicación Recibido" ubicacion={ubicacionRecibido} />
        <MapCard title="Ubicación Cierre" ubicacion={ubicacionCierre} />
      </div>
      {/* Ubicación Cierre */}
      <div>
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
          Ubicación Cierre
        </h3>
        {ubicacionCierre ? (
          <div className="space-y-3">
            <div className="h-64 overflow-hidden">
              <GoogleMapBox
                lat={ubicacionCierre.latitud}
                lng={ubicacionCierre.longitud}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin size={16} />
              <span>{ubicacionCierre.direccion}</span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${ubicacionCierre.latitud},${ubicacionCierre.longitud}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors text-center block"
            >
              Ver en Google Maps
            </a>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {ubicacionRecibido
                ? "Orden aún no cerrada"
                : "No hay ubicación de cierre registrada"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const OrderMapsSection = React.memo(OrderMapsSectionBase);
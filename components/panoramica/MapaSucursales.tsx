"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Building, Home } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Sucursal } from "@/app/panoramica/page";

interface MapaSucursalesProps {
  sucursales: Sucursal[];
  onSelect: (sucursal: Sucursal) => void;
  selectedSucursalId?: string;
}

export function MapaSucursales({
  sucursales,
  onSelect,
  selectedSucursalId,
}: MapaSucursalesProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );
  const [markerClusterer, setMarkerClusterer] = useState<any>(null);

  // Cargar la API de Google Maps
  useEffect(() => {
    const loadMap = async () => {
      const loader = new Loader({
        apiKey: "AIzaSyB4tfeY1uDDlIN4a5RdBVQNXQzxEc9TeiA",
        version: "weekly",
        libraries: ["places", "visualization"],
      });

      try {
        const google = await loader.load();
        setMapLoaded(true);

        if (mapRef.current) {
          // Centrar en Argentina por defecto
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          setMap(mapInstance);
          setInfoWindow(new google.maps.InfoWindow());

          // Cargar MarkerClusterer para agrupar marcadores cercanos
          const { MarkerClusterer } = await import(
            "@googlemaps/markerclusterer"
          );
          setMarkerClusterer(new MarkerClusterer({ map: mapInstance }));
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    loadMap();

    return () => {
      // Limpiar marcadores al desmontar
      markers.forEach((marker) => marker.setMap(null));
      if (markerClusterer) {
        markerClusterer.clearMarkers();
      }
    };
  }, []);

  // Actualizar marcadores cuando cambian las sucursales o el mapa
  useEffect(() => {
    if (!map || !infoWindow || sucursales.length === 0) return;

    // Limpiar marcadores anteriores
    markers.forEach((marker) => marker.setMap(null));
    if (markerClusterer) {
      markerClusterer.clearMarkers();
    }

    const newMarkers: google.maps.Marker[] = [];

    // Crear bounds para ajustar el mapa
    const bounds = new google.maps.LatLngBounds();

    // Crear marcadores para cada sucursal
    sucursales.forEach((sucursal) => {
      const { lat, lng } = sucursal.coordenadas;

      // Crear icono personalizado según el tipo de sucursal
      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          sucursal.tipo === "hogar"
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${
                sucursal.estado === "activo" ? "#2563eb" : "#6b7280"
              }" stroke="${
                sucursal.estado === "activo" ? "#ffffff" : "#e5e7eb"
              }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${
                sucursal.estado === "activo" ? "#ea580c" : "#6b7280"
              }" stroke="${
                sucursal.estado === "activo" ? "#ffffff" : "#e5e7eb"
              }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"></rect><path d="M4 9h16"></path><path d="M9 21V9"></path></svg>`
        )}`,
        scaledSize: new google.maps.Size(36, 36),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(18, 36),
        labelOrigin: new google.maps.Point(18, 40),
      };

      // Crear marcador
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: sucursal.nombre,
        icon,
        animation:
          selectedSucursalId === sucursal.id
            ? google.maps.Animation.BOUNCE
            : undefined,
        optimized: false, // Mejora la visualización de SVG en algunos navegadores
        zIndex: selectedSucursalId === sucursal.id ? 1000 : 1, // Asegurar que el seleccionado esté encima
      });

      // Crear contenido del tooltip
      const tooltipContent = `
        <div class="p-3 max-w-xs">
          <div class="font-bold text-gray-900 mb-1">${sucursal.nombre}</div>
          <div class="text-sm text-gray-600 mb-2">${sucursal.direccion}</div>
          <div class="flex flex-wrap gap-1 mb-1">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
              sucursal.estado === "activo"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }">
              ${sucursal.estado === "activo" ? "Activo" : "Inactivo"}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
              sucursal.tipo === "hogar"
                ? "bg-blue-100 text-blue-800"
                : "bg-orange-100 text-orange-800"
            }">
              ${sucursal.tipo === "hogar" ? "Hogar" : "Cliente"}
            </span>
          </div>
          ${
            sucursal.cliente
              ? `<div class="text-xs text-gray-600 mb-2">Cliente: ${sucursal.cliente}</div>`
              : ""
          }
          <div class="text-xs text-blue-600 font-medium cursor-pointer mt-2">Click para ver detalles</div>
        </div>
      `;

      // Agregar evento click al marcador
      marker.addListener("click", () => {
        infoWindow.close();
        onSelect(sucursal);
      });

      // Agregar evento mouseover para mostrar tooltip
      marker.addListener("mouseover", () => {
        infoWindow.setContent(tooltipContent);
        infoWindow.open(map, marker);
      });

      // Cerrar tooltip al quitar el mouse
      marker.addListener("mouseout", () => {
        infoWindow.close();
      });

      newMarkers.push(marker);
      bounds.extend({ lat, lng });
    });

    // Ajustar el mapa para mostrar todos los marcadores
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);

      // Ajustar zoom si hay pocos marcadores
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map) {
          const zoom = map.getZoom();
          if (zoom !== undefined && zoom > 15) {
            map.setZoom(15);
          }
        }

        google.maps.event.removeListener(listener);
      });
    }

    setMarkers(newMarkers);

    // Agregar marcadores al clusterer si está disponible
    if (markerClusterer) {
      markerClusterer.clearMarkers();
      markerClusterer.addMarkers(newMarkers);
    }
  }, [
    map,
    infoWindow,
    sucursales,
    onSelect,
    selectedSucursalId,
    markerClusterer,
  ]);

  // Hacer que el marcador seleccionado rebote
  useEffect(() => {
    if (!selectedSucursalId || !markers.length) return;

    markers.forEach((marker, index) => {
      const sucursal = sucursales[index];
      if (sucursal.id === selectedSucursalId) {
        marker.setAnimation(google.maps.Animation.BOUNCE);

        // Centrar el mapa en el marcador seleccionado
        if (map) {
          map.panTo(marker.getPosition()!);
          map.setZoom(15);
        }
      } else {
        marker.setAnimation(null);
      }
    });
  }, [selectedSucursalId, markers, sucursales, map]);

  return (
    <div className="relative w-full h-full">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Cargando mapa...
            </p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />

      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 z-10">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Leyenda
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Home className="text-blue-600 dark:text-blue-400" size={16} />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Sucursal Hogar
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Building
              className="text-orange-600 dark:text-orange-400"
              size={16}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Sucursal Cliente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

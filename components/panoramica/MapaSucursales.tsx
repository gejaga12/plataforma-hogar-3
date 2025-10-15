"use client";

import { useEffect, useRef, useState } from "react";
import { Building, Home } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Cliente, Sucursal } from "@/utils/types";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

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
  const { isLoaded } = useGoogleMaps();

  const mapRefEl = useRef<HTMLDivElement | null>(null);

  // Instancias de Google Maps en refs (NO estado)
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const clustererRef = useRef<
    import("@googlemaps/markerclusterer").MarkerClusterer | null
  >(null);

  // Marcadores: por id de sucursal
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  // UI
  const [mapReady, setMapReady] = useState(false);
  const [didFitOnce, setDidFitOnce] = useState(false);

  // ===== Inicialización única: mapa, infoWindow y clusterer =====
  useEffect(() => {
    if (!isLoaded || mapRef.current || !mapRefEl.current) return;

    mapRef.current = new google.maps.Map(mapRefEl.current, {
      center: { lat: -34.6037, lng: -58.3816 }, // CABA
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      clickableIcons: false,
      gestureHandling: "greedy",
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    infoWindowRef.current = new google.maps.InfoWindow();

    (async () => {
      const { MarkerClusterer } = await import("@googlemaps/markerclusterer");
      if (mapRef.current) {
        clustererRef.current = new MarkerClusterer({ map: mapRef.current });
      }
      setMapReady(true);
      // Forzar resize por si el contenedor estaba oculto
      requestAnimationFrame(() => {
        if (mapRef.current) google.maps.event.trigger(mapRef.current, "resize");
      });
    })();

    // Cleanup
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      mapRef.current = null;
      setMapReady(false);
      setDidFitOnce(false);
    };
  }, [isLoaded]);

  // ===== Upsert de marcadores (mantiene tus iconos / tooltip / eventos) =====
  useEffect(() => {
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;
    const clusterer = clustererRef.current;

    if (!map || !infoWindow || !mapReady) return;

    if (!sucursales || sucursales.length === 0) {
      // limpiar si no hay datos
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();
      clusterer?.clearMarkers();
      return;
    }

    const existing = markersRef.current;
    const nextIds = new Set<string>();
    const bounds = new google.maps.LatLngBounds();

    // Crear/actualizar marcadores para cada sucursal
    sucursales.forEach((sucursal) => {
      if (!sucursal?.coords) return;

      const lan = Number(sucursal.coords.lan) || 0;
      const lng = Number(sucursal.coords.lng) || 0;
      if (
        !Number.isFinite(lan) ||
        !Number.isFinite(lng) ||
        (lan === 0 && lng === 0)
      ) {
        return;
      }
      const esHogar = sucursal.isInternal === true;

      // (mantenemos tu validación: omitir 0/0)
      if (lan === 0 && lng === 0) return;

      nextIds.add(sucursal.id!);

      // === Icono SVG personalizado (tal cual tu lógica) ===
      const icon: google.maps.Icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          esHogar
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${
                sucursal.isActive ? "#2563eb" : "#6b7280"
              }" stroke="${
                sucursal.estado === "activo" ? "#ffffff" : "#e5e7eb"
              }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a 2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${
                sucursal.isActive ? "#ea580c" : "#6b7280"
              }" stroke="${
                sucursal.estado === "activo" ? "#ffffff" : "#e5e7eb"
              }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="5" width="16" height="16" rx="2"></rect>
                <path d="M4 9h16"></path>
                <path d="M9 21V9"></path>
              </svg>`
        )}`,
        scaledSize: new google.maps.Size(36, 36),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(18, 36),
        labelOrigin: new google.maps.Point(18, 40),
      };

      // === Tooltip HTML (tal cual tu implementación) ===
      const tooltipContent = `
        <div class="p-3 max-w-xs">
          <div class="font-bold text-gray-900 mb-1">${sucursal.name}</div>
          <div class="text-sm text-gray-600 mb-2">${
            sucursal.address ?? ""
          }</div>
          <div class="flex flex-wrap gap-1 mb-1">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
              sucursal.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }">
              ${sucursal.isActive === true ? "Activo" : "Inactivo"}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
              esHogar
                ? "bg-blue-100 text-blue-800"
                : "bg-orange-100 text-orange-800"
            }">
              ${esHogar ? "Hogar" : "Cliente"}
            </span>
          </div>
          ${
            sucursal.cliente
              ? `<div class="text-xs text-gray-600 mb-2">Cliente: ${
                  (sucursal.cliente as Cliente).name
                }</div>`
              : ""
          }
          <div class="text-xs text-blue-600 font-medium cursor-pointer mt-2">Click para ver detalles</div>
        </div>
      `;

      // === Upsert marker (crear si no existe, actualizar si existe) ===
      const markerId =
        (sucursal.isInternal ? "hogar:" : "cli:") +
        (sucursal.id ?? `${lan},${lng}`);
      nextIds.add(markerId);
      let marker = existing.get(sucursal.id!);

      if (!marker) {
        marker = new google.maps.Marker({
          position: { lat: lan, lng },
          map,
          title: sucursal.name,
          icon,
          animation:
            selectedSucursalId === sucursal.id
              ? google.maps.Animation.BOUNCE
              : undefined,
          optimized: false, // mejor visual de SVG en algunos navegadores
          zIndex: selectedSucursalId === sucursal.id ? 1000 : 1,
        });

        // Handlers (como los tenías)
        marker.addListener("click", () => {
          infoWindow.close();
          onSelect(sucursal);
        });

        marker.addListener("mouseover", () => {
          infoWindow.setContent(tooltipContent);
          infoWindow.open(map, marker!);
        });

        marker.addListener("mouseout", () => {
          infoWindow.close();
        });

        existing.set(sucursal.id!, marker);
      } else {
        // actualizar sólo si cambió algo relevante
        const pos = marker.getPosition();
        if (!pos || pos.lat() !== lan || pos.lng() !== lng) {
          marker.setPosition({ lat: lan, lng });
        }
        marker.setTitle(sucursal.name);
        marker.setIcon(icon);
        marker.setAnimation(
          selectedSucursalId === sucursal.id
            ? google.maps.Animation.BOUNCE
            : null
        );
        marker.setZIndex(selectedSucursalId === sucursal.id ? 1000 : 1);
      }

      bounds.extend({ lat: lan, lng });
    });

    // Eliminar marcadores que ya no están
    existing.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        existing.delete(id);
      }
    });

    // Clusterer: refrescar con el set actual
    if (clusterer) {
      clusterer.clearMarkers();
      clusterer.addMarkers(Array.from(existing.values()));
    }

    // Ajustar el mapa para mostrar todos los marcadores (una sola vez)
    if (!didFitOnce && existing.size > 0) {
      map.fitBounds(bounds);
      const listener = google.maps.event.addListener(map, "idle", () => {
        const zoom = map.getZoom();
        if (zoom !== undefined && zoom > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
      setDidFitOnce(true);
    }
  }, [sucursales, onSelect, selectedSucursalId, didFitOnce, mapReady]);

  // ===== Animar/centrar por selección (id) =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // apagar animaciones previas
    markersRef.current.forEach((m) => m.setAnimation(null));

    if (selectedSucursalId) {
      const m = markersRef.current.get(selectedSucursalId);
      if (m) {
        m.setAnimation(google.maps.Animation.BOUNCE);
        const pos = m.getPosition();
        if (pos) {
          map.panTo(pos);
          map.setZoom(Math.min(map.getZoom() ?? 15, 15));
        }
      }
    }
  }, [selectedSucursalId]);

  return (
    <div className="relative w-full h-full">
      {(!mapReady || !isLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Cargando mapa...
            </p>
          </div>
        </div>
      )}

      <div ref={mapRefEl} className="w-full h-full" />

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

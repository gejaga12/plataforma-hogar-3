"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface GoogleMapBoxProps {
  lat: number;
  lng: number;
  zoom?: number;
  smoothPan?: boolean;
  mapOptions?: google.maps.MapOptions;
}

export function GoogleMapBox({
  lat,
  lng,
  zoom = 15,
  smoothPan = true,
  mapOptions,
}: GoogleMapBoxProps) {
  const { isLoaded } = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement>(null);

  // Guardamos instancias para no recrearlas
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const initializedRef = useRef(false);

  const baseOptions = useMemo<google.maps.MapOptions>(() => ({
    center: { lat, lng },
    zoom,
    gestureHandling: "greedy",
    disableDefaultUI: true,
    clickableIcons: false,
    // mapId: "TU_MAP_ID_OPCIONAL", // si usás Cloud Styled Maps
    ...mapOptions,
  }), [lat, lng, zoom, mapOptions]);

  // 1) Inicializar mapa una sola vez
  useEffect(() => {
    if (!isLoaded || !containerRef.current || initializedRef.current) return;

    // Crear mapa
    mapRef.current = new google.maps.Map(containerRef.current, baseOptions);

    // Crear marker
    markerRef.current = new google.maps.Marker({
      position: { lat, lng },
      map: mapRef.current,
    });

    initializedRef.current = true;

    // Cleanup en unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapRef.current = null;
      initializedRef.current = false;
    };
  }, [isLoaded, baseOptions, lat, lng]);

  // 2) Reaccionar a cambios de lat/lng/zoom SIN recrear mapa/marker
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const nextPos = { lat, lng };

    // Actualizar marker
    marker.setPosition(nextPos);

    // Actualizar zoom si cambia (evitamos recarga completa)
    if (zoom && map.getZoom() !== zoom) {
      map.setZoom(zoom);
    }

    // Centrar con animación suave (cuando aplica)
    if (smoothPan && map.getCenter()?.lat() !== lat || map.getCenter()?.lng() !== lng) {
      if (map.panTo) {
        map.panTo(nextPos);
      } else {
        map.setCenter(nextPos);
      }
    } else {
      map.setCenter(nextPos);
    }
  }, [lat, lng, zoom, smoothPan]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg bg-gray-200 dark:bg-gray-700"
    />
  );
}

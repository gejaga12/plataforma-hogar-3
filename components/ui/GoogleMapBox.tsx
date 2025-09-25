"use client";

import { useEffect, useRef } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface GoogleMapBoxProps {
  lat: number;
  lng: number;
}

export function GoogleMapBox({ lat, lng }: GoogleMapBoxProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
      });

      new google.maps.Marker({
        position: { lat, lng },
        map,
      });
    }
  }, [isLoaded, lat, lng]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg bg-gray-200 dark:bg-gray-700"
    />
  );
}

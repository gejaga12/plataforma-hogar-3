// hooks/useGeoPermission.ts
"use client";

import { useCallback, useEffect, useState } from "react";

type Permission = PermissionState | "unsupported"; // "granted" | "denied" | "prompt" | "unsupported"

const LS_LAST = "perm:geo:last"; // guarda {lat, lng, accuracy, timestamp}

export function useGeoPermission() {
  const [status, setStatus] = useState<Permission>("prompt");
  const [busy, setBusy] = useState(false);
  const [lastPosition, setLastPosition] = useState<{
    lat: number; lng: number; accuracy?: number; timestamp?: number;
  } | null>(null);

  // Cargar última posición de localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_LAST);
      if (raw) setLastPosition(JSON.parse(raw));
    } catch {}
  }, []);

  // Leer estado del permiso del navegador y sus cambios
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (!("permissions" in navigator)) {
      // Algunos navegadores antiguos: tratamos como "prompt"
      setStatus("prompt");
      return;
    }

    let mounted = true;
    // @ts-ignore: tipos de PermissionDescriptor
    navigator.permissions.query({ name: "geolocation" as PermissionName })
      .then((perm: PermissionStatus) => {
        if (!mounted) return;
        setStatus(perm.state);
        perm.onchange = () => setStatus(perm.state);
      })
      .catch(() => setStatus("prompt"));

    return () => { mounted = false; };
  }, []);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) return Promise.resolve<GeolocationPosition | null>(null);
    setBusy(true);
    return new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const payload = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          };
          localStorage.setItem(LS_LAST, JSON.stringify(payload));
          setLastPosition(payload);
          setBusy(false);
          resolve(pos);
        },
        () => { setBusy(false); resolve(null); },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  }, []);

  return { status, busy, lastPosition, request };
}

// components/GeoAutoAsk.tsx
"use client";

import { useEffect } from "react";

const LS_GEO_ASKED = "perm:geo:asked";   // "1"
const LS_GEO_LAST  = "perm:geo:last";    // { lat, lng, accuracy, timestamp }

export function GeoAutoAsk() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Solo HTTPS / localhost
    const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost";
    if (!isSecure) return;

    // Ya preguntamos alguna vez
    if (localStorage.getItem(LS_GEO_ASKED) === "1") return;

    if (!("geolocation" in navigator)) {
      localStorage.setItem(LS_GEO_ASKED, "1"); // no soporta, no insistimos
      return;
    }

    // 👉 Esto dispara el prompt nativo la primera vez
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem(LS_GEO_ASKED, "1");
        localStorage.setItem(
          LS_GEO_LAST,
          JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          })
        );
      },
      () => {
        // PERMISSION_DENIED / TIMEOUT / POSITION_UNAVAILABLE
        localStorage.setItem(LS_GEO_ASKED, "1"); // ya preguntamos; no re-pedir automáticamente
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return null;
}

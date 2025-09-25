"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useState } from "react";

let loader: Loader | null = null;

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!loader) {
      loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
      });
    }

    loader
      .load()
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error("Error cargando Google Maps:", err);
      });
  }, []);

  return { isLoaded };
}

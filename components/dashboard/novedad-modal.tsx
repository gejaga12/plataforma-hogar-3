"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ThumbsUp, Heart, Eye, Calendar, ImageIcon } from "lucide-react";
import { Novedad } from "@/utils/types";
import { formatDateForUser, getUserTimeZone } from "@/utils/formatDate";
import { useQuery } from "@tanstack/react-query";
import { NovedadesService } from "@/utils/api/apiNovedades";
import Image from "next/image";

interface NovedadModalProps {
  novedad: Novedad;
  onClose: () => void;
  onReaccionar: (tipo: "likes" | "hearts" | "views") => void;
}

export function NovedadModal({
  novedad,
  onClose,
  onReaccionar,
}: NovedadModalProps) {
  const timeZone = getUserTimeZone();
  const seenOnce = useRef(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!seenOnce.current) {
      seenOnce.current = true;
      onReaccionar("views");
    }
  }, [onReaccionar, novedad.id]);

  const hasImage = !!novedad.imagePath;

  const {
    data,
    isLoading: imgLoading,
    isError: imgError,
  } = useQuery({
    queryKey: ["novedad-image", novedad.id, hasImage],
    queryFn: () => NovedadesService.fetchImagesNovedades(novedad.id),
    enabled: Boolean(novedad.id && hasImage), // solo si hay imagen
    staleTime: 60_000,
    refetchOnMount: "always",
  });

  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!hasImage) {
      setImageSrc(null);
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
    }
  }, [hasImage, novedad.id]);

  useEffect(() => {
    if (!data) {
      setImageSrc(null);
      return;
    }
    const { blob, contentType } = data;
    if (contentType && contentType.includes("application/json")) {
      // si alguna vez devolviera JSON con url, parsealo acá (blob.text()) y setImageSrc(url)
      setImageSrc(null);
      return;
    }
    if (blob) {
      const url = URL.createObjectURL(blob);
      urlsRef.current.push(url);
      setImageSrc(url);
    } else {
      setImageSrc(null);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
    };
  }, []);

  const likeCount = novedad.likes ?? 0;
  const heartCount = novedad.hearts ?? 0;
  const viewCount = novedad.views ?? 0;
  const isLiked = !!novedad.like;
  const isHearted = !!novedad.heart;

  const fechaLegible = novedad.fecha
    ? formatDateForUser(novedad.fecha, timeZone)
    : "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{novedad.icono ?? "🔔"}</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {novedad.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Cerrar modal"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-4">
              {novedad.fecha && (
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>{fechaLegible}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contenido en 2 columnas (imagen izq, texto der) */}
          <div
            className={`grid grid-cols-1 min-h-[280px] ${
              hasImage ? "md:grid-cols-5" : "md:grid-cols-1"
            } gap-6 mb-6`}
          >
            {/* Columna izquierda: Imagen (solo si hay imagen) */}
            {hasImage && (
              <div className="md:col-span-2">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  {imgLoading ? (
                    <div className="animate-pulse h-full w-full bg-gray-200 dark:bg-gray-800" />
                  ) : imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={novedad.name}
                      className="h-full w-full object-center"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500 p-6 text-center">
                      <ImageIcon size={36} />
                      <span className="mt-2 text-sm">
                        {imgError
                          ? "No se pudo cargar la imagen"
                          : "Sin imagen"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Columna derecha: Descripción */}
            <div
              className={
                hasImage
                  ? "md:col-span-3 relative overflow-hidden"
                  : "md:col-span-1 relative overflow-hidden"
              }
            >
              <Image
                src="/images/hogarLogo.png"
                alt="Hogar al Volante"
                width={100}
                height={100}
                className="pointer-events-none select-none absolute right-2 bottom-1 opacity-20 z-0"
                aria-hidden="true"
              />
              <div className="prose dark:prose-invert max-w-none relative z-10">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {novedad.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones / Reacciones */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => onReaccionar("likes")}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                type="button"
                aria-pressed={isLiked}
                aria-label="Me gusta"
                title={isLiked ? "Quitar me gusta" : "Me gusta"}
              >
                <ThumbsUp size={18} />
                <span>{likeCount}</span>
              </button>

              <button
                onClick={() => onReaccionar("hearts")}
                className={`flex items-center space-x-2 transition-colors ${
                  isHearted
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                }`}
                type="button"
                aria-pressed={isHearted}
                aria-label="Me encanta"
                title={isHearted ? "Quitar me encanta" : "Me encanta"}
              >
                <Heart size={18} />
                <span>{heartCount}</span>
              </button>

              <div
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400"
                aria-label="Vistas"
                role="status"
              >
                <Eye size={18} />
                <span>{viewCount}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
              type="button"
            >
              Cerrar novedad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, Plus, Wrench } from "lucide-react";
import { NovedadCard } from "./novedad-card";
import { NovedadModal } from "./novedad-modal";
import {
  CrearHoraExtra,
  MovimientoIngresoEgreso,
  Novedad,
  TipoHoraExtra,
} from "@/utils/types";
import MovimientoModal from "../ingreso-egreso/MovimientoModal";
import HoraExtraModal from "../horas-extras/HoraExtraModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReaccionTipo } from "../novedades/NovedadesContent";
import { NovedadesService } from "@/utils/api/apiNovedades";

interface DashboardHeaderProps {
  nombreUsuario: string;
  panelTitle: string;
  icon: ReactNode;
  novedades: Novedad[];
  loadingNovedades: boolean;
}

export function DashboardHeader({
  nombreUsuario,
  panelTitle,
  icon,
  novedades,
  loadingNovedades = false,
}: DashboardHeaderProps) {
  const queryClient = useQueryClient();
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null);

  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [showHoraExtraModal, setShowHoraExtraModal] = useState(false);

  const pageSize = 3;
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [novedades?.length]);

  const total = novedades?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const pageItems = useMemo(() => {
    if (!novedades) return [];
    const start = page * pageSize;
    return novedades.slice(start, start + pageSize);
  }, [novedades, page]);

  const hoy = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reaccionarMutation = useMutation({
    mutationFn: async ({ id, tipo }: { id: string; tipo: ReaccionTipo }) => {
      // Llamadas reales al backend según tipo
      if (tipo === "likes") {
        return NovedadesService.interactionLike(id);
      }
      if (tipo === "hearts") {
        return NovedadesService.interactionHeart(id);
      }

      return Promise.resolve();
    },
    // Optimistic update
    onMutate: async ({ id, tipo }) => {
      await queryClient.cancelQueries({ queryKey: ["novedades"] });

      const prev = queryClient.getQueryData<Novedad[]>(["novedades"]);

      if (prev) {
        const updated = prev.map((n) => {
          if (n.id !== id) return n;

          if (tipo === "views") {
            return { ...n, views: (n.views ?? 0) + 1 };
          }

          if (tipo === "likes") {
            const isOn = !!n.like;
            return {
              ...n,
              like: !isOn,
              likes: Math.max(0, (n.likes ?? 0) + (isOn ? -1 : 1)),
            };
          }

          // love
          const isOn = !!n.heart;
          return {
            ...n,
            heart: !isOn,
            hearts: Math.max(0, (n.hearts ?? 0) + (isOn ? -1 : 1)),
          };
        });

        queryClient.setQueryData(["novedades"], updated);
      }

      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["novedades"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["novedades"] });
    },
  });

  const handleAbrirModalMovimiento = () => {
    setShowMovimientoModal(true);
  };

  const handleAbrirModalHoraExtra = () => {
    setShowHoraExtraModal(true);
  };

  const handleReaccionar = (id: string, tipo: "likes" | "hearts" | "views") => {
    reaccionarMutation.mutate({ id, tipo });
  };

  const nuevoMovimiento: MovimientoIngresoEgreso = {
    id: "",
    usuario: {
      id: "",
      nombreCompleto: "",
      rol: "",
    },
    tipo: "INGRESO",
    fechaHora: new Date().toISOString(),
    modo: "normal",
    motivo: "",
    ubicacion: {
      direccion: "",
    },
    dispositivo: "",
    ipAddress: "",
    observaciones: "",
    registradoPor: "",
    createdAt: new Date().toISOString(),
  };

  const nuevaHoraExtra: CrearHoraExtra = {
    lan: 0,
    lng: 0,
    horaInicio: "",
    horaFinal: "",
    razon: "",
    tipo: TipoHoraExtra.URGENCIA,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors mb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ¡Bienvenido, {nombreUsuario}!
          </h1>
          <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-0">
            <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
              {hoy}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {icon ?? <Wrench size={16} />}
              <span>{panelTitle}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={handleAbrirModalHoraExtra}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Hora extra</span>
          </button>
          <button
            onClick={handleAbrirModalMovimiento}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Ingreso / Egreso</span>
          </button>
        </div>
      </div>

      {/* Novedades */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Bell className="mr-2 text-orange-500" size={20} />
            Novedades
          </h2>
          {!loadingNovedades && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {total} {total === 1 ? "novedad" : "novedades"}
            </span>
          )}
        </div>

        {/* Cargando */}
        {loadingNovedades && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(pageSize)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Vacío */}
        {!loadingNovedades && total === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No hay novedades por el momento.
          </div>
        )}

        {/* Cards + paginación */}
        {!loadingNovedades && total > 0 && (
          <>
            {/* Cards: SOLO título */}
            <div className="space-y-3">
              {pageItems.map((n) => (
                <NovedadCard
                  key={n.id}
                  novedad={n}
                  onClick={() => setSelectedNovedad(n)} // abre modal
                  onCerrar={() => {
                    /* opcional en este modo */
                  }}
                  onReaccionar={() => {
                    /* opcional por ahora */
                  }}
                  onlyTitle
                />
              ))}
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canPrev}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-300">
                Página <strong>{page + 1}</strong> de{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                aria-label="Siguiente"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={!canNext}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalle de Novedad */}
      {selectedNovedad && (
        <NovedadModal
          novedad={selectedNovedad}
          onClose={() => setSelectedNovedad(null)}
          onReaccionar={(tipo) =>
            handleReaccionar(selectedNovedad.id, tipo as ReaccionTipo)
          }
        />
      )}

      {/* Modales secundarios */}
      <MovimientoModal
        isOpen={showMovimientoModal}
        onClose={() => setShowMovimientoModal(false)}
        movimiento={nuevoMovimiento}
        mode="create"
      />

      <HoraExtraModal
        isOpen={showHoraExtraModal}
        onClose={() => setShowHoraExtraModal(false)}
        mode="create"
        horaExtra={nuevaHoraExtra}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import type { AgendaItem, AgendaState, AgendaType } from "@/utils/types";

type ColumnId = AgendaState;

const columnsMeta: Record<
  ColumnId,
  { title: string; border: string; bg: string }
> = {
  pendiente: {
    title: "Pendiente",
    border: "border-yellow-300",
    bg: "bg-yellow-50/50 dark:bg-yellow-900/10",
  },
  progreso: {
    title: "En progreso",
    border: "border-blue-300",
    bg: "bg-blue-50/50 dark:bg-blue-900/10",
  },
  finalizado: {
    title: "Finalizado",
    border: "border-green-300",
    bg: "bg-green-50/50 dark:bg-green-900/10",
  },
};

// Estilos por tipo (afectan borde de la card, fondo suave y badge)
const typeStyles: Record<
  AgendaType,
  { border: string; bg: string; badgeBg: string; badgeText: string }
> = {
  meeting: {
    border: "border-violet-300",
    bg: "bg-violet-50/60 dark:bg-violet-900/10",
    badgeBg: "bg-violet-100 dark:bg-violet-900",
    badgeText: "text-violet-800 dark:text-violet-200",
  },
  task: {
    border: "border-orange-300",
    bg: "bg-orange-50/60 dark:bg-orange-900/10",
    badgeBg: "bg-orange-100 dark:bg-orange-900",
    badgeText: "text-orange-800 dark:text-orange-200",
  },
  deadline: {
    border: "border-rose-300",
    bg: "bg-rose-50/60 dark:bg-rose-900/10",
    badgeBg: "bg-rose-100 dark:bg-rose-900",
    badgeText: "text-rose-800 dark:text-rose-200",
  },
  training: {
    border: "border-emerald-300",
    bg: "bg-emerald-50/60 dark:bg-emerald-900/10",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900",
    badgeText: "text-emerald-800 dark:text-emerald-200",
  },
  reminder: {
    border: "border-sky-300",
    bg: "bg-sky-50/60 dark:bg-sky-900/10",
    badgeBg: "bg-sky-100 dark:bg-sky-900",
    badgeText: "text-sky-800 dark:text-sky-200",
  },
};

type BoardProps = {
  events: AgendaItem[];
  onDropState?: (id: string, newState: AgendaState) => Promise<void> | void; // PATCH estado
  onCardClick?: (ev: AgendaItem) => void;
};

export function AgendaBoard({ events, onDropState, onCardClick }: BoardProps) {
  // Agrupar por columna (estado del back)
  const grouped = useMemo(() => {
    const g: Record<ColumnId, AgendaItem[]> = {
      pendiente: [],
      progreso: [],
      finalizado: [],
    };
    for (const e of events) {
      const col: ColumnId =
        e.state === "pendiente" ||
        e.state === "progreso" ||
        e.state === "finalizado"
          ? e.state
          : "pendiente";
      g[col].push(e);
    }
    return g;
  }, [events]);

  const [columns, setColumns] = useState(grouped);
  useEffect(() => setColumns(grouped), [grouped]);

  const colRefs: Record<ColumnId, React.RefObject<HTMLDivElement>> = {
    pendiente: useRef<HTMLDivElement | null>(null),
    progreso: useRef<HTMLDivElement | null>(null),
    finalizado: useRef<HTMLDivElement | null>(null),
  };

  // Registrar columnas como drop targets
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    (Object.keys(colRefs) as ColumnId[]).forEach((targetCol) => {
      const el = colRefs[targetCol].current;
      if (!el) return;

      cleanups.push(
        dropTargetForElements({
          element: el,
          onDrop: async ({ source }) => {
            const cardId = source?.data?.id as string | undefined;
            if (!cardId) return;

            // mover optimista
            setColumns((prev) => {
              const next: typeof prev = {
                pendiente: [],
                progreso: [],
                finalizado: [],
              };
              // sacar de la columna anterior y meter en la nueva
              let movedCard: AgendaItem | undefined;
              for (const k of Object.keys(prev) as ColumnId[]) {
                for (const c of prev[k]) {
                  if (c.id === cardId) {
                    movedCard = c;
                  } else {
                    next[k].push(c);
                  }
                }
              }
              // encontrar data “fresh” desde events (fuente de verdad)
              const original = events.find((e) => e.id === cardId) ?? movedCard;
              if (original)
                next[targetCol].push({ ...original, state: targetCol });
              return next;
            });

            try {
              await onDropState?.(cardId, targetCol);
            } catch {
              // rollback si falla el PATCH
              setColumns(grouped);
            }
          },
        })
      );
    });

    return () => cleanups.forEach((fn) => fn());
  }, [events, onDropState, grouped]);

  const Card: React.FC<{ ev: AgendaItem & { description?: string } }> = ({
    ev,
  }) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!ref.current) return;
      return draggable({
        element: ref.current,
        getInitialData: () => ({ id: ev.id }),
      });
    }, [ev.id]);

    // estilos por tipo
    const t = ev.type ?? "task";
    const typeStyle = typeStyles[t] ?? typeStyles["task"];

    const until = ev.until ? new Date(ev.until) : null;
    const untilStr = until
      ? until.toLocaleString("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "";

    return (
      <div
        ref={ref}
        role="button"
        onClick={() => onCardClick?.(ev)}
        className={cn(
          "rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm",
          "hover:shadow transition-shadow cursor-grab active:cursor-grabbing",
          typeStyle.border,
          typeStyle.bg
        )}
      >
        {/* Header: name (izq) + type badge (der) */}
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {ev.name}
          </div>
          {ev.type && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                typeStyle.badgeBg,
                typeStyle.badgeText
              )}
              title={`Tipo: ${ev.type}`}
            >
              {ev.type}
            </span>
          )}
        </div>

        {/* Descripción (si existe) */}
        {ev.description && (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 truncate">
            {ev.description}
          </div>
        )}

        {/* Footer: asignaciones + fecha/hora */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          {untilStr && <span className="shrink-0">{untilStr}</span>}
        </div>
      </div>
    );
  };

  // (Opcional) monitor global para futuros efectos visuales
  useEffect(() => {
    return monitorForElements({
      onDrop() {},
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[520px]">
      {(Object.keys(columns) as ColumnId[]).map((colId) => {
        const meta = columnsMeta[colId];
        return (
          <div key={colId} className="flex flex-col min-h-0">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {meta.title}
              </h3>
              <span className="text-xs text-gray-500">
                {columns[colId].length}
              </span>
            </div>
            <div
              ref={colRefs[colId]}
              className={cn(
                "flex-1 overflow-y-auto rounded-lg border p-2 space-y-2",
                meta.border,
                meta.bg
              )}
            >
              {columns[colId].map((ev) => (
                <Card
                  key={ev.id}
                  ev={ev as AgendaItem & { description?: string }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

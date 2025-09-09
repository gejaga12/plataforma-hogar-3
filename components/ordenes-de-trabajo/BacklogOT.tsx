import { OTService } from "@/api/apiOTs";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, UserPlus, Wrench } from "lucide-react";
import React, { useMemo, useState } from "react";

export type BacklogOrder = {
  id: string;
  formulario: string;
  cliente: string;
  comentario?: string;
  fecha: string; // dd/mm/yyyy
  horaInicio?: string;
  horaFin?: string;
  tecnico?: string; // vacío = sin asignar
  sucursal?: string; // vacío = sin asignar
  prioridad?: "Baja" | "Media" | "Alta";
  userId?: number | null; // para validar si está asignada
};

const prioridadClass: Record<"Baja" | "Media" | "Alta", string> = {
  Baja: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  Media:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  Alta: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const BacklogOT = () => {
  const [search, setSearch] = useState("");

  // 🔽 Cargar OTs desde API
  const {
    data: ots,
    isLoading,
    isError,
    error,
  } = useQuery<BacklogOrder[]>({
    queryKey: ["ots-backlog"],
    queryFn: () => OTService.listarOTs({ limit: 50, offset: 0 }),
  });

  console.log('OTs sin user:', ots);

  // 🔽 Filtrar backlog = OTs sin usuario asignado
  const backlog = useMemo(() => {
    if (!ots) return [];
    return ots.filter((o) => !o.userId || o.userId === null);
  }, [ots]);

  // 🔽 Filtrado por búsqueda
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return backlog.filter(
      (o) =>
        o.id.toString().toLowerCase().includes(s) ||
        (o.formulario ?? "").toLowerCase().includes(s) ||
        (o.cliente ?? "").toLowerCase().includes(s) ||
        (o.comentario ?? "").toLowerCase().includes(s)
    );
  }, [backlog, search]);

  if (isLoading) {
    return <p className="p-4 text-gray-500">Cargando backlog…</p>;
  }

  if (isError) {
    return (
      <p className="p-4 text-red-500">
        Error al obtener backlog: {(error as Error).message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Backlog OTs
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Órdenes sin asignación
          </p>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID, cliente, comentario…"
            className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Formulario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Comentario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Prioridad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((o, i) => (
                <tr
                  key={o.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                    i % 2 === 1 && "bg-gray-25 dark:bg-gray-800/50"
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {o.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {o.formulario}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-40 truncate" title={o.cliente}>
                      {o.cliente}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div
                      className="max-w-64 truncate"
                      title={o.comentario || "Nulo"}
                    >
                      {o.comentario || (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                          Nulo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {o.fecha}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit gap-1",
                        prioridadClass[
                          (o.prioridad ?? "Baja") as "Baja" | "Media" | "Alta"
                        ]
                      )}
                    >
                      <Wrench size={14} />
                      {o.prioridad ?? "Baja"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => console.log("Ver backlog OT:", o.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        title="Ver"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          console.log("Asignar técnico/sucursal a:", o.id)
                        }
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
                        title="Asignar"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-sm text-gray-500 dark:text-gray-400"
                  >
                    No hay OT en backlog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BacklogOT;

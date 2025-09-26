"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  X,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { AgendaItem, AgendaType, UserAdapted } from "@/utils/types";
import { getUserTimeZone, toDateInputValue, toUTC } from "@/utils/formatDate";
import { AuthService } from "@/utils/api/apiAuth";
import { payloadCreateAgenda } from "@/utils/api/apiAgenda";

// ---- Tipos ----
type BaseUser = {
  id: string;
  name: string;
  avatar?: string;
  zone?: string;
  area?: string;
  position?: string;
};

type AgendaUpdateInput = {
  id: string;
  changes: Partial<
    Pick<AgendaItem, "name" | "until" | "type" | "description" | "priority">
  >;
};

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  onCreate: (payload: payloadCreateAgenda) => void;
  onUpdate: (payload: AgendaUpdateInput) => void;
  event: AgendaItem | null; // modo edición
  isLoading: boolean;
  availableUsers: BaseUser[]; // si no viene, se consulta
}

// ---- Data users (fallback si no pasan availableUsers) ----
async function fetchUsersLite(): Promise<UserAdapted[]> {
  return await AuthService.getUsers();
}

export function EventModal({
  onClose,
  onCreate,
  onUpdate,
  isOpen,
  mode,
  event,
  isLoading,
  availableUsers,
}: EventModalProps) {
  // form state
  const [name, setName] = useState("");
  const [type, setType] = useState<AgendaType>("meeting");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"alta" | "media" | "baja">("media");

  // until = date + time (local) -> se convertirá a UTC en submit
  const [dateInput, setDateInput] = useState<string>(
    toDateInputValue(new Date().toISOString())
  );
  const [timeInput, setTimeInput] = useState<string>(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  });

  // asignado
  const [assignee, setAssignee] = useState<BaseUser | null>(null);

  // filtros dropdown
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssigneeSearch, setShowAssigneeSearch] = useState(false);
  const [zoneFilter, setZoneFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // cargar usuarios si no vienen de arriba
  const { data: fetchedUsers = [], isLoading: loadingUsers } = useQuery<
    UserAdapted[]
  >({
    queryKey: ["agenda-users"],
    queryFn: fetchUsersLite,
    enabled: !availableUsers || availableUsers.length === 0,
    staleTime: 5 * 60 * 1000,
  });

  // adaptador
  const toBaseUser = (u: UserAdapted): BaseUser => ({
    id: String(u.id),
    name: u.fullName,
    // no tenemos area/position en UserAdapted; si en el futuro existen, mapéalos
    zone: u.zona?.name,
  });

  // lista normalizada
  const users: BaseUser[] = useMemo(() => {
    if (availableUsers && availableUsers.length) return availableUsers;
    return fetchedUsers.map(toBaseUser);
  }, [availableUsers, fetchedUsers]);

  // init para create / edit
  useEffect(() => {
    if (!event) {
      setName("");
      setType("meeting");
      setDescription("");
      setPriority("media");
      const now = new Date();
      setDateInput(toDateInputValue(now.toISOString()));
      setTimeInput(
        `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`
      );
      setAssignee(null);
      return;
    }

    // edición
    setName(event.name);
    setType(event.type ?? "meeting");
    setDescription(event.description || "");
    setPriority(event.priority ?? "media");

    const d = new Date(event.until); // UTC string del back
    setDateInput(toDateInputValue(d.toISOString()));
    setTimeInput(
      `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`
    );

    // tratar de preseleccionar el asignado si lo tenés como userId en tu modelo
    const found =
      users.find((u) => String(u.id) === String((event as any).userId)) || null;
    setAssignee(found);
  }, [event, users]);

  // cerrar dropdown clic fuera
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowAssigneeSearch(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const zones = useMemo(
    () =>
      Array.from(new Set(users.map((u) => u.zone).filter(Boolean))) as string[],
    [users]
  );
  const areas = useMemo(
    () =>
      Array.from(new Set(users.map((u) => u.area).filter(Boolean))) as string[],
    [users]
  );
  const positions = useMemo(
    () =>
      Array.from(
        new Set(users.map((u) => u.position).filter(Boolean))
      ) as string[],
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchTerm || u.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = !zoneFilter || u.zone === zoneFilter;
      const matchesArea = !areaFilter || u.area === areaFilter;
      const matchesPosition = !positionFilter || u.position === positionFilter;
      return matchesSearch && matchesZone && matchesArea && matchesPosition;
    });
  }, [users, searchTerm, zoneFilter, areaFilter, positionFilter]);

  const resetFilters = () => {
    setZoneFilter("");
    setAreaFilter("");
    setPositionFilter("");
    setSearchTerm("");
  };

  const onPickAssignee = (u: BaseUser) => {
    setAssignee(u);
    setShowAssigneeSearch(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignee) return;

    // construir la fecha local desde los inputs
    const localDate = new Date(`${dateInput}T${timeInput}`);

    // ISO en UTC con tus helpers
    const tz = getUserTimeZone();
    const untilISO = toUTC(localDate, tz);

    if (mode === "create") {
      const payload: payloadCreateAgenda = {
        name: name.trim(),
        until: untilISO, // ← string ISO
        userId: Number(assignee.id), // ← number
        type,
        description: description || undefined,
        priority,
      };
      onCreate(payload);
      return;
    }

    // edit
    if (!event) return;
    const changes: AgendaUpdateInput["changes"] = {
      name: name.trim(),
      until: untilISO,
      type,
      description: description || undefined,
      priority,
    };

    // limpiar undefined
    (Object.keys(changes) as (keyof typeof changes)[]).forEach((k) => {
      if (typeof changes[k] === "undefined") delete changes[k];
    });

    onUpdate({ id: event.id, changes });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {mode === "edit" ? "Editar agenda" : "Nueva agenda"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre + Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej: Reunión de planificación"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AgendaType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700"
                required
              >
                <option value="meeting">Reunión</option>
                <option value="task">Tarea</option>
                <option value="deadline">Fecha límite</option>
                <option value="training">Capacitación</option>
                <option value="reminder">Recordatorio</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle o id externo (p. ej. id de la tarea)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 resize-none"
            />
          </div>

          {/* Fecha/Hora (until) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha *
              </label>
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-400 mr-2" />
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora *
              </label>
              <div className="flex items-center">
                <Clock size={18} className="text-gray-400 mr-2" />
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Asignado + Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asignado */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asignado a *
              </label>
              {assignee ? (
                <div className="flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        {assignee.name?.charAt(0)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {assignee.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssignee(null)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Quitar"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAssigneeSearch((s) => !s)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    Seleccionar usuario
                  </span>
                  <ChevronDown size={16} />
                </button>
              )}

              {showAssigneeSearch && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700"
                        placeholder="Buscar usuarios…"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <Filter size={12} className="mr-1" />
                      Filtrar por:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={zoneFilter}
                        onChange={(e) => setZoneFilter(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-orange-500 bg-white dark:bg-gray-700"
                      >
                        <option value="">Zonas</option>
                        {zones.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                      <select
                        value={areaFilter}
                        onChange={(e) => setAreaFilter(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-orange-500 bg-white dark:bg-gray-700"
                      >
                        <option value="">Áreas</option>
                        {areas.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-orange-500 bg-white dark:bg-gray-700"
                      >
                        <option value="">Puestos</option>
                        {positions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(zoneFilter || areaFilter || positionFilter) && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs text-orange-600 dark:text-orange-400 hover:underline mt-2"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto p-2">
                    {loadingUsers ? (
                      <div className="p-4 flex justify-center">
                        <LoadingSpinner />
                      </div>
                    ) : filteredUsers.length ? (
                      filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => onPickAssignee(u)}
                          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                              {u.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-gray-900 dark:text-gray-100 font-medium">
                              {u.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {u.position ? <span>{u.position}</span> : null}
                              {u.area ? <span> • {u.area}</span> : null}
                              {u.zone ? <span> • {u.zone}</span> : null}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron usuarios
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "alta" | "media" | "baja")
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !assignee}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : null}
              <span>{mode === "edit" ? "Actualizar" : "Crear"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

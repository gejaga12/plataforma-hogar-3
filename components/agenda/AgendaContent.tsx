import { useMemo, useState } from "react";
import { AgendaHeader } from "./agenda-header";
import { LoadingSpinner } from "../ui/loading-spinner";
import { EventModal } from "./event-modal";
import { EventDetailModal } from "./event-detail-modal";
import { AgendaBoard } from "./AgendaBoard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AgendaService, payloadCreateAgenda } from "@/utils/api/apiAgenda";
import {
  AgendaItem,
  AgendaState,
  AgendaType,
  AgendaUserLite,
  ListarAgendasResponse,
} from "@/utils/types";

const flattenAgendas = (resp: ListarAgendasResponse): AgendaItem[] => {
  const all: AgendaItem[] = [
    ...(resp.owner ?? []),
    ...(resp.subs ?? []),
    ...(resp.agendaByArea ?? []),
  ];
  const seen = new Set<string>();
  return all.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
};

// lo que usamos para actualizar parcialmente
export type AgendaUpdateInput = {
  id: string;
  changes: Partial<
    Pick<
      AgendaItem,
      "name" | "until" | "type" | "description" | "priority" | "user"
    >
  >;
};

export const AgendaContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AgendaType | "">("");
  const [stateFilter, setStateFilter] = useState<AgendaState | "">("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaItem | null>(null);
  const [editMode, setEditMode] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["agenda-events"],
    queryFn: AgendaService.listarAllAgendas,
    select: (resp: ListarAgendasResponse) => flattenAgendas(resp),
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawApiData } = useQuery({
    queryKey: ["agenda-raw"],
    queryFn: AgendaService.listarAllAgendas,
    staleTime: 5 * 60 * 1000,
  });

  const availableUsers = useMemo(() => {
    const set = new Map<string, { id: string; name: string }>();
    const add = (u?: AgendaUserLite) => {
      if (!u) return;
      const id = String(u.id);
      if (!set.has(id)) set.set(id, { id, name: u.fullName });
    };
    const api = rawApiData as ListarAgendasResponse | undefined;
    api?.subordinados?.forEach(add);
    api?.owner?.forEach((a) => {
      add(a.assignedBy);
      add(a.user);
    });
    api?.subs?.forEach((a) => {
      add(a.assignedBy);
      add(a.user);
    });
    api?.agendaByArea?.forEach((a) => {
      add(a.assignedBy);
      add(a.user);
    });
    return Array.from(set.values());
  }, [rawApiData]);

  // ===== Mutations  =====
  const createMutation = useMutation({
    mutationFn: async (payload: payloadCreateAgenda) => {
      console.log(payload);

      return AgendaService.crearAgenda(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda-events"] });
      setShowEventModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: AgendaUpdateInput) =>
      AgendaService.actualizarAgenda(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda-events"] });
      setShowEventModal(false);
      setShowDetailModal(false);
      setSelectedEvent(null);
      setEditMode(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => AgendaService.eliminarAgenda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda-events"] });
      setShowDetailModal(false);
      setSelectedEvent(null);
    },
  });

  // ===== Filtros locales =====
  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return events.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(term) ||
        e.assignedBy.fullName.toLowerCase().includes(term) ||
        e.user.fullName.toLowerCase().includes(term);

      const matchesType = !typeFilter || e.type === typeFilter;
      const matchesState = !stateFilter || e.state === stateFilter;

      return matchesSearch && matchesType && matchesState;
    });
  }, [events, searchTerm, typeFilter, stateFilter]);

  const handleDeleteEvent = (id: string) => deleteMutation.mutate(id);

  const handleEventClick = (ev: AgendaItem) => {
    setSelectedEvent(ev);
    setShowDetailModal(true);
  };

  const handleEditFromDetail = () => {
    setShowDetailModal(false);
    setEditMode(true);
    setShowEventModal(true);
  };

  return (
    <div className="space-y-6">
      <AgendaHeader
        onCreateEvent={() => {
          setSelectedEvent(null);
          setEditMode(false);
          setShowEventModal(true);
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Cargando agenda...
            </p>
          </div>
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-600">
          Error cargando la agenda
        </div>
      ) : (
        <AgendaBoard
          events={filteredEvents}
          onCardClick={handleEventClick}
          onDropState={(id, newState) =>
            AgendaService.cambiarEstadoAgenda(id, newState)
          }
        />
      )}

      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditMode(false);
        }}
        mode={editMode ? "edit" : "create"}
        onCreate={(payload) => createMutation.mutate(payload)}
        onUpdate={(payload) => updateMutation.mutate(payload)}
        event={editMode ? selectedEvent : null}
        isLoading={createMutation.isPending || updateMutation.isPending}
        availableUsers={availableUsers}
      />

      {/* Detalle */}
      {selectedEvent && (
        <EventDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          event={selectedEvent as any}
          onEdit={handleEditFromDetail}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

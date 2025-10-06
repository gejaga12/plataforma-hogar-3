import { Novedad } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Bell, Edit, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { NovedadCard } from "../dashboard/novedad-card";
import { NovedadModal } from "../dashboard/novedad-modal";
import { NovedadFormModal } from "../dashboard/novedad-form-modal";
import { NovedadesService, Segregacion } from "@/utils/api/apiNovedades";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import ModalPortal from "../ui/ModalPortal";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

export type ReaccionTipo = "likes" | "hearts" | "views";

export function NovedadesAdmin() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.[0].name === "admin";

  const limit = 10;
  const offset = 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNovedad, setEditingNovedad] = useState<Novedad | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  // Si más adelante incorporás “fijadas”, habilitá este estado y los botones.
  const [activeFilter, setActiveFilter] = useState<"all" | "active">("all");

  const queryClient = useQueryClient();

  // ===== Query: listar novedades =====
  const { data: novedades = [], isLoading } = useQuery({
    queryKey: ["novedades", { limit, offset, isAdmin }],
    queryFn: () => NovedadesService.obtenerNovedades(limit, offset, isAdmin),
  });

  console.log("novedades:", novedades);

  const { data: usersNovedades = [], isLoading: isLoadingUsersNovedades } =
    useQuery({
      queryKey: ["users-novedades"],
      queryFn: () => NovedadesService.usuariosNovedaddes(),
    });

  // ===== CREATE =====
  const createMutation = useMutation({
    mutationFn: ({
      data,
      file,
    }: {
      data: Omit<Novedad, "id" | "file"> & {
        users?: number[];
        zonas?: string[];
        areas?: string[];
      };
      file?: File;
    }) => {
      const { users, zonas, areas, name, desc, icono } = data;

      const segregacion =
        (users && users.length) ||
        (zonas && zonas.length) ||
        (areas && areas.length)
          ? { users, zonas, areas } // ← objeto plano
          : undefined;

      const payloadForService = {
        name: name.trim(),
        desc: desc?.trim() || undefined,
        icono,
        segregacion,
      } as const;

      console.log("payloadForService:", payloadForService);

      return NovedadesService.crearNovedad(payloadForService, file, "file");
    },
    onSuccess: () => {
      toast.success("Novedad creada con exito");
      queryClient.invalidateQueries({ queryKey: ["novedades"] });
      setShowFormModal(false);
    },
    onError: () => {
      toast.error("Error al crear novedad");
    },
  });

  // ===== UPDATE =====
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Novedad, "id">>;
    }) => NovedadesService.editNovedad(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["novedades"] });
      setEditingNovedad(null);
      setShowFormModal(false);
    },
  });

  // ===== DELETE =====
  const deleteMutation = useMutation({
    mutationFn: (id: string) => NovedadesService.deleteNovedad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["novedades"] });
      setShowDeleteConfirm(null);
    },
  });

  //==== REACCIONAR =====
  const reaccionarMutation = useMutation({
    mutationFn: async ({ id, tipo }: { id: string; tipo: ReaccionTipo }) => {
      // Llamadas reales al backend según tipo
      if (tipo === "likes") {
        return NovedadesService.interactionLike(id);
      }
      if (tipo === "hearts") {
        return NovedadesService.interactionHeart(id);
      }
      // Si querés persistir "seen" en backend, podrías crear un endpoint similar;
      // de momento lo dejamos solo optimista.
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

  const selectedNovedad = useMemo(
    () =>
      selectedId ? novedades.find((n) => n.id === selectedId) ?? null : null,
    [selectedId, novedades]
  );

  // ===== Handlers =====
  const handleCreateNovedad = (data: Omit<Novedad, "id">, file?: File) => {
    createMutation.mutate({ data, file });
  };

  const handleUpdateNovedad = (data: Omit<Novedad, "id">) => {
    if (!editingNovedad) return;
    updateMutation.mutate({ id: editingNovedad.id, data });
  };

  const handleEditNovedad = (novedad: Novedad) => {
    setEditingNovedad(novedad);
    setShowFormModal(true);
  };

  const handleDeleteNovedad = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) deleteMutation.mutate(showDeleteConfirm);
  };

  const handleReaccionar = (id: string, tipo: "likes" | "hearts" | "views") => {
    reaccionarMutation.mutate({ id, tipo });
  };

  // ===== Filtros / Orden =====
  const filteredNovedades =
    novedades.filter((n) => {
      const s = searchTerm.trim().toLowerCase();
      const matchesSearch =
        n.name?.toLowerCase().includes(s) || n.desc?.toLowerCase().includes(s);

      if (activeFilter === "active") {
        // “Activas”: fecha >= hoy (si existe fecha)
        if (!n.fecha) return false;
        const f = new Date(n.fecha);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return matchesSearch && f >= today;
      }
      // "all"
      return matchesSearch;
    }) ?? [];

  const sortedNovedades = [...filteredNovedades].sort((a, b) => {
    // Orden por fecha descendente si existe, si no, quedan al final
    const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
    const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
    return tb - ta;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando novedades...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Novedades
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las novedades y anuncios para los usuarios
          </p>
        </div>

        <button
          onClick={() => {
            setEditingNovedad(null);
            setShowFormModal(true);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Novedad</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar novedades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                activeFilter === "all"
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                activeFilter === "active"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              )}
            >
              Activas
            </button>
          </div>
        </div>
      </div>

      {/* Novedades List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          {sortedNovedades.length > 0 ? (
            sortedNovedades.map((novedad) => (
              <div
                key={novedad.id}
                className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <NovedadCard
                    novedad={novedad}
                    onCerrar={() => handleDeleteNovedad(novedad.id)}
                    onReaccionar={(tipo) =>
                      handleReaccionar(novedad.id, tipo as ReaccionTipo)
                    }
                    onClick={() => setSelectedId(novedad.id)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditNovedad(novedad)}
                    className="p-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteNovedad(novedad.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                No hay novedades
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No se encontraron novedades con el término de búsqueda."
                  : "Comienza creando una nueva novedad."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalPortal>
        {selectedNovedad && (
          <NovedadModal
            novedad={selectedNovedad}
            onClose={() => setSelectedId(null)}
            onReaccionar={(tipo) =>
              handleReaccionar(selectedNovedad.id, tipo as ReaccionTipo)
            }
          />
        )}

        <NovedadFormModal
          isOpen={showFormModal}
          usersNovedades={usersNovedades}
          onClose={() => {
            setShowFormModal(false);
            setEditingNovedad(null);
          }}
          onSubmit={editingNovedad ? handleUpdateNovedad : handleCreateNovedad}
          novedad={editingNovedad || undefined}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        <ConfirmDeleteModal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
          title="Confirmar Eliminación"
          message="¿Estás seguro de que deseas eliminar esta novedad? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      </ModalPortal>
    </div>
  );
}

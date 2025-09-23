import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { cn } from "@/utils/cn";
import { OTService } from "@/api/apiOTs";
import { queryClient } from "@/utils/query-client";
import CrearOTModal from "./CrearOTModal";
import toast from "react-hot-toast";
import { Ots } from "@/utils/types";
import BacklogOT from "./BacklogOT";
import { AsignarOTModal } from "./AsignarClienteOtModal";
import { formatDateText } from "@/utils/formatDate";
import {
  getEstadoBadgeClass,
  getEstadoLabel,
  getPrioridadClass,
} from "../ui/EstadosBadge";

type SortField = "id" | "fecha" | "tecnico";
type SortDirection = "asc" | "desc";

export function OrdersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [openModal, setOpenModal] = useState(false);
  const [openAsignarModal, setOpenAsignarModal] = useState(false);
  const [selectedOT, setSelectedOT] = useState<Ots | null>(null);
  const router = useRouter();

  const {
    data: ots,
    isLoading: isLoadingOts,
    isError,
  } = useQuery<Ots[]>({
    //UNIFICAR TIPO DESPUES CON BACKLOG
    queryKey: ["ots-backlog"],
    queryFn: () => OTService.listarOTs({ limit: 50, offset: 0 }),
  });

  // console.log('Ots:', ots);

  const crearOTMutation = useMutation({
    mutationFn: async (payload: {
      commentary: string;
      task: string;
      userId?: number;
      priority?: "baja" | "media" | "alta" | "default";
    }) => {
      console.log("📤 Enviando payload a crearOT:", payload);
      return OTService.crearOT(payload);
    },
    onSuccess: () => {
      toast.success("OT creada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["ots-table"] });
      queryClient.invalidateQueries({ queryKey: ["ots-backlog"] });
    },
    onError: () => {
      toast.error("Ocurrio un error al crear la OT. Intente nuevamente");
    },
  });

  const getFechaFromOT = (ot: Ots): string => {
    if (!ot.state) return "";
    return ot[ot.state] ?? "";
  };

  const filteredOrders =
    ots?.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      return order.tecnico?.fullName.toString().includes(searchLower);
    }) || [];

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === "fecha") {
      aValue = getFechaFromOT(a);
      bValue = getFechaFromOT(b);
    } else if (sortField === "tecnico") {
      aValue = a.tecnico?.fullName?.toLowerCase() ?? "";
      bValue = b.tecnico?.fullName?.toLowerCase() ?? "";
    } else {
      aValue = a[sortField] ?? "";
      bValue = b[sortField] ?? "";
    }

    // Normalizar a string para comparación
    if (typeof aValue === "string" && aValue.includes("T")) {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(sortedOrders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleViewOrder = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: number) => {
    console.log("Editar orden:", orderId);
  };

  const handleDeleteOrder = (orderId: number) => {
    console.log("Eliminar orden:", orderId);
    // Aquí mostrarías un modal de confirmación
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
    >
      <span>{children}</span>
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ChevronUp size={14} />
        ) : (
          <ChevronDown size={14} />
        ))}
    </button>
  );

  if (isLoadingOts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando órdenes...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Error al cargar las OTs... intente nuevamente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Órdenes de Trabajo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona y da seguimiento a las órdenes de trabajo
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <Filter size={20} />
            <span>Filtros</span>
          </button>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Crear Orden de Trabajo</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === sortedOrders.length &&
                      sortedOrders.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="id">ID</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="tecnico">Técnico</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Comentario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                    selectedOrders.includes(order.id) &&
                      "bg-orange-50 dark:bg-orange-900/20",
                    index % 2 === 1 && "bg-gray-25 dark:bg-gray-800/50"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) =>
                        handleSelectOrder(order.id, e.target.checked)
                      }
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.id}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div
                      className="max-w-32 truncate"
                      title={order.tecnico?.fullName}
                    >
                      {order.tecnico?.fullName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="max-w-40 truncate" title={order.commentary}>
                      {order.commentary || (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                          S/ comentario
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadgeClass(
                        order.state
                      )}`}
                    >
                      {getEstadoLabel(order.state)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {formatDateText(getFechaFromOT(order))}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit gap-1",
                        getPrioridadClass(order.priority)
                      )}
                    >
                      {order.priority ?? "s/p"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditOrder(order.id)}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <MoreHorizontal className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              No hay órdenes
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No se encontraron órdenes con el término de búsqueda."
                : "Comienza creando una nueva orden de trabajo."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      {sortedOrders.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span className="font-medium">{sortedOrders.length}</span>{" "}
            órdenes
            {selectedOrders.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedOrders.length}</span>{" "}
                seleccionadas)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Página 1 de 1
          </div>
        </div>
      )}

      <BacklogOT
        onAsignar={(ot) => {
          setSelectedOT(ot);
          setOpenAsignarModal(true);
        }}
      />

      <CrearOTModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={(data) =>
          crearOTMutation.mutate(data, {
            onSuccess: () => {
              // ✅ resetea también desde el padre
              setOpenModal(false);
            },
          })
        }
      />

      <AsignarOTModal
        open={openAsignarModal}
        onClose={() => setOpenAsignarModal(false)}
        ot={selectedOT}
      />
    </div>
  );
}

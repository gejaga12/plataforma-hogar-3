import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Edit,
  Eye,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { cn } from "@/utils/cn";
import MovimientoModal from "./MovimientoModal";

export interface MovimientoIngresoEgreso {
  id: string;
  usuario: {
    id: string;
    nombreCompleto: string;
    rol: string;
    avatar?: string;
  };
  tipo: "INGRESO" | "EGRESO";
  fechaHora: string;
  modo: string;
  motivo: string;
  ubicacion?: {
    direccion: string;
    latitud?: number;
    longitud?: number;
  };
  dispositivo?: string;
  ipAddress?: string;
  observaciones?: string;
  registradoPor?: string;
  createdAt: string;
}

interface IngresoEgresoContentProps {
  movimientos: MovimientoIngresoEgreso[];
  isLoading: boolean;
  refetch: () => void;
  tipoConfig: Record<string, { label: string; color: string; icon: React.FC }>;
}

type SortField = "id" | "usuario" | "tipo" | "modo" | "fechaHora" | "motivo";
type SortDirection = "asc" | "desc";

const IngresoEgresoContent: React.FC<IngresoEgresoContentProps> = ({
  movimientos,
  isLoading,
  refetch,
  tipoConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [usuarioFilter, setUsuarioFilter] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [selectedMovimientos, setSelectedMovimientos] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("fechaHora");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "view";
    movimiento?: MovimientoIngresoEgreso;
  }>({
    isOpen: false,
    mode: "create",
  });

  const filteredMovimientos =
    movimientos?.filter((movimiento) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        movimiento.id.toLowerCase().includes(searchLower) ||
        movimiento.usuario.nombreCompleto.toLowerCase().includes(searchLower) ||
        movimiento.motivo.toLowerCase().includes(searchLower);

      const matchesTipo = !tipoFilter || movimiento.tipo === tipoFilter;
      const matchesUsuario =
        !usuarioFilter || movimiento.usuario.id === usuarioFilter;

      // Filtros de fecha
      let matchesFecha = true;
      if (fechaDesde || fechaHasta) {
        const movimientoDate = new Date(movimiento.fechaHora);
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          matchesFecha = matchesFecha && movimientoDate >= desde;
        }
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          matchesFecha = matchesFecha && movimientoDate <= hasta;
        }
      }

      return matchesSearch && matchesTipo && matchesUsuario && matchesFecha;
    }) || [];

  const sortedMovimientos = [...filteredMovimientos].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "usuario") {
      aValue = a.usuario.nombreCompleto;
      bValue = b.usuario.nombreCompleto;
    }

    if (sortField === "fechaHora") {
      aValue = new Date(a.fechaHora);
      bValue = new Date(b.fechaHora);
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
      setSelectedMovimientos(sortedMovimientos.map((mov) => mov.id));
    } else {
      setSelectedMovimientos([]);
    }
  };

  const handleSelectMovimiento = (movimientoId: string, checked: boolean) => {
    if (checked) {
      setSelectedMovimientos((prev) => [...prev, movimientoId]);
    } else {
      setSelectedMovimientos((prev) =>
        prev.filter((id) => id !== movimientoId)
      );
    }
  };

  const handleExportToExcel = () => {
    console.log("Exportar movimientos a Excel");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            📂 Ingreso-Egreso
          </h1>
          <p className="text-gray-600 mt-1">
            Registro de movimientos de entrada y salida
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Download size={20} />
            <span>Exportar a Excel</span>
          </button>

          <button
            onClick={() => setModalState({ isOpen: true, mode: "create" })}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por ID, usuario o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="INGRESO">Ingreso</option>
              <option value="EGRESO">Egreso</option>
            </select>
          </div>

          <div>
            <select
              value={usuarioFilter}
              onChange={(e) => setUsuarioFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los usuarios</option>
              {Array.from(
                new Set(
                  movimientos
                    ?.filter((m) => m.usuario)
                    .map((m) => m.usuario!.id) || []
                )
              ).map((userId) => {
                const usuario = movimientos?.find(
                  (m) => m.usuario?.id === userId
                )?.usuario;

                return (
                  <option key={userId} value={userId}>
                    {usuario?.nombreCompleto || "Usuario sin nombre"}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Fecha desde"
            />
          </div>

          <div>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Fecha hasta"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedMovimientos.length === sortedMovimientos.length &&
                      sortedMovimientos.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="id">ID</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="usuario">Usuario</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="tipo">Tipo</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="modo">Subtipo</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="fechaHora">Fecha y Hora</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="motivo">Motivo</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMovimientos.map((movimiento, index) => {
                const tipoInfo = tipoConfig[movimiento.tipo];
                const TipoIcon = tipoInfo.icon;

                return (
                  <tr
                    key={movimiento.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      selectedMovimientos.includes(movimiento.id) &&
                        "bg-orange-50",
                      index % 2 === 1 && "bg-gray-25"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedMovimientos.includes(movimiento.id)}
                        onChange={(e) =>
                          handleSelectMovimiento(
                            movimiento.id,
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      <span title={movimiento.id}>{movimiento.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {movimiento.usuario.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover mr-3"
                            src={movimiento.usuario.avatar}
                            alt={movimiento.usuario.nombreCompleto}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-white">
                              {movimiento.usuario.nombreCompleto
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movimiento.usuario.nombreCompleto}
                          </div>
                          <div className="text-xs text-gray-500">
                            {movimiento.usuario.rol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit",
                          tipoInfo.color
                        )}
                      >
                        <TipoIcon />
                        <span>{tipoInfo.label}</span>
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center">
                        <span className="text-xs text-gray-900 px-2 py-1 border border-gray-300 rounded-full">
                          {movimiento.modo || "N/E"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar size={14} className="text-gray-400 mr-1" />
                        {formatDateTime(movimiento.fechaHora)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div
                        className="max-w-sm truncate"
                        title={movimiento.motivo}
                      >
                        {movimiento.motivo}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {movimiento.ubicacion ? (
                        <div
                          className="flex items-center max-w-48 truncate\"
                          title={movimiento.ubicacion.direccion}
                        >
                          <MapPin
                            size={14}
                            className="text-gray-400 mr-1 flex-shrink-0"
                          />
                          {movimiento.ubicacion.direccion}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() =>
                            setModalState({
                              isOpen: true,
                              mode: "view",
                              movimiento,
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedMovimientos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Clock className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              No hay movimientos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ||
              tipoFilter ||
              usuarioFilter ||
              fechaDesde ||
              fechaHasta
                ? "No se encontraron movimientos con los filtros aplicados."
                : "No hay movimientos registrados en este momento."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedMovimientos.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Mostrando{" "}
            <span className="font-medium">{sortedMovimientos.length}</span>{" "}
            movimientos
            {selectedMovimientos.length > 0 && (
              <span className="ml-2">
                (
                <span className="font-medium">
                  {selectedMovimientos.length}
                </span>{" "}
                seleccionados)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Página 1 de 1</span>
          </div>
        </div>
      )}

      {/* Modal */}
      <MovimientoModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: "create" })}
        movimiento={modalState.movimiento}
        mode={modalState.mode}
      />
    </div>
  );
};

export default IngresoEgresoContent;

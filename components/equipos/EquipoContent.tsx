import { cn } from "@/utils/cn";
import {
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  QrCode,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EquipoForm } from "./equipo-form";
import { EquipoQR } from "./equipo-qr";
import { Equipo, EstadoEquipo } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EquipoService } from "@/utils/api/apiEquipo";
import { capitalizeFirstLetter } from "@/utils/normalize";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import QRsList from "./QRsList";
import TipoEquipoModal from "./TipoEquipoModal";
import ModalPortal from "../ui/ModalPortal";

type SortField = "nombre" | "fechaInstalacion";
type SortDirection = "asc" | "desc";

const EquiposContent = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("fechaInstalacion");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedEquipos, setSelectedEquipos] = useState<string[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRGeneratorModal, setShowQRGeneratorModal] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [generatedQR, setGeneratedQR] = useState<{
    id: string;
    qrCode: string;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipoToDelete, setEquipoToDelete] = useState<string | null>(null);
  const [showTipoEquipoModal, setShowTipoEquipoModal] = useState(false);

  const router = useRouter();

  const { data: equipos = [], isLoading } = useQuery<Equipo[]>({
    queryKey: ["equipos"],
    queryFn: EquipoService.listarEquipos,
  });

  // console.log('equipos:', equipos);

  const generarQRMutation = useMutation({
    mutationFn: EquipoService.generarQR,
    onSuccess: (data) => {
      setGeneratedQR(data);
      setShowQRGeneratorModal(true);

      queryClient.invalidateQueries({ queryKey: ["qrs-vacios"] });
    },
    onError: (error: any) => {
      console.error("Error generando QR:", error.message);
      toast.error("Error al generar el QR.");
    },
  });

  const { mutate: eliminarEquipo, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => EquipoService.eliminarEquipo(id),
    onSuccess: () => {
      toast.success("Equipo eliminado con éxito.");
      queryClient.invalidateQueries({ queryKey: ["equipos"] });
      closeDeleteModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar el equipo.");
    },
  });

  const filteredEquipos = equipos.filter((equipo) => {
    const matchesSearch =
      equipo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = !tipoFilter || equipo.type === tipoFilter;
    const matchesEstado = !estadoFilter || equipo.habilitado === estadoFilter;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  const sortedEquipos = [...filteredEquipos].sort((a, b) => {
    const getSortValue = (equipo: Equipo, field: SortField) => {
      switch (field) {
        case "nombre":
          return equipo.name?.toLowerCase() ?? "";
        default:
          return "";
      }
    };

    let aValue = getSortValue(a, sortField);
    let bValue = getSortValue(b, sortField);

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEquipos(sortedEquipos.map((equipo) => equipo.id ?? "-"));
    } else {
      setSelectedEquipos([]);
    }
  };

  const handleSelectEquipo = (equipoId: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipos((prev) => [...prev, equipoId]);
    } else {
      setSelectedEquipos((prev) => prev.filter((id) => id !== equipoId));
    }
  };


  const handleCreateEquipo = async (data: any) => {
    try {
      await EquipoService.crearEquipo(data);
      queryClient.invalidateQueries({ queryKey: ["equipos"] });
      setShowFormModal(false);
    } catch (error) {
      console.error("Error creating equipo:", error);
    }
  };

  const handleEditEquipo = async (data: any) => {
    console.log("editando equipo", equipos);
  };

  const handleCreateTipoEquipo = async (data: any) => {
    try {
      console.log("Creando tipo de equipo:", data);
      await EquipoService.crearEquipoAdmin(data);
      queryClient.invalidateQueries({ queryKey: ["tipos-equipos"] });
    } catch (error: any) {
      console.error("Error al crear el tipo de equipo:", error);
    }
  };

  const handleViewDetail = (equipoId: string) => {
    router.push(`/equipos/${equipoId}`);
  };

  const handleEdit = (equipo: Equipo) => {
    setEditingEquipo(equipo);
    setShowFormModal(true);
  };

  const handleDownloadQR = (equipo: Equipo) => {
    // Simular descarga del QR
    console.log(`Descargando QR para equipo: ${equipo.name}`);
  };

  const openDeleteModal = (id: string) => {
    setEquipoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEquipoToDelete(null);
  };

  const handleOpenTipoEquipoModal = () => {
    setShowTipoEquipoModal(true);
  };

  const handleCloseTipoEquipoModal = () => {
    setShowTipoEquipoModal(false);
  };

  const getEstadoColor = (estado: EstadoEquipo): string => {
    switch (estado) {
      case EstadoEquipo.OK:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";

      case EstadoEquipo.Reparacion:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";

      case EstadoEquipo.No_ok:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";

      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            🔧 Gestión de Equipos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra y da seguimiento a todos los equipos instalados
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleOpenTipoEquipoModal}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo tipo de Equipo</span>
          </button>
          <button
            onClick={() => generarQRMutation.mutate()}
            disabled={generarQRMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <QrCode size={20} />
            <span>Generar QR</span>
          </button>
          <button
            onClick={() => {
              setEditingEquipo(null);
              setShowFormModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Equipo</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar equipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los tipos</option>
            </select>
          </div>
          <div>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value={EstadoEquipo.OK}>Ok</option>
              <option value={EstadoEquipo.Reparacion}>Reparación</option>
              <option value={EstadoEquipo.No_ok}>No OK</option>
            </select>
          </div>
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
                      selectedEquipos.length === sortedEquipos.length &&
                      sortedEquipos.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  QR
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sucursal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ubicación exacta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Último mantenimiento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedEquipos.map((equipo, index) => (
                <tr
                  key={equipo.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                    selectedEquipos.includes(equipo.id ?? "-") &&
                      "bg-orange-50 dark:bg-orange-900/20",
                    index % 2 === 1 && "bg-gray-25 dark:bg-gray-800/50"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEquipos.includes(equipo.id ?? "-")}
                      onChange={(e) =>
                        handleSelectEquipo(equipo.id ?? "-", e.target.checked)
                      }
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetail(equipo.id ?? "-")}
                      className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Ver detalle del equipo"
                    >
                      <QrCode
                        size={20}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-48 truncate" title={equipo.name}>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {equipo.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full">
                      {capitalizeFirstLetter(equipo.type ?? "-")}
                    </span>
                  </td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">
                    <div className="max-w-48 truncate">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        -
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    -
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getEstadoColor(equipo.habilitado ?? "-")
                      )}
                    >
                      {equipo.habilitado.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDeleteModal(equipo.id!)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(equipo)}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDownloadQR(equipo)}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                        title="Descargar QR"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedEquipos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <MoreHorizontal className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              No hay equipos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || tipoFilter || estadoFilter
                ? "No se encontraron equipos con los filtros aplicados."
                : "Comienza agregando un nuevo equipo."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedEquipos.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando{" "}
            <span className="font-medium">{sortedEquipos.length}</span> equipos
            {selectedEquipos.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedEquipos.length}</span>{" "}
                seleccionados)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Página 1 de 1
          </div>
        </div>
      )}

      {/* tabla de qrs vacios */}
      <QRsList />

      {/* Modals */}
      <ModalPortal>
        {showFormModal && (
          <EquipoForm
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingEquipo(null);
            }}
            onSubmit={editingEquipo ? handleEditEquipo : handleCreateEquipo}
            equipo={editingEquipo}
            isLoading={isLoading}
          />
        )}

        {showQRModal && selectedEquipo && (
          <EquipoQR
            isOpen={showQRModal}
            onClose={() => {
              setShowQRModal(false);
              setSelectedEquipo(null);
            }}
            equipo={selectedEquipo}
          />
        )}

        <TipoEquipoModal
          onSubmit={handleCreateTipoEquipo}
          isOpen={showTipoEquipoModal}
          onClose={handleCloseTipoEquipoModal}
        />

        {/* Modal para QR generado sin datos */}
        {showQRGeneratorModal && generatedQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    QR Generado
                  </h2>
                  <button
                    onClick={() => setShowQRGeneratorModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    x
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 inline-block">
                    <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode
                          size={64}
                          className="text-gray-400 dark:text-gray-500 mx-auto mb-2"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {generatedQR.qrCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                    Instrucciones:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Imprime este código QR y pégalo en el equipo</li>
                    <li>
                      • Escanea el código con la app móvil para cargar los datos
                    </li>
                    <li>• El equipo quedará vinculado a este código único</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      console.log("Descargando QR:", generatedQR.qrCode);
                      // Aquí implementarías la descarga del QR
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Download size={16} />
                    <span>Descargar</span>
                  </button>

                  <button
                    onClick={() => {
                      console.log("Imprimiendo QR:", generatedQR.qrCode);
                      window.print();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <QrCode size={16} />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={() => {
            if (equipoToDelete) {
              eliminarEquipo(equipoToDelete);
            }
          }}
          isLoading={isDeleting}
          title="Eliminar Equipo"
          message="¿Seguro que deseas eliminar este equipo? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      </ModalPortal>
    </div>
  );
};

export default EquiposContent;

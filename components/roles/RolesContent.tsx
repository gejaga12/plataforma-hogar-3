import { CreateRoleData, RoleList } from "@/app/roles/page";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "../ui/loading-spinner";
import RoleFormModal from "./RoleFormModal";
import DeleteConfirmModal from "./RoleDeleteModal";
import { ApiRoles, Permiso } from "@/lib/api/apiRoles";
import { useQuery } from "@tanstack/react-query";

type SortField = "nombre" | "usuariosAsignados" | "vistasPermitidas";
type SortDirection = "asc" | "desc";

interface Props {
  roles: RoleList[];
  isLoading: boolean;
  modalState: {
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    role?: RoleList;
  };
  setModalState: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      mode: "create" | "edit" | "view";
      role?: RoleList;
    }>
  >;
  deleteModal: {
    isOpen: boolean;
    role?: RoleList;
  };
  setDeleteModal: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      role?: RoleList;
    }>
  >;
  createRole: (data: CreateRoleData) => void;
  updateRole: (id: string, data: Partial<CreateRoleData>) => void;
  deleteRole: (id: string) => void;
  isDeleting: boolean;
}

const RolesContent = ({
  roles,
  isLoading,
  modalState,
  setModalState,
  deleteModal,
  setDeleteModal,
  createRole,
  updateRole,
  deleteRole,
  isDeleting,
}: Props) => {
  const { users } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("nombre");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteRole = (role: RoleList) => {
    setDeleteModal({ isOpen: true, role });
  };

  const confirmDelete = () => {
    if (deleteModal.role) deleteRole(deleteModal.role.id);
  };

  const getVistaLabel = (vistaId: string) => {
    return availableViews?.find((v) => v.key === vistaId)?.label || vistaId;
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

  const {
    data: availableViews,
    isLoading: isLoadingPermissions,
    error: errorPermissions,
  } = useQuery<Permiso[]>({
    queryKey: ["permisos-disponibles"],
    queryFn: ApiRoles.obtenerPermisosDisponibles,
  });

  if (isLoading || isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los roles y permisos del sistema
          </p>
        </div>

        <button
          onClick={() => setModalState({ isOpen: true, mode: "create" })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Crear Rol</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar roles por nombre o vistas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="nombre">Nombre del Rol</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="usuariosAsignados">
                    Usuarios Asignados
                  </SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="vistasPermitidas">Permisos</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role, index) => (
                <tr
                  key={role.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selectedRoles.includes(role.id) && "bg-orange-50",
                    index % 2 === 1 && "bg-gray-25"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Shield className="text-orange-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-900">
                        {role.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Users className="text-gray-400 mr-1" size={14} />
                      <span className="text-sm text-gray-900">
                        {role.users?.length || 0}
                      </span>
                      {role.users && role.users.length > 0 && (
                        <div
                          className="ml-2 max-w-32 truncate"
                          title={role.users.join(", ")}
                        >
                          <span className="text-xs text-gray-500">
                            {role.users.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Settings className="text-gray-400 mr-1" size={14} />
                      <span className="text-sm text-gray-900">
                        {role.permissions.length}
                      </span>
                      {role.permissions.length > 0 && (
                        <div
                          className="ml-2 max-w-40 truncate"
                          title={role.permissions.map(getVistaLabel).join(", ")}
                        >
                          <span className="text-xs text-gray-500">
                            {role.permissions.map(getVistaLabel).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setModalState({ isOpen: true, mode: "view", role })
                        }
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setModalState({ isOpen: true, mode: "edit", role })
                        }
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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

        {roles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Shield className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No hay roles</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "No se encontraron roles con el término de búsqueda."
                : "Comienza creando un nuevo rol."}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <RoleFormModal
        createRole={createRole}
        updateRole={updateRole}
        fetchUsers={users}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: "create" })}
        role={modalState.role}
        mode={modalState.mode}
        availableViews={availableViews || []}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        roleName={deleteModal.role?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RolesContent;

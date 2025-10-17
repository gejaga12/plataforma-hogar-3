import { CreateRoleData, RoleList } from "@/app/roles/page";
import { Edit, Eye, Plus, Settings, Shield, Trash2, Users } from "lucide-react";
import React from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import RoleFormModal from "./RoleFormModal";
import DeleteConfirmModal from "./RoleDeleteModal";
import { ApiRoles, Permiso } from "@/utils/api/apiRoles";
import { useQuery } from "@tanstack/react-query";
import ModalPortal from "../ui/ModalPortal";

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
  const handleDeleteRole = (role: RoleList) => {
    setDeleteModal({ isOpen: true, role });
  };

  const confirmDelete = () => {
    if (deleteModal.role) deleteRole(deleteModal.role.id);
  };

  const { data: availableViews, isLoading: isLoadingPermissions } = useQuery<
    Permiso[]
  >({
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-400">
            Roles
          </h1>
          <p className="text-gray-900 dark:text-gray-400 mt-1">
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre del Rol
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuarios Asignados
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Permisos
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900">
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* nombre */}
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Shield className="text-orange-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-400">
                        {role.name}
                      </span>
                    </div>
                  </td>
                  {/* usuarios */}
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Users className="text-gray-400 mr-1" size={14} />
                      <span className="text-sm text-gray-900 dark:text-gray-400">
                        {role.users?.length || 0}
                      </span>
                      {role.users && role.users.length > 0 && (
                        <div className="ml-2 max-w-32 truncate">
                          <span className="text-xs text-gray-700 dark:text-gray-400">
                            {role.users.map((u) => u.fullName).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  {/* permisos */}
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Settings className="text-gray-400 mr-1" size={14} />
                      <span className="text-sm text-gray-900 dark:text-gray-400">
                        {role.permissions.length}
                      </span>
                    </div>
                  </td>
                  {/* acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setModalState({ isOpen: true, mode: "view", role })
                        }
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setModalState({ isOpen: true, mode: "edit", role })
                        }
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 transition-colors"
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
          </div>
        )}
      </div>

      {/* Modals */}
      <ModalPortal>
        <RoleFormModal
          createRole={createRole}
          updateRole={updateRole}
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
      </ModalPortal>
    </div>
  );
};

export default RolesContent;

import { CreateRoleData, Role } from "@/app/roles/page";
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { UserLaboral } from "@/utils/types";
import { X } from "lucide-react";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
  mode: "create" | "edit" | "view";
  fetchUsers: UserLaboral[];
  createRole: (data: CreateRoleData) => void;
  updateRole: (id: string, data: Partial<CreateRoleData>) => void;
  availableViews: { key: string; label: string }[];
}

const RoleFormModal = ({
  isOpen,
  onClose,
  role,
  mode,
  fetchUsers,
  createRole,
  updateRole,
  availableViews,
}: RoleFormModalProps) => {
  const [formData, setFormData] = useState<CreateRoleData>({
    name: "",
    users: [],
    permissions: [],
  });
  const [areasExpandidas, setAreasExpandidas] = useState<
    Record<string, boolean>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      setFormData({
        name: role?.name || "",
        users: role?.users || [],
        permissions: role?.permissions.map((p) => ({ key: p, label: p })) || [],
      });
    } else {
      setFormData({
        name: "",
        users: [],
        permissions: [],
      });
    }
  }, [role, mode]);

  const isReadOnly = mode === "view";

  // console.log(availableViews);

  const permisosPorArea = availableViews
    .filter(
      (permiso) => typeof permiso.key === "string" && permiso.key.includes(":")
    )
    .reduce((acc, permiso) => {
      const [area, accion] = permiso.key.split(":");
      if (!acc[area]) acc[area] = [];
      acc[area].push({ key: permiso.key, accion, label: permiso.label });
      return acc;
    }, {} as Record<string, { key: string; accion: string; label: string }[]>);

  const isPermisoSeleccionado = (key: string) =>
    formData.permissions?.some((p) => p.key === key);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createRole(formData);
      } else if (mode === "edit" && role) {
        await updateRole(role.id, formData);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserChange = (userId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      users: checked
        ? [...prev.users, userId]
        : prev.users.filter((id) => id !== userId),
    }));
  };

  const handleVistaChange = (vistaId: string, checked: boolean) => {
    setFormData((prev) => {
      const already = prev.permissions?.map((p) => p.key);
      return {
        ...prev,
        permissions: checked
          ? [...(prev.permissions ?? []), { key: vistaId, label: vistaId }]
          : (prev.permissions ?? []).filter((p) => p.key !== vistaId),
      };
    });
  };

  const handlePermisoChange = (permisoKey: string, checked: boolean) => {
    setFormData((prev) => {
      const actual = prev.permissions ?? [];
      return {
        ...prev,
        permissions: checked
          ? [...actual, { key: permisoKey, label: permisoKey }]
          : actual.filter((p) => p.key !== permisoKey),
      };
    });
  };

  const isVistaSelected = (vistaId: string) =>
    formData.permissions?.some((p) => p.key === vistaId);

  const toggleArea = (area: string) => {
    setAreasExpandidas((prev) => ({
      ...prev,
      [area]: !prev[area],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create" && "Crear Nuevo Rol"}
              {mode === "edit" && "Editar Rol"}
              {mode === "view" && "Detalles del Rol"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Información Básica
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Usuarios Asignados */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Usuarios Asignados
              </h3>

              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {fetchUsers?.map((user) => (
                  <label key={user.id} className="flex items-center py-2">
                    <input
                      type="checkbox"
                      checked={formData.users.includes(user.id)}
                      onChange={(e) =>
                        handleUserChange(user.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      disabled={isReadOnly}
                    />
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Permisos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Permisos</h3>

            <div className="space-y-3">
              {Object.entries(permisosPorArea).map(([area, permisos]) => {
                const algunoSeleccionado = permisos.some((p) =>
                  isPermisoSeleccionado(p.key)
                );
                const isExpanded = areasExpandidas[area] || false;

                return (
                  <div
                    key={area}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={algunoSeleccionado}
                          onChange={(e) => {
                            permisos.forEach((p) =>
                              handlePermisoChange(p.key, e.target.checked)
                            );
                          }}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          disabled={isReadOnly}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {area.charAt(0).toUpperCase() + area.slice(1)}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleArea(area)}
                        className="text-sm text-orange-600 underline"
                      >
                        {isExpanded ? "Ocultar acciones" : "Ver acciones"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 ml-4">
                        {permisos.map((permiso) => (
                          <label
                            key={permiso.key}
                            className="flex items-center text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={isPermisoSeleccionado(permiso.key)}
                              onChange={(e) =>
                                handlePermisoChange(
                                  permiso.key,
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              disabled={isReadOnly}
                            />
                            <span className="ml-1 capitalize">
                              {permiso.accion}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">
                      {mode === "create" ? "Creando..." : "Guardando..."}
                    </span>
                  </>
                ) : mode === "create" ? (
                  "Crear Rol"
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;

import { CreateRoleData, RoleList } from "@/app/roles/page";
import React, { useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";

import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: RoleList;
  mode: "create" | "edit" | "view";
  createRole: (data: CreateRoleData) => void;
  updateRole: (id: string, data: Partial<CreateRoleData>) => void;
  availableViews: { key: string; label: string }[];
}

const RoleFormModal = ({
  isOpen,
  onClose,
  role,
  mode,
  createRole,
  updateRole,
  availableViews,
}: RoleFormModalProps) => {
  const { usuarios } = useAuth();

  const [formData, setFormData] = useState<CreateRoleData>({
    name: "",
    users: [],
    permissions: [],
  });
  const [areasExpandidas, setAreasExpandidas] = useState<
    Record<string, boolean>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      setFormData({
        id: role?.id,
        name: role?.name || "",
        users: role?.users.map((u) => u.id) || [],
        permissions:
          role?.permissions.map((p: any) => ({ key: p, label: p })) || [],
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
      console.log(formData);
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

  const toggleArea = (area: string) => {
    setAreasExpandidas((prev) => ({
      ...prev,
      [area]: !prev[area],
    }));
  };

  const filteredUsuarios = useMemo(() => {
    const term = searchUser.toLowerCase();
    return (
      usuarios?.filter(
        (u) =>
          u.fullName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      ) ?? []
    );
  }, [usuarios, searchUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-400">
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

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">
                Información Básica
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-400 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                  required
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Usuarios Asignados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">
                  {isReadOnly ? "Usuarios asignados" : "Asignar usuario/s"}
                </h3>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="text-sm px-3 py-2 border border-gray-300 rounded-md dark:border-gray-500 dark:bg-gray-700 dark:text-gray-400 focus:outline-none"
                />
              </div>
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 dark:border-gray-700">
                {isReadOnly ? (
                  formData.users.length === 0 ? (
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Sin usuarios asignados
                    </span>
                  ) : (
                    <ul className="space-y-2">
                      {filteredUsuarios
                        ?.filter((user) => formData.users.includes(String(user.id)))
                        .map((user) => (
                          <li key={user.id} className="text-sm text-gray-900">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {user.fullName}
                            </span>{" "}
                            –{" "}
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {user.email}
                            </span>
                          </li>
                        ))}
                    </ul>
                  )
                ) : (
                  filteredUsuarios?.map((user) => (
                    <label key={user.id} className="flex items-center py-2">
                      <input
                        type="checkbox"
                        checked={formData.users.includes(String(user.id))}
                        onChange={(e) =>
                          handleUserChange(String(user.id), e.target.checked)
                        }
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        disabled={isReadOnly}
                      />
                      <div className="ml-2">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </label>
                  ))
                )}
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
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
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
                        <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                          {area.charAt(0).toUpperCase() + area.slice(1)}
                        </span>
                      </label>
                      {area !== "all" && (
                        <button
                          type="button"
                          onClick={() => toggleArea(area)}
                          className="text-sm text-orange-600 underline"
                        >
                          {isExpanded ? "Ocultar acciones" : "Ver acciones"}
                        </button>
                      )}
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
                            <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                              {permiso.label}
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

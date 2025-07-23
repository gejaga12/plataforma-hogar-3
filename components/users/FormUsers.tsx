import React, { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { CreateUserData } from "@/utils/types";

interface FormUsersProps {
  handleSubmit: (e: React.FormEvent) => void;
  setFormData: React.Dispatch<React.SetStateAction<CreateUserData>>;
  handleRoleChange: (id: string, checked: boolean) => void;
  onClose: () => void;
  formData: CreateUserData;
  isReadOnly: boolean;
  isloading: boolean;
  mode: "create" | "edit" | "view";
  rolesDisponibles: Record<string, string>;
}

const FormUsers: React.FC<FormUsersProps> = ({
  handleSubmit,
  setFormData,
  onClose,
  handleRoleChange,
  formData,
  isReadOnly,
  isloading,
  mode,
  rolesDisponibles,
}) => {
  const [showInputs, setShowInputs] = useState(false);

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/*INFORMACION PERSONAL */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.nombreCompleto ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nombreCompleto: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    telefono: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isReadOnly}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.mail}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mail: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    direccion: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isReadOnly}
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fechaNacimiento: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Contraseña (futura funcionalidad) */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.contrasena ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contrasena: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isReadOnly}
            />
          </div>
          </div>
        </div>

        {/* Información Laboral */}
        <button
          type="button"
          className="p-2 rounded-md w-auto bg-orange-500 hover:bg-orange-600 text-xs font-semibold text-white"
          onClick={() => setShowInputs((prev) => !prev)}
        >
          {showInputs
            ? "Ocultar Informacion Laboral"
            : "Mostrar Informacion laboral"}
        </button>

        {showInputs && (
          <div className="px-2 py-3 bg-gray-100">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Información Laboral
                </h3>

                {/* Puesto * */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puesto *
                  </label>
                  <input
                    type="text"
                    value={formData.puesto ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        puesto: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required={mode === "create"}
                    disabled={isReadOnly}
                  />
                </div>

                {/* Area * */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área *
                  </label>
                  <select
                    value={formData.area ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, area: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required={mode === "create"}
                    disabled={isReadOnly}
                  >
                    <option value="">Seleccionar área</option>
                    <option value="IT">IT</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Administración">Administración</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                  </select>
                </div>

                {/* Zona * */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zona *
                  </label>
                  <select
                    value={formData.zona ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, zona: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required={mode === "create"}
                    disabled={isReadOnly}
                  >
                    <option value="">Seleccionar zona</option>
                    <option value="CABA">CABA</option>
                    <option value="GBA">GBA</option>
                    <option value="NEA">NEA</option>
                    <option value="NOA">NOA</option>
                    <option value="Cuyo">Cuyo</option>
                    <option value="Patagonia">Patagonia</option>
                  </select>
                </div>

                {/* Sucursal Hogar * */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sucursal Hogar *
                  </label>
                  <select
                    value={formData.sucursalHogar ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sucursalHogar: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required={mode === "create"}
                    disabled={isReadOnly}
                  >
                    <option value="">Seleccionar sucursal</option>
                    <option value="Sede Central">Sede Central</option>
                    <option value="Sucursal Norte">Sucursal Norte</option>
                    <option value="Sucursal Sur">Sucursal Sur</option>
                    <option value="Sucursal Este">Sucursal Este</option>
                    <option value="Sucursal Oeste">Sucursal Oeste</option>
                  </select>
                </div>
              </div>

              {/* Contrato y Fechas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Información Contractual
                </h3>
                {/* Fecha de ingreso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Ingreso *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaIngreso}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fechaIngreso: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required={mode === "create"}
                    disabled={isReadOnly}
                  />
                </div>

                {/* Tipo de Contrato **/}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Contrato *
                  </label>
                  <select
                    value={formData.tipoContrato}
                    onChange={(e) => {
                      const value = e.target.value as
                        | "Relacion de Dependencia"
                        | "Freelance"
                        | "Contratista";
                      setFormData((prev) => {
                        const updated = { ...prev, tipoContrato: value };

                        return updated;
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required={mode === "create"}
                    disabled={isReadOnly}
                  >
                    <option value="Relación de Dependencia">
                      Relación de Dependencia
                    </option>
                    <option value="Freelance">Freelance</option>
                    <option value="Contratista">Contratista</option>
                  </select>
                </div>

                {/* Estado Contractual * */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado Contractual *
                  </label>
                  <select
                    value={formData.relacionLaboral}
                    onChange={(e) => {
                      const value = e.target.value as
                        | "Periodo de Prueba"
                        | "Contratado";
                      setFormData((prev) => {
                        const updated = { ...prev, relacionLaboral: value };
                        return updated;
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required={mode === "create"}
                    disabled={isReadOnly}
                  >
                    <option value="Periodo de Prueba">Periodo de Prueba</option>
                    <option value="Contratado">Contratado</option>
                  </select>
                </div>

                {/* Certificaciones y titulos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificaciones/Título
                  </label>
                  <input
                    type="text"
                    value={formData.certificacionesTitulo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        certificacionesTitulo: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roles y Configuraciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Roles y Configuraciones
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Columna izquierda: Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles *
              </label>
              <div className="space-y-2">
                {Object.entries(rolesDisponibles).map(([nombre, id]) => (
                  <label key={id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(id)}
                      onChange={(e) => handleRoleChange(id, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      disabled={isReadOnly}
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {nombre}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Columna derecha: Usuario activo y notificaciones */}
            <div className="space-y-6">
              {/* Usuario activo */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        activo: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    disabled={isReadOnly}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Usuario Activo
                  </span>
                </label>
              </div>

              {/* Notificaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notificaciones
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificaciones?.mail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notificaciones: {
                            ...prev.notificaciones!,
                            mail: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      disabled={isReadOnly}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notificaciones por Email
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificaciones?.push}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notificaciones: {
                            ...prev.notificaciones!,
                            push: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      disabled={isReadOnly}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notificaciones Push
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isloading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isloading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isloading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {mode === "create" ? "Creando..." : "Guardando..."}
                  </span>
                </>
              ) : mode === "create" ? (
                "Crear Usuario"
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default FormUsers;

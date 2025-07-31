import React, { useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { CreateUserData, Zona } from "@/utils/types";
import { Eye, EyeOff } from "lucide-react";
import { useJerarquia } from "@/hooks/useJerarquia";
import FormDatosLaborales, { FormDataLabor } from "./FormDatosLaborales";

interface FormUsersProps {
  handleSubmit: (e: React.FormEvent) => void;
  formData: CreateUserData;
  setFormData: React.Dispatch<React.SetStateAction<CreateUserData>>;
  handleRoleChange: (id: string, checked: boolean) => void;
  onClose: () => void;
  zonas: Zona[];
  isReadOnly: boolean;
  isloading: boolean;
  mode: "create" | "edit" | "view";
  rolesDisponibles: Record<string, string>;
  formDataLabor: FormDataLabor;
  setFormDataLabor: React.Dispatch<React.SetStateAction<FormDataLabor>>;
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
  formDataLabor,
  setFormDataLabor,
  zonas,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const { areas, isLoading: isLoadingAreas } = useJerarquia();

  useEffect(() => {
    if (
      mode === "edit" &&
      zonas.length > 0 &&
      formData.zona &&
      !zonas.some((z) => z.id === formData.zona?.id)
    ) {
      const zonaEncontrada = zonas.find((z) => z.name === formData.zona?.name);
      if (zonaEncontrada) {
        setFormData((prev) => ({
          ...prev,
          zona: {
            id: zonaEncontrada.id,
            name: zonaEncontrada.name,
          },
        }));
      }
    }
  }, [zonas, mode, formData.zona, setFormData]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="p-6 space-y-6 dark:bg-gray-900"
      >
        {/*INFORMACION PERSONAL */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-400">
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                disabled={isReadOnly}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                Email *
              </label>
              <input
                type="email"
                value={formData.mail}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mail: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                disabled={isReadOnly}
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fechaNacimiento: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Contraseña */}
            {!isReadOnly && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                  Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.contrasena ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contrasena: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                  disabled={isReadOnly}
                />
                <button
                  type="button"
                  className="absolute top-9 right-3 text-gray-500 dark:text-gray-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            )}

            {/* Zona * */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                Zona *
              </label>
              {isloading ? (
                <LoadingSpinner size="sm" />
              ) : isReadOnly ? (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                  {formData.zona?.name || "Sin asignar"}
                </div>
              ) : (
                <select
                  value={formData.zona?.id ?? ""}
                  onChange={(e) => {
                    const zonaSeleccionada = zonas.find(
                      (z) => z.id === e.target.value
                    );
                    if (zonaSeleccionada) {
                      setFormData((prev) => ({
                        ...prev,
                        zona: {
                          id: zonaSeleccionada.id,
                          name: zonaSeleccionada.name,
                        },
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-800"
                  required={mode === "create"}
                  disabled={isReadOnly}
                >
                  <option value="">Seleccionar zona</option>
                  {zonas.map((zona) => (
                    <option key={zona.id} value={zona.id}>
                      {zona.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Sucursal Hogar * */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                Sucursal Hogar *
              </label>
              <select
                value={formData.sucursalHogar ?? ""}
                onChange={(e: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    sucursalHogar: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-800"
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
        </div>

        <FormDatosLaborales
          formDataLabor={formDataLabor}
          setFormDataLabor={setFormDataLabor}
          isReadOnly={isReadOnly}
          mode={mode}
          areas={areas}
          isLoadingAreas={isLoadingAreas}
        />

        {/* Roles y Configuraciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-400">
            Roles y Configuraciones
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Columna izquierda: Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">
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
                    <span className="ml-2 text-sm text-gray-700 capitalize dark:text-gray-500">
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
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Usuario Activo
                  </span>
                </label>
              </div>

              {/* Notificaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">
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
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
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
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
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
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-gray-400"
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

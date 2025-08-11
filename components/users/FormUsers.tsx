import React, { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  CreateUserData,
  SucursalHogar,
  UserAdapted,
  Zona,
} from "@/utils/types";
import { Eye, EyeOff, Plus } from "lucide-react";
import FormDatosLaborales, { FormDataLabor } from "./FormDatosLaborales";
import { SucursalHogarService } from "@/api/apiSucursalHogar";
import { useQuery } from "@tanstack/react-query";
import { PhoneForm, PhoneType } from "@/api/apiTel";
import TelefonosModal from "./TelefonosModal";

interface FormUsersProps {
  user: UserAdapted | undefined;
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

// helper para mostrar el tipo lindo
const phoneTypeLabel: Record<PhoneType, string> = {
  [PhoneType.PRIMARY]: "Principal",
  [PhoneType.SEC]: "Secundario",
  [PhoneType.EM]: "Emergencia",
};

const FormUsers: React.FC<FormUsersProps> = ({
  handleSubmit,
  setFormData,
  onClose,
  handleRoleChange,
  setFormDataLabor,
  formData,
  isReadOnly,
  isloading,
  mode,
  rolesDisponibles,
  formDataLabor,
  zonas,
  user,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState<PhoneForm[]>([]);

  const { data: sucursales, isLoading: isLoadingSucursales } = useQuery({
    queryKey: ["sucursalesHogar"],
    queryFn: SucursalHogarService.getAllSucursalesHogar,
  });

  // abrir modal, precargando con lo existente o una fila vacía
  const openPhoneModal = () => {
    if (Array.isArray(formData.telefono) && formData.telefono.length > 0) {
      setPhoneDraft(formData.telefono);
    } else {
      setPhoneDraft([{ tel: "", phoneType: PhoneType.PRIMARY }]);
    }
    setShowPhoneModal(true);
  };

  const addPhoneRow = () => {
    setPhoneDraft((prev) => [...prev, { tel: "", phoneType: PhoneType.SEC }]);
  };

  const removePhoneRow = (idx: number) => {
    setPhoneDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const savePhones = () => {
    const clean = phoneDraft
      .map((p) => ({
        ...p,
        tel: p.tel.trim(),
      }))
      .filter((p) => p.tel !== "");

    setFormData((prev) => ({
      ...prev,
      telefono: clean, // ya es PhoneForm[]
    }));

    setShowPhoneModal(false);
  };

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
              <div className="flex items-center gap-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                  Teléfonos
                </label>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={openPhoneModal}
                    className="mb-1 rounded-full border text-green-500 hover:text-green-600 dark:text-green-400"
                    title="Agregar teléfono"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {/* Contenedor que muestra la lista guardada */}
              <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-md p-2">
                {Array.isArray(formData.telefono) &&
                formData.telefono.length > 0 ? (
                  formData.telefono.map((p, i) => (
                    <div
                      key={`${p.tel}-${i}`}
                      className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <span className="text-sm dark:text-gray-200">
                        {p.tel}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-300 dark:text-orange-900">
                        {phoneTypeLabel[p.phoneType]}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 rounded-md border border-dashed border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    {isReadOnly
                      ? "Sin teléfonos"
                      : "No hay teléfonos. Clic en Agregar."}
                  </div>
                )}
              </div>
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
                disabled={isReadOnly || isLoadingSucursales}
              >
                <option value="">Seleccionar sucursal</option>

                {sucursales?.map((sucursal: SucursalHogar) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <FormDatosLaborales
          formDataLabor={formDataLabor}
          setFormDataLabor={setFormDataLabor}
          isReadOnly={isReadOnly}
          mode={mode}
          user={user}
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
                      className="accent-blue-600 dark:accent-violet-700"
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
                    className="accent-blue-600 dark:accent-violet-700"
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
                      className="accent-blue-600 dark:accent-violet-700"
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
                      className="accent-blue-600 dark:accent-violet-700"
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

      {/* --- Modal chico para gestionar teléfonos --- */}
      {showPhoneModal && (
        <TelefonosModal
          setShowPhoneModal={setShowPhoneModal}
          phoneDraft={phoneDraft}
          setPhoneDraft={setPhoneDraft}
          savePhones={savePhones}
          addPhoneRow={addPhoneRow}
          removePhoneRow={removePhoneRow}
        />
      )}
    </>
  );
};

export default FormUsers;

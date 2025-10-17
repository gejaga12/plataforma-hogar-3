import React, { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { UserAdapted, Zona } from "@/utils/types";
import { Eye, EyeOff, Plus } from "lucide-react";
import FormDatosLaborales, { FormDataLabor } from "./FormDatosLaborales";
import { useQuery } from "@tanstack/react-query";
import { PhoneForm, PhoneType } from "@/utils/api/apiTel";
import TelefonosModal from "./TelefonosModal";
import { SucursalesService } from "@/utils/api/apiSucursales";
import { CreateUserData } from "@/utils/api/apiAuth";
import { cn } from "@/utils/cn";

// helpers para mostrar tipo de telefono
const phoneTypeLabel: Record<PhoneType, string> = {
  [PhoneType.PRIMARY]: "Principal",
  [PhoneType.SEC]: "Secundario",
  [PhoneType.EM]: "Emergencia",
};

const PHONE_BADGE_STYLES: Record<PhoneType, string> = {
  [PhoneType.PRIMARY]:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  [PhoneType.SEC]:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800",
  [PhoneType.EM]:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
};

const TypeBadge: React.FC<{ type: PhoneType }> = ({ type }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      "shadow-sm ring-1 ring-black/0", // leve relieve
      PHONE_BADGE_STYLES[type]
    )}
    title={phoneTypeLabel[type]}
  >
    {/* opcional: mini dot de color */}
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        type === PhoneType.PRIMARY && "bg-blue-500",
        type === PhoneType.SEC && "bg-slate-500",
        type === PhoneType.EM && "bg-rose-500"
      )}
    />
    {phoneTypeLabel[type]}
  </span>
);

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
  showOnlyRequired?: boolean;
  visibleFields: readonly string[];
  phones: PhoneForm[];
  onPhonesChange: (p: PhoneForm[]) => void;
  onAssignZona: (zonaId: string, userId: number) => void | Promise<void>;
  onAssignSucursal: (sucId: string, userId: number) => Promise<void> | void;
}

const FormUsers: React.FC<FormUsersProps> = ({
  handleSubmit,
  onAssignZona,
  onAssignSucursal,
  setFormData,
  onClose,
  handleRoleChange,
  setFormDataLabor,
  onPhonesChange,
  formData,
  isReadOnly,
  isloading,
  mode,
  rolesDisponibles,
  formDataLabor,
  zonas,
  user,
  visibleFields,
  phones,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState<PhoneForm[]>([]);

  const { data: sucursales = [], isLoading: isLoadingSucursales } = useQuery({
    queryKey: ["sucursalesHogar"],
    queryFn: SucursalesService.getAllSucursalesHogar,
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

  // abrir modal, precargando con lo existente o una fila vacía
  const openPhoneModal = () => {
    if (Array.isArray(phones) && phones.length > 0) {
      setPhoneDraft(phones);
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
      .map((p) => ({ ...p, tel: (p.tel ?? "").replace(/\D/g, "").trim() }))
      .filter((p) => p.tel !== "");
    onPhonesChange(clean); // ← usar prop del padre
    setShowPhoneModal(false);
  };

  const can = (field: string) => visibleFields?.includes(field);

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
            {can("fullName") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.fullName ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                  required
                  disabled={isReadOnly}
                />
              </div>
            )}

            {/* Teléfono */}
            {can("telefono") && (
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
                  {Array.isArray(phones) && phones.length > 0 ? (
                    phones.map((p, i) => (
                      <div
                        key={`${p.tel}-${i}`}
                        className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-gray-800/60 px-3 py-2"
                      >
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 tracking-wide">
                          {p.tel}
                        </span>
                        <TypeBadge type={p.phoneType} />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 px-1 py-0.5">
                      {isReadOnly
                        ? "Sin teléfonos"
                        : "No hay teléfonos. Clic en Agregar."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            {can("email") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                  required
                  disabled={isReadOnly}
                />
              </div>
            )}

            {/* Dirección */}
            {can("address") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800"
                  disabled={isReadOnly}
                />
              </div>
            )}

            {/* Fecha de Nacimiento */}
            {can("fechaNacimiento") && (
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
            )}

            {/* Contraseña */}
            {!isReadOnly && can("password") && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                  Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
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
          </div>
        </div>

        {mode !== "create" && (
          <FormDatosLaborales
            formDataLabor={formDataLabor}
            setFormDataLabor={setFormDataLabor}
            isReadOnly={isReadOnly}
            mode={mode}
            user={user}
            zonas={zonas}
            sucursales={sucursales ?? []}
            isLoading={isLoadingSucursales}
            onAssignZona={onAssignZona}
            onAssignSucursal={onAssignSucursal}
          />
        )}

        {/* Roles y Configuraciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-400">
            Roles y Configuraciones
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Columna izquierda: Roles */}
            {can("roles") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">
                  Roles *
                </label>
                <div className="space-y-2">
                  {Object.entries(rolesDisponibles).map(([nombre, id]) => (
                    <label key={id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(id as any)}
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
            )}
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

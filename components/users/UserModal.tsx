import { UserAdapted, Zona } from "@/utils/types";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import FormUsers from "./FormUsers";
import { EstadoContractual, FormDataLabor } from "./FormDatosLaborales";
import { toDateInputValue } from "@/utils/formatDate";
import { PhoneForm, PhoneType } from "@/utils/api/apiTel";
import { CreateUserData } from "@/utils/api/apiAuth";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserAdapted;
  mode: "create" | "edit" | "view";
  onSubmit: (payload: {
    user: CreateUserData;
    labor?: FormDataLabor;
    phones?: PhoneForm[];
  }) => void;
  onAssignZona: (zonaId: string, userId: number) => Promise<void> | void;
  onAssignSucursal: (sucId: string, userId: number) => Promise<void> | void;
  rolesDisponibles: Record<string, string>;
  isloading: boolean;
  zonas: Zona[];
}

const initialFormData: CreateUserData = {
  fullName: "",
  email: "",
  roles: [],
  password: "",
  address: "",
  fechaNacimiento: "",
};

const initialLabor: FormDataLabor = {
  tipoDeContrato: "",
  relacionLaboral: undefined,
  fechaIngreso: "",
  fechaAlta: "",
  cuil: undefined,
  categoryArca: "",
  antiguedad: "",
  horasTrabajo: "",
  sueldo: undefined,
  puestos: [],
  area: "",
  zona: undefined,
  sucursalHogar: undefined,
  notificaciones: { mail: true, push: false },
  photoURL: "",
  certificacionesTitulo: "",
};

const UserModal: React.FC<UserModalProps> = ({
  onSubmit,
  onClose,
  onAssignZona,
  onAssignSucursal,
  isOpen,
  user,
  mode,
  rolesDisponibles,
  isloading,
  zonas,
}) => {
  const visibleFields =
    mode === "create"
      ? ([
          "fullName",
          "email",
          "password",
          "telefono",
          "fechaNacimiento",
          "address",
          "roles",
        ] as const)
      : // en edit/view, mostra todo (los del create + los demás que tu FormUsers soporte)
        ([
          "fullName",
          "email",
          "password",
          "telefono",
          "fechaNacimiento",
          "address",
          "roles",
          "zona",
          "jerarquia",
          "sucursalHogar",
          "isActive",
          "notificaciones",
          "photoURL",
          "certificacionesTitulo",
          "relacionLaboral",
          "fechaIngreso",
          "fechaAlta",
        ] as const);

  const [formData, setFormData] = useState<CreateUserData>(initialFormData);
  const [phones, setPhones] = useState<PhoneForm[]>([]);

  const [formDataLabor, setFormDataLabor] =
    useState<FormDataLabor>(initialLabor);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      setFormData(initialFormData);
      setFormDataLabor(initialLabor);
      setPhones([]);
      return;
    }

    if (user) {
      const telefonosFromApi: PhoneForm[] = Array.isArray(
        (user as any).phoneNumber
      )
        ? (user as any).phoneNumber.map((p: any) => ({
            tel: p?.tel ?? "",
            phoneType: (p?.phoneType as PhoneType) ?? PhoneType.PRIMARY,
          }))
        : user.telefono ?? [];

      setPhones(telefonosFromApi);

      const roleIds = (user.roles || []).map((r: any) =>
        typeof r === "string" ? r : r.id
      );

      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        roles: roleIds,
        password: "", // vacío en edit/view
        address: user.address || "",
        fechaNacimiento: toDateInputValue(user.fechaNacimiento),
      });

      setFormDataLabor(() => {
        const laborDeUser = user.labor;
        const suc = (user as any).sucursal ?? (user as any).sucursalHogar;
        const laborData: FormDataLabor = {
          cuil: laborDeUser?.cuil,
          fechaIngreso: toDateInputValue(laborDeUser?.fechaIngreso),
          fechaAlta: toDateInputValue(laborDeUser?.fechaAlta),
          tipoDeContrato:
            laborDeUser?.tipoDeContrato || "Relación de Dependencia",
          relacionLaboral: laborDeUser?.relacionLaboral as EstadoContractual,
          categoryArca: laborDeUser?.categoryArca || "",
          antiguedad: laborDeUser?.antiguedad || "",
          horasTrabajo: laborDeUser?.horasTrabajo || "",
          sueldo:
            laborDeUser?.sueldo != null
              ? Number(laborDeUser.sueldo)
              : undefined,
          puestos: Array.isArray(laborDeUser?.puestos)
            ? laborDeUser.puestos.map((p: any) =>
                typeof p === "object"
                  ? { id: String(p.id ?? ""), name: String(p.name ?? "") }
                  : { id: "", name: String(p) }
              )
            : [],
          area: user.jerarquia?.cargo || "",
          jerarquiaId: user.jerarquia?.id || "",

          // NUEVOS mapeos desde UserAdapted:
          zona: user.zona
            ? { id: user.zona.id, name: user.zona.name }
            : undefined,
          sucursalHogar: suc
            ? { id: String(suc.id), name: String(suc.name) }
            : undefined,
          isActive: user.isActive,
          notificaciones: user.notificaciones
            ? { mail: user.notificaciones.mail, push: user.notificaciones.push }
            : { mail: true, push: false },
          photoURL: user.photoURL || "",
          certificacionesTitulo: user.certificacionesTitulo || "",
        };

        return laborData;
      });
    }
  }, [isOpen, mode, user]);

  const handleRoleChange = useCallback((id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      roles: checked ? [...prev.roles, id] : prev.roles.filter((r) => r !== id),
    }));
  }, []);

  if (!isOpen) return null;

  const isReadOnly = mode === "view";
  const showOnlyRequired = mode === "create"; // 👈 clave

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-400">
                {mode === "create" && "Crear Nuevo Usuario"}
                {mode === "edit" && "Editar Usuario"}
                {mode === "view" && "Detalles del Usuario"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X />
              </button>
            </div>
          </div>

          <FormUsers
            handleSubmit={(e) => {
              e.preventDefault();

              if (mode === "create") {
                const userClean: CreateUserData = {
                  ...formData,
                  fullName: (formData.fullName ?? "").trim(),
                  email: (formData.email ?? "").trim(),
                  password: (formData.password ?? "").trim(),
                  roles: Array.isArray(formData.roles) ? formData.roles : [],
                  address: formData.address ?? "",
                  fechaNacimiento: formData.fechaNacimiento ?? "",
                };

                onSubmit({ user: userClean, phones });
                return;
              }

              //En edit/view, comportamiento actual
              onSubmit({ user: formData, labor: formDataLabor });
            }}
            formData={formData}
            zonas={zonas}
            setFormData={setFormData}
            isReadOnly={isReadOnly}
            onClose={onClose}
            onAssignZona={onAssignZona}
            onAssignSucursal={onAssignSucursal}
            isloading={isloading}
            mode={mode}
            rolesDisponibles={rolesDisponibles}
            handleRoleChange={handleRoleChange}
            formDataLabor={formDataLabor}
            setFormDataLabor={setFormDataLabor}
            user={user}
            visibleFields={visibleFields}
            showOnlyRequired={showOnlyRequired}
            phones={phones}
            onPhonesChange={setPhones}
          />
        </div>
      </div>
    </>
  );
};

export default UserModal;

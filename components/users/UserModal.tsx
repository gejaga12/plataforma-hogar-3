import { CreateUserData, UserAdapted, Zona } from "@/utils/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import FormUsers from "./FormUsers";
import { EstadoContractual, FormDataLabor } from "./FormDatosLaborales";
import { formatDateInput } from "@/utils/formatDate";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserAdapted;
  mode: "create" | "edit" | "view";
  onSubmit: (payload: { user: CreateUserData; labor?: FormDataLabor }) => void;
  rolesDisponibles: Record<string, string>;
  isloading: boolean;
  zonas: Zona[];
}

const initialFormData: CreateUserData = {
  nombreCompleto: "",
  zona: undefined,
  fechaNacimiento: "",
  mail: "",
  direccion: "",
  roles: [],
  notificaciones: { mail: true, push: true },
  puesto: "",
  sucursalHogar: "",
  activo: true,
};

const initialLabor: FormDataLabor = {
  tipoDeContrato: "",
  relacionLaboral: "Periodo de Prueba",
  fechaIngreso: "",
  fechaAlta: "",
  cuil: undefined,
  categoryArca: "",
  antiguedad: "",
  horasTrabajo: "",
  sueldo: "",
  certificacionesTitulo: "",
  puestos: [""],
  area: "",
};

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  mode,
  onSubmit,
  rolesDisponibles,
  isloading,
  zonas,
}) => {
  const [formData, setFormData] = useState<CreateUserData>(initialFormData);
  const [formDataLabor, setFormDataLabor] =
    useState<FormDataLabor>(initialLabor);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      setFormData(initialFormData);
      setFormDataLabor(initialLabor);
      return;
    }

    if (user) {
      // intentar encontrar la zona por nombre (en tu Adapted guardás el name)
      const zonaObj = zonas?.find((z) => z.id === user.zona.id);

      // roles: en UserAdapted pueden venir como string o {id, name}
      const roleIds = (user.roles || []).map((r: any) =>
        typeof r === "string" ? r : r.id
      );

      setFormData({
        nombreCompleto: user.fullName || "",
        zona: zonaObj, // <- objeto Zona o undefined
        fechaNacimiento: formatDateInput(user.fechaNacimiento) || "", // asumís formato "yyyy-MM-dd" para input date
        mail: user.email || "",
        direccion: user.address || "",
        roles: roleIds, // <- ids de los roles
        notificaciones: user.notificaciones || { mail: true, push: true },
        sucursalHogar: user.sucursalHogar || "",
        activo: user.activo ?? true,
        puesto: user.labor?.puestos?.[0]?.puesto || "",
      });

      setFormDataLabor((prev) => {
        const laborDeUser = user.labor;

        const laborData: FormDataLabor = {
          cuil: laborDeUser?.cuil,
          fechaIngreso: formatDateInput(laborDeUser?.fechaIngreso) || "",
          fechaAlta: formatDateInput(laborDeUser?.fechaAlta) || "",
          tipoDeContrato:
            laborDeUser?.tipoDeContrato || "Relación de Dependencia",
          relacionLaboral: laborDeUser?.relacionLaboral as EstadoContractual,
          categoryArca: laborDeUser?.categoryArca || "",
          antiguedad: laborDeUser?.antiguedad || "",
          horasTrabajo: laborDeUser?.horasTrabajo || "",
          sueldo: laborDeUser?.sueldo != null ? String(laborDeUser.sueldo) : "",
          certificacionesTitulo: user.certificacionesTitulo || "",
          puestos: laborDeUser?.puestos?.map((p) => p.puesto) || [""],
          area: user.jerarquia?.area || "",
          jerarquiaId: user.jerarquia?.id || "",
        };

        return laborData;
      });
    }
  }, [isOpen, mode]);

  const handleRoleChange = (id: string, checked: boolean) => {
    setFormData((prev) => {
      const roles = checked
        ? [...prev.roles, id]
        : prev.roles.filter((r) => r !== id);
      return { ...prev, roles };
    });
  };

  if (!isOpen) return null;

  const isReadOnly = mode === "view";

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
              onSubmit({ user: formData, labor: formDataLabor }); // ahora lo delega al padre
            }}
            formData={formData}
            zonas={zonas}
            setFormData={setFormData}
            isReadOnly={isReadOnly}
            onClose={onClose}
            isloading={isloading}
            mode={mode}
            rolesDisponibles={rolesDisponibles}
            handleRoleChange={handleRoleChange}
            formDataLabor={formDataLabor}
            setFormDataLabor={setFormDataLabor}
            user={user}
          />
        </div>
      </div>
    </>
  );
};

export default UserModal;

import { CreateUserData, UserAdapted, UserFromApi, Zona } from "@/utils/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { mapUserToCreateUserData } from "@/utils/userMapper";
import FormUsers from "./FormUsers";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserAdapted;
  mode: "create" | "edit" | "view";
  onSubmit: (data: CreateUserData) => void;
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
  telefono: "",
  roles: [],
  notificaciones: { mail: true, push: true },
  puesto: "",
  area: "",
  sucursalHogar: "",
  activo: true,
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

  useEffect(() => {
    if (!isOpen && mode === "create") {
      setFormData(initialFormData);
    } else if (user) {
      setFormData(mapUserToCreateUserData(user, zonas));
    }
  }, [user, mode, isOpen, zonas]);

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
              onSubmit(formData); // ahora lo delega al padre
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
          />
        </div>
      </div>
    </>
  );
};

export default UserModal;

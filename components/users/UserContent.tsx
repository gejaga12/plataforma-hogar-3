import { ZonaService } from "@/utils/api/apiZonas";
import { useAuth } from "@/hooks/useAuth";
import { Puesto, UserAdapted } from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { FormDataLabor } from "./FormDatosLaborales";
import { ApiRoles } from "@/utils/api/apiRoles";
import {
  AuthService,
  CreateUserData,
  UpdateUserPayload,
} from "@/utils/api/apiAuth";
import { CrearLaborDTO, LaborService } from "@/utils/api/apiLabor";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Edit,
  Eye,
  Filter,
  Mail,
  Plus,
  Search,
  Shield,
  Trash2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import UserModal from "./UserModal";
import DeleteUSerModal from "./DeleteUserModal";
import { PhoneForm, TelPayload, TelService } from "@/utils/api/apiTel";
import ModalPortal from "../ui/ModalPortal";

const mapPhonesToPayload = (
  userId: number,
  phones: PhoneForm[]
): TelPayload[] =>
  phones
    .map((p) => ({
      tel: (p.tel ?? "").replace(/\D/g, "").trim(),
      phoneType: p.phoneType,
      userId,
    }))
    .filter((p) => p.tel !== "");

const UsersContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    user?: UserAdapted;
  }>({ isOpen: false, mode: "create" });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user?: UserAdapted;
  }>({ isOpen: false });

  const [rolesDisponibles, setRolesDisponibles] = useState<
    Record<string, string>
  >({});

  const { usuarios, loading, refetchUsuarios } = useAuth();
  console.log('usuarios:', usuarios);

  const userActual = usuarios?.find((u) => u.id === modalState.user?.id);

  const { data: zonasResponse } = useQuery({
    queryKey: ["zonas"],
    queryFn: () => ZonaService.allInfoZona(),
  });

  const zonas = useMemo(() => zonasResponse?.zonas ?? [], [zonasResponse]);

  useEffect(() => {
    const obtenerRoles = async () => {
      try {
        const roles = await ApiRoles.listaRolesCreacion();
        setRolesDisponibles(roles);
      } catch (e) {
        console.error("Error al obtener los roles disponibles:", e);
      }
    };

    obtenerRoles();
  }, []);

  const createMutation = useMutation({
    mutationFn: async (payload: {
      user: CreateUserData;
      phones?: PhoneForm[];
    }) => {
      const { user, phones } = payload;

      // 1) Usuario (solo campos de CreateUserData)
      const userPayload = {
        email: user.email,
        password: user.password || "Abc123",
        fullName: user.fullName,
        roles: user.roles,
        address: user.address ?? "",
        fechaNacimiento: user.fechaNacimiento,
        isActive: user.isActive ?? true,
      };

      console.log("payload de usuario (CREATE):", userPayload);

      const newUser = await AuthService.registerUser(userPayload);

      if (typeof newUser?.id !== "number") {
        throw new Error("El registro no devolvió un id de usuario válido.");
      }
      const userId: number = newUser.id;

      // ✅ Tipamos explícitamente a TelPayload[]
      const telPayloads: TelPayload[] = (phones ?? [])
        .map((p) => ({
          userId, // ahora es number seguro
          tel: (p.tel ?? "").trim(),
          phoneType: p.phoneType,
        }))
        .filter((tp) => tp.tel !== "");

      if (telPayloads.length) {
        await Promise.all(
          telPayloads.map((tp) => TelService.crearTelefono(tp))
        );
      }

      return newUser;
    },
    retry: false,
    onSuccess: async () => {
      toast.success("Usuario creado con éxito.");
      await refetchUsuarios();
      setModalState({ isOpen: false, mode: "create" });
    },
    onError: (e: any) => {
      toast.error("Ocurrió un error al crear el usuario.");
      console.log("Error:", e);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (args: {
      id: number;
      user?: Partial<CreateUserData>;
      labor?: Partial<FormDataLabor>;
    }) => {
      const { id, user, labor } = args;

      // 1) Normalizá la sección base (solo si hay cambios)
      const userSection: Partial<CreateUserData> | undefined = user
        ? {
            ...(user.fullName !== undefined && {
              fullName: user.fullName.trim(),
            }),
            ...(user.email !== undefined && { email: user.email.trim() }),
            ...(user.address !== undefined && { address: user.address }),
            ...(user.fechaNacimiento !== undefined && {
              fechaNacimiento: user.fechaNacimiento,
            }),
            ...(user.roles !== undefined && { roles: user.roles }),
            ...(user.isActive !== undefined && { isActive: user.isActive }),
            // ⚠️ password: solo si tu API permite actualizarla acá
            ...(user.password ? { password: user.password } : {}),
          }
        : undefined;

      // 2) Normalizá la sección laboral (solo si hay cambios)
      //    OJO: respetá el shape de FormDataLabor (ids dentro de objetos si así lo tipaste)
      const laborSection: Partial<FormDataLabor> | undefined = labor
        ? {
            ...(labor.jerarquiaId !== undefined && {
              jerarquiaId: labor.jerarquiaId,
            }),
            ...(labor.area !== undefined && { area: labor.area }),
            ...(labor.zona !== undefined && { zona: labor.zona }), // {id,name} según tu tipo
            ...(labor.sucursalHogar !== undefined && {
              sucursalHogar: labor.sucursalHogar,
            }), // {id,name}
            ...(labor.isActive !== undefined && { isActive: labor.isActive }),
            ...(labor.notificaciones !== undefined && {
              notificaciones: labor.notificaciones,
            }),
            ...(labor.photoURL !== undefined && { photoURL: labor.photoURL }),
            ...(labor.certificacionesTitulo !== undefined && {
              certificacionesTitulo: labor.certificacionesTitulo,
            }),

            ...(labor.cuil !== undefined && { cuil: labor.cuil }),
            ...(labor.tipoDeContrato !== undefined && {
              tipoDeContrato: labor.tipoDeContrato,
            }),
            ...(labor.relacionLaboral !== undefined && {
              relacionLaboral: labor.relacionLaboral,
            }),
            ...(labor.fechaIngreso !== undefined && {
              fechaIngreso: labor.fechaIngreso,
            }),
            ...(labor.fechaAlta !== undefined && {
              fechaAlta: labor.fechaAlta,
            }),
            ...(labor.categoryArca !== undefined && {
              categoryArca: labor.categoryArca,
            }),
            ...(labor.antiguedad !== undefined && {
              antiguedad: labor.antiguedad,
            }),
            ...(labor.horasTrabajo !== undefined && {
              horasTrabajo: labor.horasTrabajo,
            }),
            ...(labor.sueldo !== undefined && { sueldo: labor.sueldo }),
            ...(labor.puestos !== undefined && { puestos: labor.puestos }), // Puesto[]
          }
        : undefined;

      // 3) Armá el payload EXACTO que espera tu service
      const data: UpdateUserPayload = {};
      if (userSection && Object.keys(userSection).length)
        data.user = userSection;
      if (laborSection && Object.keys(laborSection).length)
        data.labor = laborSection;

      // Si por algún motivo no hay nada que enviar, evitá el PATCH vacío
      if (!data.user && !data.labor) return true;

      // 4) PATCH principal
      await AuthService.editUsers(id, data);

      return true;
    },
    retry: false,
    onSuccess: async () => {
      toast.success("Usuario actualizado con éxito.");
      await refetchUsuarios();
      setModalState({ isOpen: false, mode: "edit" });
    },
    onError: (e: any) => {
      toast.error("Ocurrió un error al actualizar el usuario.");
      console.log("Error:", e);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => AuthService.DeleteUSerModal(id),
    onSuccess: async () => {
      await refetchUsuarios();
      setDeleteModal({ isOpen: false });
      toast.success("Usuario eliminado con exito.");
    },
    onError: (error: any) => {
      console.error("Error al eliminar el usuario:", error.message);
      toast.error("Ocurrio un error al eliminar el usuario");
    },
  });

  const handleSubmit = async (payload: {
    user: CreateUserData;
    labor?: FormDataLabor;
    phones?: PhoneForm[];
  }) => {
    const { user, labor, phones } = payload;

    if (modalState.mode === "create") {
      createMutation.mutate({ user, phones });
      return;
    }

    if (modalState.mode === "edit" && modalState.user?.id) {
      updateMutation.mutate({
        id: modalState.user.id,
        user,
        labor,
      });
      return;
    }
  };

  const filteredUsers =
    usuarios?.filter((user) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        user.fullName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) || // ← protegido con ?
        user.labor?.puestos?.some((puesto) =>
          puesto?.name.toLowerCase().includes(search)
        );

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "activo" && user.isActive) ||
        (statusFilter === "inactivo" && !user.isActive);

      return matchesSearch && matchesStatus;
    }) || [];

  const handleDeleteUser = (user: UserAdapted) => {
    setDeleteModal({ isOpen: true, user });
  };

  const confirmDelete = () => {
    if (deleteModal.user) {
      deleteMutation.mutate(deleteModal.user.id!);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
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
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>

        <button
          onClick={() => setModalState({ isOpen: true, mode: "create" })}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre, email o puesto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700  dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Puesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-800 dark:bg-gray-900">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {(user.fullName ?? " ")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-400">
                          {user.fullName || "Sin nombre"}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center dark:text-gray-400">
                          <Mail size={12} className="mr-1" />
                          {user.email || "Sin email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-400">
                      {user.labor?.puestos
                        ?.map((puesto) => puesto.name)
                        .join(", ") || "Sin puesto"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-400">
                      {user.zona?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={typeof role === "object" ? role.id : role}
                          className="px-2 py-1 bg-orange-100 dark:bg-orange-300 text-orange-700 text-xs font-medium rounded-full"
                        >
                          {typeof role === "object" ? role.name : role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setModalState({ isOpen: true, mode: "view", user })
                        }
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setModalState({ isOpen: true, mode: "edit", user })
                        }
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 dark:bg-gray-900">
            <Shield className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-400">
              No hay usuarios
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? "No se encontraron usuarios con los filtros aplicados."
                : "Comienza creando un nuevo usuario."}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ModalPortal>
        <UserModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, mode: "create" })}
          user={userActual}
          mode={modalState.mode}
          rolesDisponibles={rolesDisponibles}
          zonas={zonas}
          onSubmit={handleSubmit}
          isloading={
            modalState.mode === "edit"
              ? updateMutation.isPending
              : createMutation.isPending
          }
        />

        <DeleteUSerModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false })}
          onConfirm={confirmDelete}
          userName={deleteModal.user?.fullName || ""}
          isLoading={deleteMutation.isPending}
        />
      </ModalPortal>
    </div>
  );
};

export default UsersContent;

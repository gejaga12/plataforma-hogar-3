"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield,
  X,
} from "lucide-react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CreateUserData, UserAdapted, UserFromApi } from "@/utils/types";
import { cn } from "@/utils/cn";
import UserModal from "@/components/users/UserModal";
import DeleteUSerModal from "@/components/users/DeleteUserModal";
import { AuthService, EditUserPayload } from "@/api/apiAuth";
import { ApiRoles } from "@/api/apiRoles";
import Swal from "sweetalert2";
import { mapUserAdaptedToUserFromApi } from "@/utils/userMapper";
import { formatDateInput } from "@/utils/formatDate";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

function UsersContent() {
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
    mutationFn: async (userData: CreateUserData) => {
      const mappedPayload = {
        fullName: userData.nombreCompleto,
        email: userData.mail,
        password: userData.contrasena || "Abc123",
        phoneNumber: userData.telefono || "",
        address: userData.direccion || "",
        puesto: userData.puesto || "tecnico",
        fechaNacimiento: formatDateInput(userData.fechaNacimiento),
        zona: userData.zona,
        sucursalHogar: userData.sucursalHogar || "",
        roles: userData.roles, // ← ids directamente
      };

      console.log("📤 Enviando usuario al backend:", mappedPayload);

      return await AuthService.registerUser(mappedPayload);
    },
    onSuccess: async () => {
      await refetchUsuarios();
      setModalState({ isOpen: false, mode: "create" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AuthService.DeleteUSerModal(id),
    onSuccess: async () => {
      await refetchUsuarios();
      setDeleteModal({ isOpen: false });

      Swal.fire({
        title: "Eliminado",
        text: "El usuario fue eliminado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3085d6",
      });
    },
    onError: (error: any) => {
      console.error("Error al eliminar el usuario:", error.message);
      Swal.fire({
        title: "Error",
        text: error?.message || "Ocurrió un error al eliminar el usuario.",
        icon: "error",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#d33",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: CreateUserData;
      originalData: UserFromApi;
    }) => {
      const confirm = await Swal.fire({
        title: "¿Confirmar cambios?",
        text: "Vas a actualizar la información del usuario.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;

      // Payload para datos personales
      const userPayload: EditUserPayload = {
        email: formData.mail,
        fullName: formData.nombreCompleto,
        address: formData.direccion,
        fechaNacimiento: formatDateInput(formData.fechaNacimiento),
        roles: formData.roles, // solo IDs
        zona: formData.zona,
        sucursalHogar: formData.sucursalHogar,
      };

      console.log("Payload usuario:", userPayload);

      await AuthService.editUsers(id, userPayload);
    },

    onSuccess: async () => {
      toast.success("Usuario actualizado correctamente");
      await refetchUsuarios();
      setModalState({ isOpen: false, mode: "edit" });
    },

    onError: (error: any) => {
      console.log(error.message || "Error al actualizar usuario");
    },
  });

  const handleSubmit = async (formData: CreateUserData) => {
    const fechaNacimientoDate = new Date(formData.fechaNacimiento);

    if (isNaN(fechaNacimientoDate.getTime())) {
      Swal.fire({
        icon: "error",
        title: "Fechas inválidas",
        text: "Verificá que las fechas ingresadas sean correctas.",
      });
      return;
    }

    if (modalState.mode === "edit" && modalState.user?.id) {
      const originalData = mapUserAdaptedToUserFromApi(modalState.user);
      editMutation.mutate({
        id: modalState.user.id,
        formData,
        originalData,
      });
    }
    if (modalState.mode === "create") {
      createMutation.mutate(formData, {
        onSuccess: () => {
          Swal.fire({
            icon: "success",
            title: "Usuario creado",
            text: "El usuario fue registrado correctamente.",
          });
          setModalState({ isOpen: false, mode: "create" });
        },
        onError: () => {
          Swal.fire({
            icon: "error",
            title: "Error al crear",
            text: "No se pudo registrar el usuario. Reintentá más tarde.",
          });
        },
      });
    }
  };

  const filteredUsers =
    usuarios?.filter((user) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        user.fullName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) || // ← protegido con ?
        user.puesto?.toLowerCase().includes(search);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "activo" && user.activo) ||
        (statusFilter === "inactivo" && !user.activo);

      return matchesSearch && matchesStatus;
    }) || [];

  const handleDeleteUser = (user: UserAdapted) => {
    setDeleteModal({ isOpen: true, user });
  };

  const confirmDelete = () => {
    if (deleteModal.user) {
      console.log(deleteModal.user.id);
      deleteMutation.mutate(deleteModal.user.id);
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
                <tr key={user.id} className="hover:bg-gray-800">
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
                      {user.puesto}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-400">
                      {user.zona}
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
                        user.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {user.activo ? "Activo" : "Inactivo"}
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
      <UserModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: "create" })}
        user={modalState.user}
        mode={modalState.mode}
        rolesDisponibles={rolesDisponibles}
        onSubmit={handleSubmit}
        isloading={
          modalState.mode === "edit"
            ? editMutation.isPending
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
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedLayout>
      <UsersContent />
    </ProtectedLayout>
  );
}

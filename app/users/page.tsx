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
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import UserModal from "@/components/users/UserModal";
import DeleteUSerModal from "@/components/users/DeleteUserModal";
import {
  AuthService,
  EditLaborPayload,
  EditUserPayload,
} from "@/lib/api/apiAuth";
import { ApiRoles } from "@/lib/api/apiRoles";
import Swal from "sweetalert2";
import { mapUserAdaptedToUserFromApi } from "@/utils/userMapper";

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

  const { users, loading, refetchUsuarios } = useAuth();

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
      const fechaIngresoDate = new Date(userData.fechaIngreso);
      const fechaNacimientoDate = new Date(userData.fechaNacimiento);
      if (
        isNaN(fechaIngresoDate.getTime()) ||
        isNaN(fechaNacimientoDate.getTime())
      ) {
        throw new Error("Fechas inválidas");
      }

      const mappedPayload = {
        fullName: userData.nombreCompleto,
        email: userData.mail,
        password: userData.contrasena || "Abc123",
        phoneNumber: userData.telefono || "",
        address: userData.direccion || "",
        puesto: userData.puesto || "",
        relacionLaboral: userData.relacionLaboral as
          | "Periodo de Prueba"
          | "Contratado",
        fechaIngreso: fechaIngresoDate,
        fechaNacimiento: fechaNacimientoDate,
        zona: userData.zona,
        sucursalHogar: userData.sucursalHogar || "",
        tipoDeContrato: userData.tipoContrato as
          | "Relación de Dependencia"
          | "Freelance"
          | "Contratista",
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
      originalData,
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
        fechaNacimiento: new Date(formData.fechaNacimiento),
        roles: formData.roles, // solo IDs
        zona: formData.zona,
        sucursalHogar: formData.sucursalHogar,
      };

      // Payload para datos laborales
      const laborId = originalData.labor?.id;

      const laborPayload: EditLaborPayload = {
        userId: id,
        tipoDeContrato: formData.tipoContrato,
        relacionLaboral: formData.relacionLaboral,
        fechaAlta: new Date(formData.fechaIngreso).toISOString(),
        puestos: formData.puesto ? [formData.puesto] : [],
      };

      console.log("Payload usuario:", userPayload);
      console.log("Payload laboral:", laborPayload);

      const results = await Promise.allSettled([
        AuthService.editUsers(id, userPayload),
        laborId
          ? AuthService.editLabor(laborId, laborPayload)
          : Promise.resolve({ did: false }),
      ]);

      const [userResult, laborResult] = results;
      if (
        userResult.status === "fulfilled" &&
        (laborId ? laborResult.status === "fulfilled" : true)
      ) {
        Swal.fire({
          icon: "success",
          title: "Actualización exitosa",
          text: "Los datos del usuario se actualizaron correctamente.",
        });
      } else {
        let errores = "";
        if (userResult.status === "rejected") {
          errores += `Usuario: ${
            userResult.reason.message || "Error desconocido"
          }\n`;
        }
        if (laborId && laborResult.status === "rejected") {
          errores += `Laboral: ${
            laborResult.reason.message || "Error desconocido"
          }`;
        }
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: errores || "Ocurrió un error durante la actualización.",
        });
        throw new Error(errores);
      }
    },

    onSuccess: async () => {
      console.log("Usuario actualizado correctamente");
      await refetchUsuarios();
    },

    onError: (error: any) => {
      console.log(error.message || "Error al actualizar usuario");
    },
  });

  const handleSubmit = async (formData: CreateUserData) => {
    const fechaIngresoDate = new Date(formData.fechaIngreso);
    const fechaNacimientoDate = new Date(formData.fechaNacimiento);

    if (
      isNaN(fechaIngresoDate.getTime()) ||
      isNaN(fechaNacimientoDate.getTime())
    ) {
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
    users?.filter((user) => {
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
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
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
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName || "Sin nombre"}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail size={12} className="mr-1" />
                          {user.email || "Sin email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.puesto}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.zona}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={typeof role === "object" ? role.id : role}
                          className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full"
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
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setModalState({ isOpen: true, mode: "edit", user })
                        }
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 transition-colors"
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
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
} from "lucide-react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CreateUserData, Puesto, UserAdapted } from "@/utils/types";
import { cn } from "@/utils/cn";
import UserModal from "@/components/users/UserModal";
import DeleteUSerModal from "@/components/users/DeleteUserModal";
import { AuthService } from "@/api/apiAuth";
import { ApiRoles } from "@/api/apiRoles";
import Swal from "sweetalert2";
import { formatDateInput } from "@/utils/formatDate";
import toast from "react-hot-toast";
import { ZonaService } from "@/api/apiZonas";
import {
  buildCrearLaborPayload,
  CrearLaborDTO,
  LaborService,
} from "@/api/apiLabor";
import { FormDataLabor } from "@/components/users/FormDatosLaborales";
import { useAuth } from "@/hooks/useAuth";
import { PuestoService } from "@/api/apiPuesto";
import { SucursalHogarService } from "@/api/apiSucursalHogar";

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

  const { data: zonasResponse, isLoading: isLoadingZonas } = useQuery({
    queryKey: ["zonas"],
    queryFn: () => ZonaService.allInfoZona(),
  });

  const { data: sucursales, isLoading } = useQuery({
    queryKey: ["sucursalesHogar"],
    queryFn: () => SucursalHogarService.getAllSucursalesHogar(),
  });

  const zonas = useMemo(() => zonasResponse?.zonas ?? [], [zonasResponse]);

  const userActual = usuarios?.find((u) => u.id === modalState.user?.id);

  const hasLaborData = (labor?: FormDataLabor): boolean => {
    if (!labor) return false;

    const campos = [
      labor.cuil,
      labor.fechaIngreso,
      labor.fechaAlta,
      labor.tipoDeContrato,
      labor.relacionLaboral,
      labor.categoryArca,
      labor.antiguedad,
      labor.horasTrabajo,
      labor.sueldo,
      labor.area,
      labor.puestos?.[0],
    ];

    return campos.some((campo) => campo && campo !== "");
  };

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
      labor?: FormDataLabor;
    }) => {
      const { user, labor } = payload;

      const userPayload = {
        email: user.mail,
        password: user.contrasena || "Abc123", // por defecto si no se carga
        fullName: user.nombreCompleto,
        phoneNumber: user.telefono,
        roles: user.roles,
        address: user.direccion ?? "",
        puesto: user.puesto ?? "tecnico",
        zona: user.zona?.id ?? "",
        sucursalHogar: user.sucursalHogar ?? "",
        fechaNacimiento: formatDateInput(user.fechaNacimiento),
        jerarquia: user.jerarquiaId ?? undefined,
      };
      // 👉 POST a /auth/register
      const newUser = await AuthService.registerUser(userPayload);

      console.log("Nuevo usuario:", newUser);

      // 👉 POST a /labor si hay datos cargados
      if (hasLaborData(labor)) {
        const laborDTO = buildCrearLaborPayload(labor!, newUser.id); // aseguramos que no sea undefined

        console.log("📤 Payload de labor:", laborDTO);

        const nuevaLabor = await LaborService.crearLabor(laborDTO);

        if (
          labor?.puestos &&
          Array.isArray(labor.puestos) &&
          labor.puestos[0] // hay al menos uno
        ) {
          const puestoPayload = {
            puesto:
              labor.puestos[0] && typeof labor.puestos[0] != "string"
                ? labor.puestos[0]?.name
                : "",
            laborid: nuevaLabor.id,
          };

          console.log("📤 Payload de puesto:", puestoPayload);

          await PuestoService.crearPuesto(puestoPayload);
        }
      }
      return newUser;
    },

    onSuccess: async () => {
      await refetchUsuarios();
      setModalState({ isOpen: false, mode: "create" });
      Swal.fire({
        icon: "success",
        title: "Usuario creado",
        text: "El usuario fue registrado correctamente.",
      });
    },

    onError: (e: any) => {
      Swal.fire({
        icon: "error",
        title: "Error al crear",
        text: e?.message || "No se pudo registrar el usuario.",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      laborId,
      formData,
      laborForm,
    }: {
      id: number;
      laborId: string;
      formData: CreateUserData;
      laborForm?: FormDataLabor;
    }) => {
      //Payload para datos de usuario
      const payload = {
        email: formData.mail,
        password: formData.contrasena || undefined,
        fullName: formData.nombreCompleto,
        roles: formData.roles,
        phoneNumber: formData.telefono,
        address: formData.direccion,
        puesto: formData.puesto,
        zona: formData.zona?.id,
        sucursalHogar: formData.sucursalHogar || undefined,
        fechaNacimiento: formData.fechaNacimiento,
      };
      // console.log("📤 Enviando payload al PATCH", payload);
      await AuthService.editUsers(id, payload);

      if (
        laborForm &&
        laborForm?.tipoDeContrato &&
        laborForm?.relacionLaboral
      ) {
        //Payload para datos laborales
        const laborPayload: Partial<CrearLaborDTO> = {
          fechaIngreso: laborForm.fechaIngreso,
          fechaAlta: laborForm.fechaAlta,
          categoryArca: laborForm.categoryArca,
          antiguedad: laborForm.antiguedad,
          tipoDeContrato: laborForm.tipoDeContrato,
          horasTrabajo: laborForm.horasTrabajo,
          relacionLaboral: laborForm.relacionLaboral,
          cuil: laborForm.cuil ? Number(laborForm.cuil) : undefined,
          sueldo: laborForm.sueldo ? Number(laborForm.sueldo) : undefined,
        };

        // console.log("📤 Payload laboral:", laborPayload);
        await LaborService.actualizarLabor(laborId, laborPayload);
      }

      const puesto = laborForm?.puestos?.[0] as Puesto;
      const puestoId = puesto?.id;
      const payloadPuesto = { laborId, name: puesto?.name };

      console.log("📤 Payload puesto:", { ...payloadPuesto, puestoId });

      await LaborService.actualizarPuesto(puestoId, payloadPuesto);
    },

    onSuccess: async () => {
      toast.success("Usuario actualizado correctamente");
      await refetchUsuarios();
      setModalState({ isOpen: false, mode: "edit" });
    },
    onError: (error: any) => {
      console.error("❌ Error en edición:", error.message || error);
      console.log(error.message || "Error al actualizar usuario");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => AuthService.DeleteUSerModal(id),
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

  const handleSubmit = async (payload: {
    user: CreateUserData;
    labor?: FormDataLabor;
  }) => {
    const { user, labor } = payload;

    if (modalState.mode === "create") {
      // delega toda la lógica a createMutation
      createMutation.mutate({ user, labor });
      return;
    }

    // const puestos = labor?.puestos && labor.puestos.every(p => typeof p != "string") ? labor.puestos : []

    if (modalState.mode === "edit" && modalState.user?.id) {
      editMutation.mutate({
        id: modalState.user.id,
        laborId: modalState.user?.labor?.id ?? "",
        formData: user,
        laborForm: labor,
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

import { ZonaService } from "@/utils/api/apiZonas";
import { useAuth } from "@/hooks/useAuth";
import { Puesto, UserAdapted } from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { FormDataLabor } from "./FormDatosLaborales";
import { ApiRoles } from "@/utils/api/apiRoles";
import { AuthService, CreateUserData } from "@/utils/api/apiAuth";
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
import { SucursalesService } from "@/utils/api/apiSucursales";
import {
  CrearLaborDTO,
  LaborService,
} from "@/utils/api/apiLabor";
import { formatDateInput } from "@/utils/formatDate";

export const buildLaborData = (form: FormDataLabor, userId: number) => {
  const base = {
    userId,
    cuil: form.cuil,
    fechaIngreso: formatDateInput(form.fechaIngreso) ?? null,
    fechaAlta: form.fechaAlta ? formatDateInput(form.fechaAlta) : undefined,
    categoryArca: form.categoryArca,
    antiguedad: form.antiguedad,
    tipoDeContrato: form.tipoDeContrato,
    horasTrabajo: form.horasTrabajo,
    sueldo:
      form.sueldo === undefined ||
      form.sueldo === null ||
      isNaN(Number(form.sueldo))
        ? undefined
        : Number(form.sueldo),
    relacionLaboral: form.relacionLaboral,
  };
  return base; // limpio
};

export const buildPuestoData = (form: FormDataLabor) => {
  const first = form.puestos?.[0];
  const name = first?.name;
  return name ? { name } : undefined;
};

const mapPhonesToPayload = (
  userId: number,
  phones: PhoneForm[] = []
): TelPayload[] =>
  phones
    .map((p) => ({
      userId,
      tel: (p.tel ?? "").replace(/\D/g, "").trim(),
      phoneType: p.phoneType,
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

  const { usuarios, loading, refetchUsuarios } = useAuth();

  // console.log("usuarios:", usuarios);

  const userActual = usuarios?.find((u) => u.id === modalState.user?.id);

  const { data: zonas = [] } = useQuery({
    queryKey: ["zonas"],
    queryFn: ZonaService.allInfoZona,
    select: (r) => r?.zonas ?? [],
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: rolesDisponibles = {} } = useQuery({
    queryKey: ["roles-disponibles"],
    queryFn: ApiRoles.listaRolesCreacion,
    staleTime: Infinity,
  });

  //CREAR USUARIO CON DATOS BASICOS, LABOR Y PUESTO
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
        telefonos: [],
      };

      console.log("payload de usuario (CREATE):", userPayload);

      const newUser = await AuthService.registerUser(userPayload);

      if (typeof newUser?.id !== "number") {
        throw new Error("El registro no devolvió un id de usuario válido.");
      }
      const userId: number = newUser.id;

      // ✅ Tipamos explícitamente a TelPayload[]
      const telPayloads = mapPhonesToPayload(userId, phones);

      console.log("payload de telefonos (CREATE):", telPayloads);

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

  const crearLaborMutation = useMutation({
    mutationFn: (data: CrearLaborDTO) => LaborService.crearLabor(data),
    onSuccess: async () => {
      toast.success("Datos laborales creados.");
      await refetchUsuarios();
    },
    onError: (e: any) => {
      toast.error(e?.message || "No se pudo crear labor");
    },
  });

  const crearPuestoMutation = useMutation({
    mutationFn: (args: { laborId: string; name: string }) =>
      LaborService.crearPuesto({ laborid: args.laborId, name: args.name }),
    onSuccess: async () => {
      toast.success("Puesto creado.");
      await refetchUsuarios();
    },
    onError: (e: any) => {
      toast.error(e?.message || "No se pudo crear el puesto");
    },
  });

  //MUTATES DEDICADOS PARA ZONA Y SUCURSAL
  const asignarZonaMutation = useMutation({
    mutationFn: async (args: { zonaId: string; userId: number }) => {
      const { zonaId, userId } = args;

      console.group("[UsersContent] asignarZonaMutation");
      console.log("Payload a enviar:", { zonaId, userId });
      console.groupEnd();

      return ZonaService.asignarZona(zonaId, userId);
    },
    onSuccess: async () => {
      toast.success("Zona asignada con éxito.");
      await refetchUsuarios();
    },
    onError: (e: any) => {
      toast.error(e?.message || "No se pudo asignar la zona.");
      console.log("Error asignarZona:", e);
    },
  });

  const asignarSucursalMutation = useMutation({
    mutationFn: async (args: { sucid: string; userid: number }) => {
      const { sucid, userid } = args;

      console.group("[UsersContent] asignarSucursalMutation");
      console.log("Payload a enviar:", { sucid, userid });
      console.groupEnd();

      return SucursalesService.asignarSucursal(sucid, userid);
    },
    onSuccess: async () => {
      toast.success("Sucursal asignada con éxito.");
      await refetchUsuarios();
    },
    onError: (e: any) => {
      toast.error(e?.message || "No se pudo asignar la zona.");
      console.log("Error asignarZona:", e);
    },
  });
  //---------------------------------------

  //UPDATES
  const actualizarLaborMutation = useMutation({
    mutationFn: (args: { laborId: string; data: Partial<CrearLaborDTO> }) =>
      LaborService.actualizarLabor(args.laborId, args.data),
    onSuccess: async () => {
      toast.success("Datos laborales actualizados.");
      await refetchUsuarios();
    },
    onError: (e: any) => {
      toast.error(e?.message || "No se pudo actualizar labor");
    },
  });

  const actualizarPuestoMutation = useMutation({
    mutationFn: (args: { puestoId: string; name: string }) =>
      LaborService.actualizarPuesto(args.puestoId, { name: args.name }),
    onSuccess: async () => {
      toast.success("Puesto actualizado.");
      await refetchUsuarios();
    },
    onError: (e: any) => {
      toast.error(e?.message || "No se pudo actualizar el puesto");
    },
  });

  //DELETE
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
    const { user, labor } = payload;

    if (modalState.mode === "create") {
      // Tu flujo actual (user + phones)
      createMutation.mutate({ user, phones: payload.phones });
      return;
    }

    if (modalState.mode === "edit" && modalState.user?.id) {
      const userId = modalState.user.id;

      // Previos desde useAuth()
      const prevLabor: any = (modalState.user as any)?.labor ?? null;
      const prevLaborId: string | undefined = prevLabor?.id
        ? String(prevLabor.id)
        : undefined;
      const prevPuesto = Array.isArray(prevLabor?.puestos)
        ? prevLabor.puestos[0]
        : undefined;
      const prevPuestoId: string | undefined = prevPuesto?.id
        ? String(prevPuesto.id)
        : undefined;
      const prevPuestoName = (prevPuesto?.name ?? "").trim();

      // Payloads actuales (limpios)
      const laborData = labor ? buildLaborData(labor, userId) : undefined;
      const puestoData = labor ? buildPuestoData(labor) : undefined;

      // Detección de cambios reales en Labor
      const hasLaborChanges =
        !!laborData &&
        Object.keys(laborData).some((k) => (laborData as any)[k] !== undefined);

      // Detección de cambios en Puesto
      const hasPuestoInForm = !!puestoData?.name;
      const puestoChanged =
        hasPuestoInForm && prevPuestoName !== puestoData!.name;

      try {
        // ──────────────────────────────────────────
        // 1) LABOR + PUESTO cuando NO hay laborId
        // ──────────────────────────────────────────
        if (!prevLaborId) {
          let laborIdForPuesto = "";

          if (hasLaborChanges) {
            // Crear labor con los datos provistos
            const created = await crearLaborMutation.mutateAsync(laborData!);
            laborIdForPuesto = String(created?.id ?? created?.labor?.id ?? "");
          } else if (hasPuestoInForm) {
            // No hay datos de labor pero sí queremos crear Puesto → crear una labor mínima
            const minimalLabor = {
              userId,
              fechaIngreso: null,
            } as CrearLaborDTO;
            const created = await crearLaborMutation.mutateAsync(minimalLabor);
            laborIdForPuesto = String(created?.id ?? created?.labor?.id ?? "");
          }

          // Crear puesto solo si hay nombre y ya tenemos laborId
          if (
            hasPuestoInForm &&
            laborData?.userId &&
            (laborIdForPuesto || prevLaborId)
          ) {
            await crearPuestoMutation.mutateAsync({
              laborId: laborIdForPuesto || prevLaborId!,
              name: puestoData!.name!,
            });
          }
        } else {
          // ────────────────────────────────────────
          // 2) LABOR + PUESTO cuando SÍ hay laborId
          // ────────────────────────────────────────

          // a) Actualizar LABOR solo si hay cambios
          if (hasLaborChanges) {
            const { userId: _omit, ...partial } = laborData!;
            if (Object.keys(partial).length > 0) {
              await actualizarLaborMutation.mutateAsync({
                laborId: prevLaborId,
                data: partial,
              });
            }
          }

          // b) PUESTO independiente
          if (hasPuestoInForm) {
            if (!prevPuestoId) {
              // No había puesto → crear
              await crearPuestoMutation.mutateAsync({
                laborId: prevLaborId,
                name: puestoData!.name!,
              });
            } else if (puestoChanged) {
              // Había puesto y cambió el nombre → actualizar
              await actualizarPuestoMutation.mutateAsync({
                puestoId: prevPuestoId,
                name: puestoData!.name!,
              });
            }
          }
        }

        // ──────────────────────────────────────────
        // 3) USER básico (si corresponde)
        // ──────────────────────────────────────────
        const userSection: Partial<CreateUserData> = {
          ...(user.fullName !== undefined && {
            fullName: user.fullName.trim(),
          }),
          ...(user.email !== undefined && { email: user.email.trim() }),
          ...(user.address !== undefined && { address: user.address }),
          ...(user.fechaNacimiento !== undefined && {
            fechaNacimiento: user.fechaNacimiento,
          }),
          ...(user.roles !== undefined && { roles: user.roles }),
          ...(user.password ? { password: user.password } : {}),
        };
        if (Object.keys(userSection).length) {
          await AuthService.editUsers(userId, userSection);
        }

        toast.success("Actualizado con éxito.");
        await refetchUsuarios();
        setModalState({ isOpen: false, mode: "edit" });
      } catch (e: any) {
        console.error("[UsersContent] handleSubmit(edit) error:", e);
        toast.error(e?.message || "Ocurrió un error al actualizar.");
      }
    }
  };

  const debounced = useMemo(() => {
    const id = setTimeout(() => {}, 0); // marcador
    return searchTerm.toLowerCase();
  }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!usuarios?.length) return [];
    const search = debounced;
    return usuarios.filter((user) => {
      const matchesSearch =
        (user.fullName ?? "").toLowerCase().includes(search) ||
        (user.email ?? "").toLowerCase().includes(search) ||
        (user.labor?.puestos ?? []).some((p) =>
          (p?.name ?? "").toLowerCase().includes(search)
        );
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "activo" && user.isActive) ||
        (statusFilter === "inactivo" && !user.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [usuarios, debounced, statusFilter]);

  const handleDeleteUser = (user: UserAdapted) => {
    setDeleteModal({ isOpen: true, user });
  };

  const confirmDelete = () => {
    if (deleteModal.user) {
      deleteMutation.mutate(deleteModal.user.id!);
    }
  };

  //HANDLES PARA ZONA Y SUCURSAL
  const handleAssignZona = async (zonaId: string, userId: number) => {
    if (!zonaId || !userId) return;
    console.log("[UsersContent] handleAssignZona →", {
      zonaId,
      userId: String(userId),
    });
    await asignarZonaMutation.mutateAsync({ zonaId, userId });
  };

  const handleAssingSucursal = async (sucid: string, userid: number) => {
    if (!sucid || !userid) return;

    await asignarSucursalMutation.mutateAsync({ sucid, userid });
  };
  //---------------------------------------

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
          onAssignZona={handleAssignZona}
          onAssignSucursal={handleAssingSucursal}
          isloading={
            modalState.mode === "create"
              ? createMutation.isPending
              : crearLaborMutation.isPending ||
                actualizarLaborMutation.isPending ||
                crearPuestoMutation.isPending ||
                actualizarPuestoMutation.isPending
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

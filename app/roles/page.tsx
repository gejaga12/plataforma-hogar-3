"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import { ApiRoles, Permiso } from "@/utils/api/apiRoles";
import RolesContent from "@/components/roles/RolesContent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Role } from "@/utils/types";
import toast from "react-hot-toast";

export interface RoleList extends Role {
   users: {
    id: string,
    fullName: string
  }[];
}

export interface CreateRoleData {
  id?: string | number;
  name: string;
  permissions?: Permiso[]; // puedes cambiarlo a string[] si lo manejás como keys directamente
  users: string[];
}

export default function RolesPage() {
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    role?: RoleList;
  }>({
    isOpen: false,
    mode: "create",
    role: undefined,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    role?: RoleList;
  }>({
    isOpen: false,
    role: undefined,
  });

  // Obtener los roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => ApiRoles.listarRoles(),
  });

  // Crear rol
  const createMutation = useMutation({
    mutationFn: async (data: CreateRoleData) => {
      return await ApiRoles.crearRol({
        name: data.name,
        permissions: data.permissions?.map((p) => p.key) || [], // aseguramos solo las keys
      });
    },
    onSuccess: () => {
      toast.success("Rol creado con exito!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setModalState({ isOpen: false, mode: "create", role: undefined });
    },
  });

  // Actualizar rol
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      role,
    }: {
      id: string;
      role: Partial<CreateRoleData>;
    }) => {
      return await ApiRoles.actualizarRol(id, {
        name: role.name || "",
        permissions: role.permissions?.map((p) => p.key) || [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setModalState({ isOpen: false, mode: "create", role: undefined });
    },
  });

  // Eliminar rol
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiRoles.eliminarRol(id),
    onSuccess: () => {
      toast.success("Rol eliminado");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeleteModal({ isOpen: false, role: undefined });
    },
  });

  return (
    <ProtectedLayout>
      <RolesContent
        roles={roles || []}
        isLoading={isLoading}
        modalState={modalState}
        setModalState={setModalState}
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        createRole={(data) => createMutation.mutate(data)}
        updateRole={(id, data) => updateMutation.mutate({ id, role: data })}
        deleteRole={(id) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
      />
    </ProtectedLayout>
  );
}

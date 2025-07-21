"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import { ApiRoles, Permiso, RolResponse } from "@/lib/api/apiRoles";
import RolesContent from "@/components/roles/RolesContent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Role } from "@/utils/types";

export interface RoleList extends Role {
  users?: string[];
}

export interface CreateRoleData {
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

  // Fetch roles desde la API
  const fetchRoles = async (): Promise<RolResponse[]> => {
    return await ApiRoles.listarRoles();
  };

  // Obtener los roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
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

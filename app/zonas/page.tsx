"use client";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import ZonaContent from "@/components/zonas/ZonaContent";
import { ZonaService } from "@/lib/api/apiZonas";
import { Zona } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

export interface CreateZonaData {
  name: string;
  paisId: string;
}

const ZonaPage = () => {
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    zona?: Zona;
  }>({
    isOpen: false,
    mode: "create",
    zona: undefined,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    zona?: Zona;
  }>({
    isOpen: false,
    zona: undefined,
  });

  // Obtener zonas
  const { data: zonas, isLoading } = useQuery({
    queryKey: ["zonas"],
    queryFn: ZonaService.getZonas,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateZonaData) => ZonaService.createZona(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
      setModalState({ isOpen: false, mode: "create", zona: undefined });
    },
  });

  //   // Actualizar zona
  //   const updateMutation = useMutation({
  //     mutationFn: ({ id, data }: { id: string; data: Partial<CreateZonaData> }) =>
  //       ZonaService.actualizarZona(id, data),
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["zonas"] });
  //       setModalState({ isOpen: false, mode: "edit", zona: undefined });
  //     },
  //   });

  //   // Eliminar zona
  //   const deleteMutation = useMutation({
  //     mutationFn: (id: string) => ZonaService.eliminarZona(id),
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["zonas"] });
  //       setDeleteModal({ isOpen: false, zona: undefined });
  //     },
  //   });

  return (
    <ProtectedLayout>
      <ZonaContent
        zonas={zonas || []}
        isLoading={isLoading}
        modalState={modalState}
        setModalState={setModalState}
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        createZona={(data) => createMutation.mutate(data)}
        //   updateZona={(id, data) => updateMutation.mutate({ id, data })}
        //   deleteZona={(id) => deleteMutation.mutate(id)}
        //   isDeleting={deleteMutation.isPending}
      />
    </ProtectedLayout>
  );
};

export default ZonaPage;

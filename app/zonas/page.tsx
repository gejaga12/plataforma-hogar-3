"use client";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import ZonaContent from "@/components/zonas/ZonaContent";
import { ZonaService } from "@/lib/api/apiZonas";
import { Zona } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

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

  const { data, isLoading } = useQuery({
    queryKey: ["zonas"],
    queryFn: () => ZonaService.allInfoZona(),
  });

  const zonas = data?.zonas ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CreateZonaData) => ZonaService.createZona(data),
    onSuccess: () => {
      toast.success("Zona creada con exito");
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
      setModalState({ isOpen: false, mode: "create", zona: undefined });
    },
  });

  // Actualizar zona
  const toggleMutation = useMutation({
    mutationFn: (id: string) => ZonaService.toggleZona(id),
    onSuccess: () => {
      toast.success("Zona actualizada");
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
  });

  return (
    <ProtectedLayout>
      <ZonaContent
        zonas={zonas}
        isLoading={isLoading}
        modalState={modalState}
        setModalState={setModalState}
        createZona={(data) => createMutation.mutate(data)}
        toggleMutation={(id) => toggleMutation.mutate(id)}
      />
    </ProtectedLayout>
  );
};

export default ZonaPage;

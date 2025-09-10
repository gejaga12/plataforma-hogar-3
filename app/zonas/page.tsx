"use client";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import ZonaContent from "@/components/zonas/ZonaContent";
import { CreateRegionDto, ZonaService } from "@/api/apiZonas";
import { Zona } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

const ZonaPage = () => {
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create";
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
  const paises = data?.paises ?? [];
  const provincias = data?.provincias ?? [];

  //  console.log("zonas:", zonas);
   console.log('provincias:', provincias);

  const createZonaMutation = useMutation({
    mutationFn: (data: CreateRegionDto) => {
      return ZonaService.createRegion(data);
    },
    onSuccess: () => {
      toast.success("Zona creada con exito");
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
      setModalState({ isOpen: false, mode: "create", zona: undefined });
    },
  });

  const addPronviceMutation = useMutation({
    mutationFn: (data: { zonaId: string; provinciaIds: string[] }) => {
      return ZonaService.addProvince(data.zonaId, data.provinciaIds);
    },
    onSuccess: () => {
      toast.success("Provincias(s) agregadas con éxito.");
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
    onError: () => {
      toast.error("No se pudo agregar la(s) provincia(s). Intente nuevamente.");
    },
  });

  const deleteZonaMutation = useMutation({
    mutationFn: (data: { zonaId: string }) => {
      return ZonaService.deleteZona(data.zonaId);
    },
    onSuccess: () => {
      toast.success("Zona eliminada con exito.");
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
    onError: (error) => {
      console.log("Error:", error);
      toast.error("Ocurrio un error al eliminar la zona");
    },
  });

  // Actualizar zona
  const onToggleZona = useMutation({
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
        paises={paises}
        provincias={provincias}
        isLoading={isLoading}
        modalState={modalState}
        setModalState={setModalState}
        createZona={(data) => createZonaMutation.mutate(data)}
        toggleMutation={(id) => onToggleZona.mutate(id)}
        
        addPronviceMutation={(data: {
          zonaId: string;
          provinciaIds: string[];
        }) => addPronviceMutation.mutate(data)}
        deleteZona={(data: { zonaId: string }) =>
          deleteZonaMutation.mutate(data)
        }
      />
    </ProtectedLayout>
  );
};

export default ZonaPage;

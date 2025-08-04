"use client";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import ZonaContent from "@/components/zonas/ZonaContent";
import { CreateRegionDto, ZonaService } from "@/api/apiZonas";
import { Zona } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
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

  // console.log("zonas:", zonas);
  // console.log('paises:', paises);
  //  console.log('provincias:', provincias);

  const createZonaMutation = useMutation({
    mutationFn: (data: CreateRegionDto) => {
      console.log("📤 Payload enviado a createZona:", data);
      return ZonaService.createRegion(data);
    },
    onSuccess: () => {
      toast.success("Zona creada con exito");
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
      setModalState({ isOpen: false, mode: "create", zona: undefined });
    },
  });

  const createPaisMutation = useMutation({
    mutationFn: (name: string) => ZonaService.crearPais({ name }),
    onSuccess: () => {
      toast.success("País creado con éxito");
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
    onError: () => {
      toast.error("Hubo un error al crear el país");
    },
  });

  const createProvinciaMutation = useMutation({
    mutationFn: (name: string) => {
      console.log("creando pronvicia", name);
      return ZonaService.crearProvincia({ name });
    },
    onSuccess: () => {
      toast.success("Provincia creada con éxito");
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
    onError: () => {
      toast.error("Hubo un error al crear la provincia");
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
        createPaisMutation={(name) => createPaisMutation.mutate(name)}
        createPronvinciaMutation={(name) =>
          createProvinciaMutation.mutate(name)
        }
      />
    </ProtectedLayout>
  );
};

export default ZonaPage;

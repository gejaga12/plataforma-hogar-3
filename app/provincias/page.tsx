"use client";

import { ZonaService } from "@/api/apiZonas";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import ProvinciasContent from "@/components/provincias/ProvinciaContent";
import { queryClient } from "@/utils/query-client";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type CrearProvinciaInput = {
  name: string;
  paisId: string;
  regionId: string;
  code?: number;
};

export default function ProvinciasPage() {
  const createProvinciaMutation = useMutation({
    mutationFn: (data: CrearProvinciaInput) => ZonaService.crearProvincia(data),
    
    onSuccess: () => {  
      toast.success("Provincia creada con éxito");
      //invalidamos ambas querys para que Zona este actualizado siempre
      queryClient.invalidateQueries({ queryKey: ["provincias"] });
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
    onError: (error) => {
      toast.error("Hubo un error al crear la provincia");
      console.log("Error:", error);
    },
  });

  const deleteProvinciaMutation = useMutation({
    mutationFn: (id: string) => ZonaService.deleteProvincia(id),
    onSuccess: () => {
      toast.success("Provincia eliminada con exito.");
      queryClient.invalidateQueries({ queryKey: ["provincias"] });
    },
    onError: (error) => {
      toast.error("Ocurrio un error al eliminar la provincia");
      console.log("Error:", error);
    },
  });

  return (
    <ProtectedLayout>
      <ProvinciasContent
        createPronvincia={(data) => createProvinciaMutation.mutate(data)}
        deleteProvincia={(id) => deleteProvinciaMutation.mutateAsync(id)}
      />
    </ProtectedLayout>
  );
}

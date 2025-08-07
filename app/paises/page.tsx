"use client";

import { ZonaService } from "@/api/apiZonas";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import PaisesContent from "@/components/paises/PaisesContent";
import { queryClient } from "@/utils/query-client";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import toast from "react-hot-toast";

export default function PaisesPage() {
  const createPaisMutation = useMutation({
    mutationFn: (name: string) => ZonaService.crearPais({ name }),
    onSuccess: () => {
      toast.success("País creado con éxito");
      queryClient.invalidateQueries({ queryKey: ["paises"] });
    },
    onError: () => {
      toast.error("Hubo un error al crear el país");
    },
  });

  const deletePaisMutation = useMutation({
    mutationFn: (id: string) => ZonaService.deletePais(id),
    onSuccess: () => {
      toast.success("Pais eliminado con exito.");
      queryClient.invalidateQueries({ queryKey: ["paises"] });
    },
    onError: (error) => {
      toast.error("Ocurrio un error al eliminar el pais.");
      console.log("Error:", error);
    },
  });

  return (
    <ProtectedLayout>
      <PaisesContent
        createPais={(name) => createPaisMutation.mutate(name)}
        deletePais={(id) => deletePaisMutation.mutate(id)}
      />
    </ProtectedLayout>
  );
}

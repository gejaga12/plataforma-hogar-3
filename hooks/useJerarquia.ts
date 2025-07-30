// hooks/useJerarquia.ts
import { useQuery } from "@tanstack/react-query";
import { JerarquiaService } from "@/api/apiJerarquia";
import { useEffect } from "react";

export const useJerarquia = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["jerarquia"],
    queryFn: async () => {
      console.log("✅ Ejecutando getJerarquiaCompleta");
      return JerarquiaService.getJerarquiaCompleta();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  useEffect(() => {
    if (data) {
      console.log("🌳 Datos cargados:", data.areas, data.tree);
    }
  }, [data]);

  return {
    jerarquia: data?.tree || [],
    areas: data?.areas || [],
    isLoading,
    isError,
    refetchJerarquia: refetch,
  };
};

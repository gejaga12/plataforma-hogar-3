// hooks/useJerarquia.ts
import { useQuery } from "@tanstack/react-query";
import { JerarquiaService } from "@/utils/api/apiJerarquia";

export const useJerarquia = () => {
  const {
    data: jerarquiaData,
    isLoading: isLoadingJerarquia,
    isError: isErrorJerarquia,
    refetch: refetchJerarquia,
  } = useQuery({
    queryKey: ["jerarquia"],
    queryFn: async () => {
      return JerarquiaService.getJerarquiaCompleta();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const {
    data: nodosDisponibles,
    isLoading: isLoadingNodos,
    isError: isErrorNodos,
    refetch: refetchNodos,
  } = useQuery({
    queryKey: ["nodos-disponibles"],
    queryFn: JerarquiaService.getNodosDisponibles,
    staleTime: 1000 * 60 * 5,
  });

  return {
    jerarquia: jerarquiaData?.tree || [],
    areas: jerarquiaData?.areas || [],
    nodosDisponibles: nodosDisponibles || [],
    isLoading: isLoadingJerarquia || isLoadingNodos,
    isError: isErrorJerarquia || isErrorNodos,
    refetchJerarquia,
    refetchNodos,
  };
};


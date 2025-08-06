"use client";
import { SucursalHogarService } from "@/api/apiSucursalHogar";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import SucursalesContent from "@/components/sucursales/SucursalContent";
import { queryClient } from "@/utils/query-client";
import { SucursalHogar } from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function SucursalesPage() {
  const { data: sucursales, isLoading: isLoadingSucursales } = useQuery({
    queryKey: ["sucursalesHogar"],
    queryFn: () => SucursalHogarService.getAllSucursalesHogar(),
  });

  // console.log("Sucursales hogar:", sucursales);

  //MUTATIONS
  const crearSucursalMutation = useMutation({
    mutationFn: async (data: SucursalHogar) => {
      return await SucursalHogarService.crearSucursalHogar(data);
    },
    onSuccess: () => {
      toast.success("Sucursal creada correctamente");
      queryClient.invalidateQueries({
        queryKey: ["sucursalesHogar"],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear la sucursal");
      console.log("Error:", error);
    },
  });

  const deleteSucursalMutation = useMutation({
    mutationFn: async (data: string) => {
      return await SucursalHogarService.deleteSucursalHogar(data);
    },
    onSuccess: () => {
      toast.success("Sucursal eliminada con exito.");
      queryClient.invalidateQueries({
        queryKey: ["sucursalesHogar"],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar la sucursal");
      console.log("Error:", error);
    },
  });

  return (
    <ProtectedLayout>
      <SucursalesContent
        sucursales={sucursales}
        isLoadingSucursales={isLoadingSucursales}
        onCrearSucursal={(data) => crearSucursalMutation.mutate(data)}
        deleteSucursal={(data) => deleteSucursalMutation.mutate(data)}
      />
    </ProtectedLayout>
  );
}

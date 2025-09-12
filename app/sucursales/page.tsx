"use client";
import { SucursalesService } from "@/api/apiSucursales";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import SucursalesContent from "@/components/sucursales-internas/SucursalContent";
import { queryClient } from "@/utils/query-client";
import { Sucursal } from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function SucursalesPage() {
  const { data: sucursales, isLoading: isLoadingSucursales } = useQuery({
    queryKey: ["sucursales-hogar"],
    queryFn: () => SucursalesService.getAllSucursalesHogar(),
  });

  //MUTATIONS
  const crearSucursalMutation = useMutation({
    mutationFn: async (data: Sucursal) => {
      return await SucursalesService.crearSucursalHogar(data);
    },
    onSuccess: () => {
      toast.success("Sucursal creada correctamente");
      queryClient.invalidateQueries({
        queryKey: ["sucursales-hogar"],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear la sucursal");
      console.log("Error:", error);
    },
  });

  const deleteSucursalMutation = useMutation({
    mutationFn: async (data: string) => {
      return await SucursalesService.deleteSucursalHogar(data);
    },
    onSuccess: () => {
      toast.success("Sucursal eliminada con exito.");
      queryClient.invalidateQueries({
        queryKey: ["sucursales-hogar"],
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
        sucursales={sucursales ?? []}
        isLoadingSucursales={isLoadingSucursales}
        onCrearSucursal={(data) => crearSucursalMutation.mutate(data)}
        deleteSucursal={(data) => deleteSucursalMutation.mutate(data)}
      />
    </ProtectedLayout>
  );
}

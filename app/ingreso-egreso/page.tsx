"use client";

import { LogIn, LogOut } from "lucide-react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { useQuery } from "@tanstack/react-query";
import { ingresoService } from "@/api/apiIngreso";
import { MovimientoIngresoEgreso } from "@/utils/types";
import IngresoEgresoContent from "@/components/ingreso-egreso/IngresoEgresoContent";

function mapMovimientosFromApi(apiData: any[]): MovimientoIngresoEgreso[] {
  return apiData.map((item) => ({
    id: item.id,
    usuario: {
      id: item.user ?? "sin-id",
      nombreCompleto: item.user ?? "Usuario desconocido",
      rol: "",
    },
    tipo: item.typeAction?.toUpperCase() === "INGRESO" ? "INGRESO" : "EGRESO",
    fechaHora: item.date,
    motivo: item.reason,
    modo: item.modo,
    // opcionales
    dispositivo: "Web Portal",
    ipAddress: "-",
    registradoPor: "Registro automático",
    createdAt: item.date,
  }));
}

const tipoConfig = {
  INGRESO: {
    label: "Ingreso",
    color: "bg-green-100 text-green-800",
    icon: LogIn,
  },
  EGRESO: {
    label: "Egreso",
    color: "bg-red-100 text-red-800",
    icon: LogOut,
  },
};

export default function IngresoEgresoPage() {
  const {
    data: movimientosRaw = [],
    isLoading,
    refetch,
  } = useQuery<MovimientoIngresoEgreso[]>({
    queryKey: ["movimientos"],
    queryFn: async () => {
      const response = await ingresoService.fetchIngresos();
      return mapMovimientosFromApi(response);
    },
  });

  console.log("movimientos:", movimientosRaw);

  return (
    <ProtectedLayout>
      <IngresoEgresoContent
        movimientos={movimientosRaw}
        isLoading={isLoading}
        refetch={refetch}
        tipoConfig={tipoConfig}
      />
    </ProtectedLayout>
  );
}

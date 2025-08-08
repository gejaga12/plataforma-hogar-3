"use client";
import { ProtectedLayout } from "@/components/layout/protected-layout";

import OrganigramaContent from "@/components/organigrama/OrganigramaContent";

// Configuración de áreas con colores
export const areaColors = {
  GERENCIA:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  RRHH: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  IT: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  ADMINISTRACION:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  TECNICA:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  "GESTION DE ACTIVOS":
    "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  "GESTION DE TALENTO":
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
  "HIGIENE Y SEGURIDAD":
    "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
  "GESTION DE CALIDAD":
    "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400",
  VENTAS: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400",
};

export default function OrganigramaPage() {

  return (
    <ProtectedLayout>
      <OrganigramaContent />
    </ProtectedLayout>
  );
}

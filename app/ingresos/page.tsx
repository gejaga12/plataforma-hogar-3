"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import IngresosContent from "@/components/proceso-de-ingreso/IngresosContent";

export default function IngresosPage() {
  return (
    <ProtectedLayout>
      <IngresosContent />
    </ProtectedLayout>
  );
}

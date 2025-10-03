"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import { NovedadesAdmin } from "@/components/novedades/NovedadesContent";

export default function NovedadesPage() {
  return (
    <ProtectedLayout>
      <NovedadesAdmin />
    </ProtectedLayout>
  );
}

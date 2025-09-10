"use client";

import { ClientesContent } from "@/components/clientes/ClientesContent";
import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function ClientesPage() {
  return (
    <ProtectedLayout>
      <ClientesContent />
    </ProtectedLayout>
  );
}

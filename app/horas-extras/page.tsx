"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import HorasExtrasContent from "@/components/horas-extras/HorasExtrasContent";

export default function HorasExtrasPage() {
  return (
    <ProtectedLayout>
      <HorasExtrasContent />
    </ProtectedLayout>
  );
}

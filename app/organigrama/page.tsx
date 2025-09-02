"use client";
import { ProtectedLayout } from "@/components/layout/protected-layout";

import OrganigramaContent from "@/components/organigrama/OrganigramaContent";

export default function OrganigramaPage() {

  return (
    <ProtectedLayout>
      <OrganigramaContent />
    </ProtectedLayout>
  );
}

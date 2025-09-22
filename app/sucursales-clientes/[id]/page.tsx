import SectoresContent from "@/components/sucursales-clientes/SectoresContent";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import React from "react";

const SectoresPage = ({ params }: { params: { id: string } }) => {
  return (
    <ProtectedLayout>
      <SectoresContent sucursalid={params.id} />
    </ProtectedLayout>
  );
};

export default SectoresPage;

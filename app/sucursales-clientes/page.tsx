import { ProtectedLayout } from '@/components/layout/protected-layout';
import SucursalesClienteContent from '@/components/sucursales-clientes/SucursalesClienteContent';
import React from 'react'

const page = () => {
    return (
    <ProtectedLayout>
      <SucursalesClienteContent />
    </ProtectedLayout>
  );
}

export default page;
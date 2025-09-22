'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import EquiposContent from '@/components/equipos/EquipoContent';


export default function EquiposPage() {
  return (
    <ProtectedLayout>
      <EquiposContent />
    </ProtectedLayout>
  );
}
'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import FlujosContent from '@/components/flujos/FlujosContent';


export default function ServiciosPage() {
  return (
    <ProtectedLayout>
      <FlujosContent />
    </ProtectedLayout>
  );
}
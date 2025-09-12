'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import PanoramicaContent from '@/components/panoramica/PanoramicaContent';

export default function PanoramicaPage() {
  return (
    <ProtectedLayout>
      <PanoramicaContent />
    </ProtectedLayout>
  );
}
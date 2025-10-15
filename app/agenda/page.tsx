'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import { AgendaContent } from '@/components/agenda/AgendaContent';

export default function AgendaPage() {
  return (
    <ProtectedLayout>
      <AgendaContent />
    </ProtectedLayout>
  );
}
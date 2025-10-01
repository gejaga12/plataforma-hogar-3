'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';



export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <DashboardContent />
    </ProtectedLayout>
  );
}
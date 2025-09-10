'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import { OrdersContent } from '@/components/ordenes-de-trabajo/OrdersContent';


export default function OrdersPage() {
  return (
    <ProtectedLayout>
      <OrdersContent />
    </ProtectedLayout>
  );
}
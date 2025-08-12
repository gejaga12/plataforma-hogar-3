'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import TaskContent from '@/components/task/TaskContent';



export default function TaskPage() {
  return (
    <ProtectedLayout>
      <TaskContent />
    </ProtectedLayout>
  );
}
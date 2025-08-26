'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import TaskCrear from '@/components/task-crear/TaskCrear';


export default function TaskPage() {
  return (
    <ProtectedLayout>
      <TaskCrear />
    </ProtectedLayout>
  );
}
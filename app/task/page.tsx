'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import TaskCrearDos from '@/components/task/TaskCrear';


export default function TaskPage() {
  return (
    <ProtectedLayout>
      <TaskCrearDos />
    </ProtectedLayout>
  );
}
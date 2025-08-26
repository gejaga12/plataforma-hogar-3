"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import { TaskLista } from "@/components/task-lista/TaskLista";



export default function ModulosPage() {
  return (
    <ProtectedLayout>
      <TaskLista />
    </ProtectedLayout>
  );
}

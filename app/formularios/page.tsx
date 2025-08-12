"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import FormulariosContent from "@/components/formularios/FormulariosContent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { TaskServices } from "@/api/apiFormularios";
import { Task } from "@/utils/types";

export default function FormulariosPage() {
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);

  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading: isLoadingTasks,
    refetch,
  } = useQuery({
    queryKey: ["tasks", { limit, offset }],
    queryFn: () => TaskServices.getTasks(limit, offset),
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: Task) => TaskServices.crearTask(payload),
    onSuccess: () => {
      // refrescamos la lista
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // handlers a pasar al hijo
  const handleCreateTask = (payload: Task) => {
    createTaskMutation.mutate(payload);
  };

  const handleNextPage = () => setOffset((prev) => prev + limit);
  const handlePrevPage = () => setOffset((prev) => Math.max(0, prev - limit));

  return (
    <ProtectedLayout>
     <FormulariosContent
        // datos
        formularios={tasks ?? []}
        isLoadingTasks={isLoadingTasks}
        // crear
        onCreateTask={handleCreateTask}
        // paginación
        limit={limit}
        offset={offset}
        setLimit={setLimit}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        refetchTasks={refetch}
      />
    </ProtectedLayout>
  );
}

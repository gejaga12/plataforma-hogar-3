"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import FormulariosContent from "@/components/formularios/FormulariosContent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { TaskServices } from "@/api/apiFormularios";
import { PlanTasks, Task } from "@/utils/types";

export default function FormulariosPage() {
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);

  const queryClient = useQueryClient();

  const {
    data: planTasks,
    isLoading: isLoadingPlanTasks,
    refetch,
  } = useQuery({
    queryKey: ["planTasks", { limit, offset }],
    queryFn: () => TaskServices.fetchPlanTask(limit, offset),
  });

  console.log("plan-tasks:", planTasks);

  const createTaskMutation = useMutation({
    mutationFn: (payload: PlanTasks) => {
      console.log("📤 Enviando payload a /plan-task:", payload);
      return TaskServices.crearPlanTasks(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planTasks"] });
    },
    onError: (err: any) => {
      console.error(err);
    },
  });

  // handlers a pasar al hijo
  const handleCreateTask = (payload: PlanTasks) => {
    createTaskMutation.mutate(payload);
  };

  const handleNextPage = () => setOffset((prev) => prev + limit);
  const handlePrevPage = () => setOffset((prev) => Math.max(0, prev - limit));

  return (
    <ProtectedLayout>
      <FormulariosContent
        formularios={planTasks ?? []}
        isLoadingPlanTasks={isLoadingPlanTasks}
        onCreateTask={handleCreateTask}
        isCreating={createTaskMutation.isPending}
      />
    </ProtectedLayout>
  );
}

import { Task } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import TaskBusquedaYTabla from "./TaskBusquedaYTabla";
import TaskCrearDos from "./TaskCrearDos";
import TaskCrear from "./TaskCrear";

interface TaskContentProps {}

const TaskContent: React.FC<TaskContentProps> = ({}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    task?: Task;
  }>({
    isOpen: false,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗂️ Tareas</h1>
          <p className="text-gray-600 mt-1">Crea y gestiona las task</p>
        </div>
      </div>

      <TaskCrearDos campo={modalState.task} />
    </div>
  );
};

export default TaskContent;

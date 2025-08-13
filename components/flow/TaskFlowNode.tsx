// components/flow/TaskFlowNode.tsx
"use client";


import { Clock } from "lucide-react";
import { Task } from "@/utils/types";
import { Handle, NodeProps, Position } from "reactflow";

type Subtask = Task["subtasks"][number];

type Data = {
  kind: "task" | "subtask";
  task?: Task;
  subtask?: Subtask;
};

function getPriorityClasses(p?: string) {
  const key = (p ?? "").toLowerCase();
  if (key === "alta") return "bg-red-100 text-red-700 ring-1 ring-red-200";
  if (key === "media") return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  if (key === "baja") return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
}

function fmtDur(d?: { horas: number; minutos: number }) {
  const h = Number(d?.horas ?? 0);
  const m = Number(d?.minutos ?? 0);
  return `${h}h ${m}m`;
}

export default function TaskFlowNode({ data }: NodeProps<Data>) {
  const { kind, task, subtask } = data;

  const title =
    kind === "task" ? (task?.code || "Task") : (subtask?.description || "SubTask");

  const priorityBadge =
    kind === "task" ? (
      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityClasses(task?.priority)}`}>
        {task?.priority}
      </span>
    ) : null;

  // --- Handles de salida según tipo ---
  let rightHandles: { id: string; label: string }[] = [{ id: "out", label: "out" }];

  if (kind === "subtask") {
    if (subtask?.type === "si_no") {
      rightHandles = [
        { id: "yes", label: "Sí" },
        { id: "no",  label: "No" },
      ];
    } else if (subtask?.type === "multi-choice") {
      const labels = (subtask?.options ?? []).map((o, i) => o.title || `Opción ${i + 1}`);
      rightHandles = labels.length
        ? labels.map((lbl, i) => ({ id: `opt-${i}`, label: lbl }))
        : [{ id: "opt-0", label: "Opción" }];
    }
  }

  // Distribuir verticalmente los handles derechos
  const handleTop = (i: number, total: number) => {
    if (total <= 1) return "50%";
    const gap = 60 / Math.max(total - 1, 1);
    return `${20 + i * gap}%`;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm min-w-[230px]">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-gray-900 truncate">{title}</span>
        {priorityBadge}
      </div>

      {kind === "task" && (
        <div className="p-3 text-xs text-gray-600 flex items-center gap-1.5">
          <Clock size={14} />
          <span>Duración: {fmtDur(task?.duration)}</span>
        </div>
      )}

      {/* Entrada */}
      <Handle type="target" position={Position.Left} id="in" />

      {/* Salidas */}
      {rightHandles.map((h, i) => (
        <Handle
          key={h.id}
          type="source"
          position={Position.Right}
          id={h.id}
          style={{ top: handleTop(i, rightHandles.length) }}
        />
      ))}
    </div>
  );
}

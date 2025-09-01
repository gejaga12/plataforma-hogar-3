"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { Tipos } from "@/utils/types";

// NOTA: usamos NodeProps<any> para no depender de los types del padre.
// Si luego querés, podés importar RootData/UINodeData desde el padre.

export function RootNode({ data }: NodeProps<any>) {
  return (
    <div className="rounded-2xl border-4 border-orange-500 bg-white px-6 py-6 shadow-lg w-[320px] text-center">
      <div className="text-lg font-extrabold text-gray-800">
        {data?.label || "TASK"}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="root"
        className="w-3 h-3 bg-orange-500 rounded-full"
      />
    </div>
  );
}

export function SubtaskNode({ data }: NodeProps<any>) {
  const opts = data?.options ?? [];
  const isRightSide = data?.type === Tipos.existencia || data?.type === Tipos.select;

  const isSecondary = !!data?.isSecondary;
  const bgClass = isSecondary ? "bg-yellow-100" : "bg-blue-50";
  const borderClass = isSecondary
    ? "border-2 border-dashed border-yellow-400"
    : "border-blue-400";

  return (
    <div className={`relative rounded-xl border w-[300px] shadow ${bgClass} ${borderClass}`}>
      {/* ENTRADA por la izquierda */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-2 h-2 bg-gray-400 rounded-full -left-1"
      />

      {/* CONTENIDO */}
      <div className="px-3 py-2 border-b text-sm font-semibold whitespace-pre-wrap break-words">
        {data?.description || "Subtarea sin título"}
      </div>

      <div className="px-3 py-2 text-xs space-y-1">
        <div>
          <span className="font-medium">Tipo:</span> {data?.type ?? "-"}
        </div>
        <div>
          <span className="font-medium">Grupo:</span> {data?.group || "-"}
        </div>
        <div>
          <span className="font-medium">Requerida:</span>{" "}
          {data?.required ? "Sí" : "No"} •{" "}
          <span className="font-medium">Archivos:</span>{" "}
          {data?.FilesRequired ? "Sí" : "No"}
        </div>
        {data?.type === Tipos.numero && (
          <div>
            <span className="font-medium">Repeat:</span>{" "}
            {typeof data?.repeat === "number" ? data?.repeat : "-"}
          </div>
        )}
      </div>

      {/* OPCIONES EN COLUMNA (debajo) */}
      {isRightSide && opts.length > 0 && (
        <div className="px-3 pb-3 pt-1">
          <div className="text-[11px] font-medium mb-1">Opciones</div>
          <ul className="space-y-1">
            {opts.map((o: any) => (
              <li
                key={o.id}
                className="relative flex items-center justify-between text-[11px] bg-white/60 rounded px-2 py-1"
              >
                <span className="pr-6 break-words">
                  {o.title}
                  {typeof o.incidencia === "number" ? ` (inc. ${o.incidencia})` : ""}
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={o.id}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-gray-500 rounded-full shadow"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

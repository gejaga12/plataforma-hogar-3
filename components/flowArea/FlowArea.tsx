"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  addEdge,
  MarkerType,
} from "reactflow";
import type { Node, Connection, XYPosition, NodeTypes } from "reactflow";

import type { Subtasks, Task } from "@/utils/types";
import { Tipos } from "@/utils/types";
import "reactflow/dist/style.css";
import { RootNode, SubtaskNode } from "./FlowNodes";

/** ===== Tipos UI mínimos (no tocan al back) ===== **/
type UIOption = { id: string; title: string; incidencia?: number };
type RootData = { label: string };
type FlowEdgeData = {
  optionId?: string | null; // id del handle (opción) que origina el edge
  kind: "auto" | "user"; // auto = generado por mainline, user = conectado manualmente
};

type FlowNodeData = UINodeData | RootData;
type RFNode = Node<FlowNodeData>;

type UINodeData = Omit<Subtasks, "options"> & {
  id: string;
  type?: Tipos;
  options: UIOption[]; // solo para UI; al export mappeamos a {title, depends}
  repeat?: number;
  isMainline?: boolean;
  isSecondary?: boolean;
};

/** ===== Constantes/Utils ===== **/
const ROOT_ID = "__root__";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function optionsFor(type?: Tipos, keep?: UIOption[]): UIOption[] {
  if (type === Tipos.existencia) {
    // regenero Sí/No con nuevos ids
    return [
      { id: uid(), title: "Sí" },
      { id: uid(), title: "No" },
    ];
  }
  if (type === Tipos.select) {
    // mantiene existentes o arranca vacío
    return keep && keep.length ? keep : [];
  }
  // Tipos.numero y demás → sin opciones
  return [];
}

const nodeTypes: NodeTypes = {
  rootNode: RootNode,
  subtask: SubtaskNode,
};

/** ====== Props ====== **/
interface FlowAreaProps {
  onBuildSubtasks: (subtasks: Subtasks[]) => void; // payload back
  rootLabel: string; // code de la Task
}

/** ====== Componente principal ====== **/
function FlowAreaInner({ onBuildSubtasks, rootLabel }: FlowAreaProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Paleta (UI)
  const [palette, setPalette] = useState<UINodeData[]>([
    {
      id: uid(),
      description: "",
      type: Tipos.existencia,
      group: "",
      required: true,
      FilesRequired: false,
      options: optionsFor(Tipos.existencia),
    },
    {
      id: uid(),
      description: "",
      type: Tipos.texto,
      group: "",
      required: true,
      FilesRequired: true,
      options: optionsFor(Tipos.texto),
    },
  ]);

  // Grafo
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdgeData>([]);

  // Crear/actualizar root
  useEffect(() => {
    setNodes((prev) => {
      const exists = prev.find((n) => n.id === ROOT_ID);
      if (exists) {
        return prev.map((n) =>
          n.id === ROOT_ID
            ? { ...n, data: { label: rootLabel || "TASK" } as RootData }
            : n
        );
      }
      const rootNode: RFNode = {
        id: ROOT_ID,
        type: "rootNode",
        position: { x: 600, y: 20 },
        data: { label: rootLabel || "TASK" },
      };
      return [rootNode, ...prev];
    });
  }, [rootLabel, setNodes]);

  /** ----- Drag&Drop desde paleta ----- **/
  const onDragStart = (e: React.DragEvent, item: UINodeData) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const dropPosition = useCallback((e: React.DragEvent): XYPosition => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 100, y: 150 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/reactflow");
      if (!raw) return;

      const pos = dropPosition(e);
      const src = JSON.parse(raw) as Partial<UINodeData>;
      const id = uid();

      const newNode: RFNode = {
        id,
        type: "subtask",
        position: { x: pos.x, y: Math.max(pos.y, 140) },
        data: {
          id,
          description: src.description ?? "",
          group: src.group ?? "",
          required: !!src.required,
          FilesRequired: !!src.FilesRequired,
          type: src.type ?? Tipos.texto,
          options: optionsFor(src.type, src.options as UIOption[] | undefined),
          repeat:
            src.type === Tipos.numero ? (src.repeat as number) : undefined,
          isSecondary: false, // por defecto main
        },
      };

      setNodes((prev) => [...prev, newNode]);

      // 🔑 Conectar automáticamente al root como main
      setEdges((prev) => [
        ...prev,
        {
          id: uid(),
          source: ROOT_ID,
          target: id,
          sourceHandle: "root",
          data: { kind: "auto", optionId: null },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
      ]);
    },
    [setNodes, setEdges, dropPosition]
  );

  const onConnect = (params: Connection) => {
    const sourceNode = nodes.find((n) => n.id === params.source);
    const targetNode = nodes.find((n) => n.id === params.target);
    if (!sourceNode || !targetNode) return;
    if (sourceNode.type !== "subtask" || targetNode.type !== "subtask") return;

    const sourceHasOptions =
      "type" in sourceNode.data &&
      (sourceNode.data.type === Tipos.existencia ||
        sourceNode.data.type === Tipos.select);

    const isLeftConnection = params.targetHandle === "left";

    // 🔑 Caso especial: rama secundaria
    if (isLeftConnection && sourceHasOptions) {
      // marcar target como secundario
      setNodes((nds) =>
        nds.map((n) =>
          n.id === params.target
            ? { ...n, data: { ...n.data, isSecondary: true } }
            : n
        )
      );

      // eliminar conexión root -> target
      setEdges((eds) =>
        eds
          .filter((e) => !(e.source === ROOT_ID && e.target === params.target))
          .concat([
            {
              ...params,
              id: uid(),
              source: params.source ?? "",
              target: params.target ?? "",
              sourceHandle: params.sourceHandle ?? undefined,
              targetHandle: params.targetHandle ?? undefined,
              data: { kind: "user", optionId: params.sourceHandle ?? null },
              markerEnd: { type: MarkerType.ArrowClosed },
            },
          ])
      );
      return;
    }

    // conexión normal
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          data: { kind: "user", optionId: params.sourceHandle ?? null },
        },
        eds
      )
    );
  };

  /** ----- Mainline automática ----- **/
  useEffect(() => {
    const secondaryIds = new Set<string>();
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    edges.forEach((e) => {
      const sourceNode = nodeMap.get(e.source);
      if (
        sourceNode?.type === "subtask" &&
        "type" in sourceNode.data &&
        (sourceNode.data.type === Tipos.existencia ||
          sourceNode.data.type === Tipos.select) &&
        e.targetHandle === "left"
      ) {
        secondaryIds.add(e.target);
      }
    });

    setNodes((prev) => {
      let changed = false;
      const updated = prev.map((node) => {
        if (node.type !== "subtask") return node;
        const sec = secondaryIds.has(node.id);
        if ((node.data as UINodeData).isSecondary !== sec) {
          changed = true;
          return {
            ...node,
            data: {
              ...(node.data as UINodeData),
              isSecondary: sec,
            },
          };
        }
        return node;
      });
      return changed ? updated : prev;
    });
  }, [edges, nodes, setNodes]);

  /** ----- Serialización a Subtasks[] (solo edges manuales) ----- **/
  const toSubtasks = (): Subtasks[] => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const yOf = (id: string) => byId.get(id)?.position.y ?? 0;

    const isSecondary = (id: string): boolean => {
      const node = byId.get(id);
      return (
        node?.type === "subtask" &&
        "isSecondary" in node.data &&
        !!node.data.isSecondary
      );
    };

    const mainNodes = nodes
      .filter((n) => n.type === "subtask" && !isSecondary(n.id))
      .sort((a, b) => a.position.y - b.position.y); // Orden vertical

    const buildSubtask = (id: string, seen: Set<string>): Subtasks => {
      const node = byId.get(id);
      if (!node || node.type !== "subtask" || !("type" in node.data)) {
        return {
          description: "",
          group: "",
          required: false,
          FilesRequired: false,
        };
      }

      const data = node.data as UINodeData;

      if (seen.has(id)) {
        return {
          description: data.description,
          group: data.group,
          required: data.required,
          FilesRequired: data.FilesRequired,
        };
      }

      const newSeen = new Set(seen);
      newSeen.add(id);

      const outgoingEdges = edges.filter(
        (e) => e.source === id && e.data?.kind === "user" && e.data?.optionId
      );

      const byOption = new Map<string, string[]>();
      outgoingEdges.forEach((e) => {
        const key = e.data!.optionId!;
        const list = byOption.get(key) || [];
        list.push(e.target);
        byOption.set(key, list);
      });

      let mappedOptions: Subtasks["options"] | undefined = undefined;

      if (
        (data.type === Tipos.existencia || data.type === Tipos.select) &&
        data.options.length > 0
      ) {
        mappedOptions = data.options.map((opt) => {
          // 👇 ordena los hijos de esta opción por Y ascendente
          const dependsIds = (byOption.get(opt.id) || []).sort(
            (a, b) => yOf(a) - yOf(b)
          );
          const depends = dependsIds.map((depId) =>
            buildSubtask(depId, newSeen)
          );
          return {
            title: opt.title,
            incidencia: typeof opt.incidencia === "number" ? opt.incidencia : 0,
            depends,
          };
        });
      }

      return {
        description: data.description,
        group: data.group,
        required: data.required,
        FilesRequired: data.FilesRequired,
        ...(data.type ? { type: data.type } : {}),
        ...(data.type === Tipos.numero && typeof data.repeat === "number"
          ? { repeat: data.repeat }
          : {}),
        ...(mappedOptions ? { options: mappedOptions } : {}),
      };
    };

    return mainNodes.map((n) => buildSubtask(n.id, new Set()));
  };

  /** ----- Acciones paleta ----- **/
  const addNewPaletteItem = () => {
    setPalette((p) => [
      ...p,
      {
        id: uid(),
        description: "",
        type: Tipos.texto,
        group: "",
        required: false,
        FilesRequired: false,
        options: optionsFor(Tipos.texto),
      },
    ]);
  };

  const patchPaletteItem = (
    id: string,
    patch: Partial<UINodeData> & { options?: UIOption[] }
  ) => {
    setPalette((p) => p.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addOptionToPalette = (id: string) => {
    setPalette((p) =>
      p.map((it) =>
        it.id === id
          ? {
              ...it,
              options: [
                ...it.options,
                { id: uid(), title: `Opción ${it.options.length + 1}` },
              ],
            }
          : it
      )
    );
  };

  const removeOptionFromPalette = (id: string, idx: number) => {
    setPalette((p) =>
      p.map((it) =>
        it.id === id
          ? { ...it, options: it.options.filter((_, i) => i !== idx) }
          : it
      )
    );
  };

  return (
    <div className="grid grid-cols-[340px_1fr] h-[80vh] gap-3">
      {/* Paleta */}
      <aside className="border rounded-xl p-3 space-y-3 overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Subtareas (paleta)</h3>
        </div>

        <div className="space-y-2">
          {palette.map((s) => (
            <div key={s.id}>
              {/* Item editable */}
              <div
                draggable
                onDragStart={(e) => onDragStart(e, s)}
                className="cursor-grab active:cursor-grabbing rounded-lg border p-2 text-xs bg-white shadow-sm space-y-2"
                title="Arrastrar al lienzo"
              >
                <input
                  className="w-full border rounded px-2 py-1"
                  placeholder="Nombre / descripción"
                  value={s.description}
                  onChange={(e) =>
                    patchPaletteItem(s.id, { description: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[11px]">
                    Tipo
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={s.type ?? Tipos.texto}
                      onChange={(e) => {
                        const newType = e.target.value as Tipos;
                        const newOpts =
                          newType === Tipos.select
                            ? optionsFor(newType, s.options)
                            : optionsFor(newType);
                        patchPaletteItem(s.id, {
                          type: newType,
                          options: newOpts,
                          ...(newType !== Tipos.numero
                            ? { repeat: undefined }
                            : {}),
                        });
                      }}
                    >
                      <option value={Tipos.texto}>texto</option>
                      <option value={Tipos.foto}>foto</option>
                      <option value={Tipos.existencia}>si/no</option>
                      <option value={Tipos.select}>select</option>
                      <option value={Tipos.numero}>number</option>
                      <option value={Tipos.fecha}>fecha</option>
                      <option value={Tipos.titulo}>titulo</option>
                    </select>
                  </label>
                  <label className="text-[11px]">
                    Grupo
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={s.group}
                      onChange={(e) =>
                        patchPaletteItem(s.id, { group: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={s.required}
                      onChange={(e) =>
                        patchPaletteItem(s.id, { required: e.target.checked })
                      }
                    />
                    Requerida
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={s.FilesRequired}
                      onChange={(e) =>
                        patchPaletteItem(s.id, {
                          FilesRequired: e.target.checked,
                        })
                      }
                    />
                    Archivos
                  </label>
                </div>

                {/* Edición de opciones:
                    - existencia: fijo Sí/No (no muestro editor para mantener consistencia)
                    - select: editable (multi-opciones)
                    - otros: podría ser fijo "Continuar" (no muestro editor) */}
                {s.type === Tipos.select ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span>Opciones</span>
                      <span className="mr-3">Incidencia</span>
                    </div>

                    {s.options.map((o, idx) => (
                      <div key={o.id} className="flex items-center gap-1">
                        <input
                          className="flex-1 border rounded px-2 py-1"
                          placeholder={`Opción ${idx + 1}`}
                          value={o.title}
                          onChange={(e) => {
                            const newOpts = [...s.options];
                            newOpts[idx] = {
                              ...newOpts[idx],
                              title: e.target.value,
                            };
                            patchPaletteItem(s.id, { options: newOpts });
                          }}
                        />

                        <input
                          type="number"
                          className="w-16 border rounded px-2 py-1 text-xs"
                          placeholder="Inc."
                          value={o.incidencia ?? ""}
                          onChange={(e) => {
                            const newOpts = [...s.options];
                            newOpts[idx] = {
                              ...newOpts[idx],
                              incidencia: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            };
                            patchPaletteItem(s.id, { options: newOpts });
                          }}
                        />
                        <button
                          className="text-[11px] px-2 py-1 border rounded"
                          onClick={(ev) => {
                            ev.preventDefault();
                            removeOptionFromPalette(s.id, idx);
                          }}
                        >
                          -
                        </button>
                      </div>
                    ))}
                    <button
                      className="text-[11px] px-2 py-1 border rounded"
                      onClick={(ev) => {
                        ev.preventDefault();
                        addOptionToPalette(s.id);
                      }}
                    >
                      + Opción
                    </button>
                  </div>
                ) : null}

                {s.type === Tipos.numero ? (
                  <label className="text-[11px] block">
                    Repeat
                    <input
                      type="number"
                      min={0}
                      className="w-full border rounded px-2 py-1"
                      value={s.repeat ?? 0}
                      onChange={(e) =>
                        patchPaletteItem(s.id, {
                          repeat: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                ) : null}

                <div className="text-[11px] opacity-70">
                  Arrastrá esta card al lienzo para conectarla.
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 space-y-2">
          <button
            className="w-full px-3 py-2 text-xs rounded-lg bg-black text-white"
            onClick={addNewPaletteItem}
          >
            + Nueva
          </button>
          <button
            className="w-full px-3 py-2 text-xs rounded-lg bg-orange-600 text-white"
            onClick={() => {
              const subtasks = toSubtasks();
              const task: Task = {
                code: rootLabel,
                priority: "media",
                subtasks,
                duration: { horas: 0, minutos: 0 },
              };
              console.log("Task exportada:", task);
              onBuildSubtasks(subtasks); // o podés pasar directamente el objeto Task
            }}
          >
            Exportar subtasks (payload)
          </button>
        </div>
      </aside>

      {/* Canvas */}
      <section
        ref={canvasRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border rounded-xl"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => {
            requestAnimationFrame(() => instance.fitView());
          }}
        >
          <MiniMap pannable zoomable />
          <Controls />
          <Background />
        </ReactFlow>
      </section>
    </div>
  );
}

export default function FlowArea(props: FlowAreaProps) {
  return (
    <ReactFlowProvider>
      <FlowAreaInner {...props} />
    </ReactFlowProvider>
  );
}

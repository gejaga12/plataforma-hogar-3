"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  addEdge,
  MarkerType,
} from "reactflow";
import type {
  Node,
  Edge,
  Connection,
  XYPosition,
  NodeProps,
  NodeTypes,
} from "reactflow";

import type { Subtasks, Task } from "@/utils/types"; // ✅ usamos tus interfaces
import "reactflow/dist/style.css";

/** ===== Tipos UI mínimos (no tocan al back) ===== **/
type UIType = "text" | "existencia" | "multi";
type UIOption = { id: string; title: string };
type RootData = { label: string };
type FlowEdgeData = { optionId: string | null };

type FlowNodeData = UINodeData | RootData;
type RFNode = Node<FlowNodeData>;
type RFEdge = Edge<FlowEdgeData>;

/** Subtasks para UI: agrega id de nodo y opciones con id para handles */
type UINodeData = Omit<Subtasks, "options"> & {
  id: string;
  /** opcional: si querés, exporto esto al back (tu Subtasks lo permite con type?: any) */
  type?: UIType;
  /** opciones con id solo para UI (luego mapeo a {title, depends}) */
  options: UIOption[];
  setOrder?: (order: number) => void;
};

/** ===== Constantes/Utils ===== **/
const ROOT_ID = "__root__";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const DEFAULT_OPTIONS: Record<UIType, UIOption[]> = {
  text: [{ id: uid(), title: "Continuar" }],
  existencia: [
    { id: uid(), title: "Sí" },
    { id: uid(), title: "No" },
  ],
  multi: [
    { id: uid(), title: "Opción 1" },
    { id: uid(), title: "Opción 2" },
  ],
};

function optionsFor(type: UIType, keep?: UIOption[]): UIOption[] {
  if (type === "text" || type === "existencia")
    return DEFAULT_OPTIONS[type].map((o) => ({ ...o, id: uid() }));
  if (keep && keep.length) return keep;
  return DEFAULT_OPTIONS.multi.map((o) => ({ ...o, id: uid() }));
}

/** ====== Nodes UI ====== **/
function RootNode({ data }: NodeProps<RootData>) {
  return (
    <div className="rounded-xl border-2 border-orange-500 bg-white px-4 py-2 shadow">
      <div className="text-sm font-bold">{data.label || "TASK"}</div>
      <Handle type="source" position={Position.Bottom} id="root" />
    </div>
  );
}

function SubtaskNode({ data }: NodeProps<UINodeData>) {
  const opts = data.options ?? [];
  return (
    <div className="relative rounded-xl border bg-white w-[260px] shadow">
      <Handle type="target" position={Position.Top} id="in" />
      <div className="px-3 py-2 border-b text-sm font-semibold">
        {data.description || "Subtarea sin título"}
      </div>
      <div className="px-3 py-2 text-xs space-y-1">
        <div>
          <span className="font-medium">Tipo:</span> {data.type ?? "-"}
        </div>
        <div>
          <span className="font-medium">Grupo:</span> {data.group || "-"}
        </div>
        <div>
          <span className="font-medium">Requerida:</span>{" "}
          {data.required ? "Sí" : "No"}
          {" • "}
          <span className="font-medium">Archivos:</span>{" "}
          {data.FilesRequired ? "Sí" : "No"}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Orden:</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1"
            value={data.order ?? 0}
            onChange={(e) => data.setOrder?.(Number(e.target.value))}
          />
        </div>
        {!!opts.length && (
          <div>
            <span className="font-medium">Opciones:</span>{" "}
            {opts.map((o) => o.title).join(" / ")}
          </div>
        )}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] flex gap-2">
        {opts.map((o) => (
          <div key={o.id} className="relative flex items-center">
            <Handle type="source" position={Position.Bottom} id={o.id} />
            <span className="text-[10px] ml-1 bg-black/5 px-1 rounded">
              {o.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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
      description: "Verificar conexión eléctrica",
      type: "text",
      group: "Electricidad",
      required: true,
      FilesRequired: false,
      options: optionsFor("text"),
    },
    {
      id: uid(),
      description: "¿Existe fuga de combustible?",
      type: "existencia",
      group: "Seguridad",
      required: true,
      FilesRequired: true,
      options: optionsFor("existencia"),
    },
  ]);

  // Grafo — ¡OJO! arrays en genéricos
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

  const setNodeOrder = useCallback(
    (nodeId: string, order: number) => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== nodeId) return n;
          const d = n.data as UINodeData;
          return {
            ...n,
            data: {
              ...d,
              order,
              setOrder: (o: number) => setNodeOrder(nodeId, o),
            } as UINodeData,
          };
        })
      );
    },
    [setNodes]
  );

  /** ----- Drag&Drop desde paleta ----- **/
  const onDragStart = (e: React.DragEvent, item: UINodeData) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const dropPosition = (e: React.DragEvent): XYPosition => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 100, y: 150 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/reactflow");
      if (!raw) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      const pos = rect
        ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
        : { x: 100, y: 150 };

      const src = JSON.parse(raw) as Partial<UINodeData>;

      // calcular siguiente orden
      const currentOrders = nodes
        .filter((n) => n.type === "subtask")
        .map((n) => (n.data as UINodeData).order ?? 0);
      const nextOrder = currentOrders.length
        ? Math.max(...currentOrders) + 1
        : 1;

      const normalizedOptions =
        src.type === "multi"
          ? optionsFor("multi", src.options as UIOption[] | undefined)
          : optionsFor((src.type as UIType) ?? "text");

      const id = uid();

      const newNode: Node<FlowNodeData> = {
        id,
        type: "subtask",
        position: { x: pos.x, y: Math.max(pos.y, 140) },
        data: {
          id,
          description: src.description ?? "",
          group: src.group ?? "",
          required: !!src.required,
          FilesRequired: !!src.FilesRequired,
          type: (src.type as UIType) ?? "text",
          options: normalizedOptions,
          order: src.order ?? nextOrder, // 👈 asigno orden
          setOrder: (o: number) => setNodeOrder(id, o), // 👈 callback UI
        } as UINodeData,
      };

      setNodes((prev) => [...prev, newNode]);
    },
    [nodes, setNodes, dropPosition, setNodeOrder]
  );

  /** ----- Conexiones/validaciones ----- **/
  const isSubtaskNode = (n: RFNode): n is Node<UINodeData> =>
    n.type === "subtask";

  const wouldCreateCycle = useCallback(
    (source: string, target: string) => {
      const adj = new Map<string, string[]>();
      edges.forEach((e) => {
        const arr = adj.get(e.source) || [];
        arr.push(e.target);
        adj.set(e.source, arr);
      });

      if (!adj.has(source)) adj.set(source, []);
      adj.get(source)!.push(target);

      const stack = [target];
      const seen = new Set<string>();
      while (stack.length) {
        const cur = stack.pop()!;
        if (cur === source) return true;
        if (seen.has(cur)) continue;
        seen.add(cur);
        (adj.get(cur) || []).forEach((n) => stack.push(n));
      }
      return false;
    },
    [edges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const { source, target, sourceHandle } = params;
      if (!source || !target) return;

      if (source !== ROOT_ID && sourceHandle) {
        const already = edges.some(
          (e) => e.source === source && e.sourceHandle === sourceHandle
        );
        if (already) {
          alert("Esa opción ya tiene un hijo asignado.");
          return;
        }
      }

      if (wouldCreateCycle(source, target)) {
        alert("No se permiten ciclos en el flujo.");
        return;
      }

      let label = "";
      let optionId: string | null = null;

      if (source !== ROOT_ID) {
        const srcNode = nodes.find((n) => n.id === source);
        if (!srcNode || !isSubtaskNode(srcNode)) return;

        const data = srcNode.data as UINodeData;
        const opt = sourceHandle
          ? data.options.find((o) => o.id === sourceHandle)
          : undefined;
        if (!opt) {
          alert("Handle inválido para este nodo.");
          return;
        }
        optionId = sourceHandle!;
        label = opt.title;
      }

      const newEdge: RFEdge = {
        id: uid(),
        source,
        target,
        sourceHandle: sourceHandle ?? undefined,
        data: { optionId },
        label,
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      setEdges((prev) => addEdge(newEdge, prev));
    },
    [edges, nodes, setEdges, wouldCreateCycle]
  );

  /** ----- Auto-enlace visual al root ----- **/
  useEffect(() => {
    const incoming = new Map<string, number>();
    nodes.forEach(
      (n) => n.id !== ROOT_ID && n.type === "subtask" && incoming.set(n.id, 0)
    );

    edges.forEach((e) => {
      if (e.source === ROOT_ID) return;
      if (incoming.has(e.target))
        incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
    });

    const toAdd: RFEdge[] = [];
    const toRemove = new Set<string>();

    nodes.forEach((n) => {
      if (n.id === ROOT_ID || n.type !== "subtask") return;

      const hasNonRootIncoming = (incoming.get(n.id) || 0) > 0;
      const rootEdge = edges.find(
        (e) => e.source === ROOT_ID && e.target === n.id
      );

      if (!hasNonRootIncoming) {
        if (!rootEdge) {
          toAdd.push({
            id: uid(),
            source: ROOT_ID,
            target: n.id,
            sourceHandle: "root",
            data: { optionId: null },
            label: "",
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }
      } else if (rootEdge) {
        toRemove.add(rootEdge.id);
      }
    });

    if (toAdd.length || toRemove.size) {
      setEdges((prev) => [
        ...prev.filter((e) => !toRemove.has(e.id)),
        ...toAdd,
      ]);
    }
  }, [nodes, edges, setEdges]);

  /** ----- Serialización exacta a Subtasks[] del back ----- **/
  const toSubtasks = (): Subtasks[] => {
    const byId = new Map(nodes.map((n) => [n.id, n]));

    const incoming = new Map<string, number>();
    nodes.forEach(
      (n) => n.id !== ROOT_ID && n.type === "subtask" && incoming.set(n.id, 0)
    );
    edges.forEach((e) => {
      if (e.source === ROOT_ID) return;
      if (incoming.has(e.target))
        incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
    });

    const roots = nodes.filter(
      (n) =>
        n.id !== ROOT_ID &&
        n.type === "subtask" &&
        (incoming.get(n.id) || 0) === 0
    );

    const build = (id: string, seen: Set<string>): Subtasks => {
      const node = byId.get(id);
      if (!node || node.type !== "subtask") {
        return {
          description: "",
          options: [],
          group: "",
          required: false,
          FilesRequired: false,
          order: 0, // default
        };
      }
      const data = node.data as UINodeData;

      if (seen.has(id)) {
        return {
          description: data.description,
          options: [],
          group: data.group,
          required: !!data.required,
          FilesRequired: !!data.FilesRequired,
          order: data.order ?? 0, // 👈
          ...(data.type ? { type: data.type } : {}),
        };
      }
      seen.add(id);

      const outs = edges.filter((e) => e.source === id && e.data?.optionId);
      const byOption = new Map<string, string[]>();
      outs.forEach((e) => {
        const key = e.data!.optionId as string;
        const list = byOption.get(key) || [];
        list.push(e.target);
        byOption.set(key, list);
      });

      const options = (data.options || []).map((opt) => {
        const targets = byOption.get(opt.id) || [];
        const depends = targets.map((t) => build(t, new Set(seen)));
        return { title: opt.title, depends };
      });

      return {
        description: data.description,
        options,
        group: data.group,
        required: data.required,
        FilesRequired: data.FilesRequired,
        order: data.order ?? 0,
        ...(data.type ? { type: data.type } : {}),
      };
    };

    return roots.map((r) => build(r.id, new Set()));
  };

  /** ----- Layout simple en árbol ----- **/
  const layoutTree = () => {
    const adj = new Map<string, string[]>();
    edges.forEach((e) => {
      if (e.source === ROOT_ID) return;
      const arr = adj.get(e.source) || [];
      arr.push(e.target);
      adj.set(e.source, arr);
    });

    const indeg = new Map<string, number>();
    nodes.forEach(
      (n) => n.id !== ROOT_ID && n.type === "subtask" && indeg.set(n.id, 0)
    );
    edges.forEach((e) => {
      if (e.source === ROOT_ID) return;
      if (indeg.has(e.target))
        indeg.set(e.target, (indeg.get(e.target) || 0) + 1);
    });

    const queue: string[] = [];
    const level = new Map<string, number>();
    nodes.forEach((n) => {
      if (n.id === ROOT_ID || n.type !== "subtask") return;
      if ((indeg.get(n.id) || 0) === 0) {
        queue.push(n.id);
        level.set(n.id, 0);
      }
    });

    while (queue.length) {
      const u = queue.shift()!;
      for (const v of adj.get(u) || []) {
        if (!level.has(v)) {
          level.set(v, (level.get(u) || 0) + 1);
          queue.push(v);
        }
      }
    }

    const rows: Record<number, string[]> = {};
    level.forEach((lv, id) => {
      (rows[lv] ||= []).push(id);
    });

    // ordenar por "order" ascendente (luego por id para estabilidad)
    const sortedRows: Record<number, string[]> = {};
    Object.keys(rows).forEach((k) => {
      const lv = Number(k);
      const ids = rows[lv];
      sortedRows[lv] = ids.slice().sort((a, b) => {
        const na = nodes.find((n) => n.id === a)!;
        const nb = nodes.find((n) => n.id === b)!;
        const oa = (na.data as UINodeData).order ?? 0;
        const ob = (nb.data as UINodeData).order ?? 0;
        return oa === ob ? a.localeCompare(b) : oa - ob;
      });
    });

    const xCenter = 600;
    const xGap = 260;
    const yStart = 140;
    const yGap = 160;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === ROOT_ID) return { ...n, position: { x: xCenter, y: 20 } };
        if (n.type !== "subtask") return n;
        const lv = level.get(n.id) ?? 0;
        const row = rows[lv] || [];
        const idx = row.indexOf(n.id);
        const width = (row.length - 1) * xGap;
        const x = xCenter - width / 2 + idx * xGap;
        const y = yStart + lv * yGap;
        return { ...n, position: { x, y } };
      })
    );
  };

  /** ----- Acciones paleta ----- **/
  const addNewPaletteItem = () => {
    setPalette((p) => [
      ...p,
      {
        id: uid(),
        description: "",
        type: "text",
        group: "",
        required: false,
        FilesRequired: false,
        options: optionsFor("text"),
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
    <div className="grid grid-cols-[280px_1fr] h-[80vh] gap-3">
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
                      value={s.type ?? "text"}
                      onChange={(e) => {
                        const newType = e.target.value as UIType;
                        const newOpts =
                          newType === "multi"
                            ? optionsFor(newType, s.options)
                            : optionsFor(newType);
                        patchPaletteItem(s.id, {
                          type: newType,
                          options: newOpts,
                        });
                      }}
                    >
                      <option value="text">text</option>
                      <option value="existencia">existencia (Sí/No)</option>
                      <option value="multi">multi (opciones)</option>
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

                {s.type === "multi" && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-medium">Opciones</div>
                    {s.options.map((o, idx) => (
                      <div key={o.id} className="flex items-center gap-1">
                        <input
                          className="flex-1 border rounded px-2 py-1"
                          value={o.title}
                          onChange={(e) =>
                            patchPaletteItem(s.id, {
                              options: s.options.map((opt, i) =>
                                i === idx
                                  ? { ...opt, title: e.target.value }
                                  : opt
                              ),
                            })
                          }
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
                )}

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
            onClick={() => onBuildSubtasks(toSubtasks())}
          >
            Exportar subtasks (payload)
          </button>
          <button
            className="w-full px-3 py-2 text-xs rounded-lg border"
            onClick={layoutTree}
          >
            Distribuir en árbol
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
          fitView
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

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

import type { Subtasks } from "@/utils/types"; // ✅ usamos tus interfaces
import "reactflow/dist/style.css";

/** ===== Tipos UI mínimos (no tocan al back) ===== **/
type UIType = "text" | "existencia" | "multi";
type UIOption = { id: string; title: string };
type RootData = { label: string };
type FlowEdgeData = {
  optionId: string | null;
  kind: "auto" | "user";
};

type FlowNodeData = UINodeData | RootData;
type RFNode = Node<FlowNodeData>;
type RFEdge = Edge<FlowEdgeData>;

/** Subtasks para UI: agrega id de nodo y opciones con id para handles */
type UINodeData = Omit<Subtasks, "options"> & {
  id: string;
  type?: UIType;
  options: UIOption[];
};

/** ===== Constantes/Utils ===== **/
const ROOT_ID = "__root__";
//handle dedicado para la continuación vertical (mainline)
const CONT_HANDLE = "__cont__";

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
  const isRightSide = data.type === "existencia" || data.type === "multi";

  return (
    <div className="relative rounded-xl border bg-white w-[260px] shadow">
      {/* entrada */}
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
        {!!opts.length && (
          <div>
            <span className="font-medium">Opciones:</span>{" "}
            {opts.map((o) => o.title).join(" / ")}
          </div>
        )}
      </div>

      {/* --- Handle de CONTINUACIÓN (mainline) SIEMPRE abajo --- */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] flex items-center gap-1">
        <Handle type="source" position={Position.Bottom} id={CONT_HANDLE} />
      </div>

      {/* --- Handles de OPCIONES --- */}
      {isRightSide ? (
        // existencia/multi: a la derecha
        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 flex flex-col gap-2 items-end">
          {opts.map((o) => (
            <div key={o.id} className="relative flex items-center">
              <span className="text-[10px] mr-1 bg-black/5 px-1 rounded">
                {o.title}
              </span>
              <Handle type="source" position={Position.Right} id={o.id} />
            </div>
          ))}
        </div>
      ) : (
        // text: abajo (además del cont)
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-28px] flex gap-2">
          {opts.map((o) => (
            <div key={o.id} className="relative flex items-center">
              <Handle type="source" position={Position.Bottom} id={o.id} />
              <span className="text-[10px] ml-1 bg-black/5 px-1 rounded">
                {o.title}
              </span>
            </div>
          ))}
        </div>
      )}
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

      const pos = dropPosition(e);
      const src = JSON.parse(raw) as Partial<UINodeData>;

      const normalizedOptions =
        src.type === "multi"
          ? optionsFor("multi", src.options as UIOption[] | undefined)
          : optionsFor((src.type as UIType) ?? "text");

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
          type: (src.type as UIType) ?? "text",
          options: normalizedOptions,
          setOrder: (o: number) => setNodeOrder(id, o),
        } as UINodeData,
      };

      setNodes((prev) => [...prev, newNode]);
    },
    [setNodes, dropPosition]
  );

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

      // ❌ No permitir que el usuario use el handle de continuación
      if (sourceHandle === CONT_HANDLE) {
        alert(
          "La 'continuación' se gestiona automáticamente. Usá los handles de opciones para ramificar."
        );
        return;
      }

      // un hijo por handle (válido para opciones)
      if (source !== ROOT_ID && sourceHandle) {
        const already = edges.some(
          (e) => e.source === source && e.sourceHandle === sourceHandle
        );
        if (already) {
          alert("Ese handle ya tiene un hijo asignado.");
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
        if (!srcNode || srcNode.type !== "subtask") return;

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
        data: { optionId, kind: "user" }, // 👈 manual
        label,
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      setEdges((prev) => addEdge(newEdge, prev));
    },
    [edges, nodes, setEdges, wouldCreateCycle]
  );

  useEffect(() => {
    // 1) ordenar subtasks por Y y sincronizar order en data
    const subtasks = nodes
      .filter((n) => n.type === "subtask")
      .map((n) => ({ n, y: n.position.y, data: n.data as UINodeData }))
      .sort((a, b) => a.y - b.y);

    // 2) contar entradas MANUALES (kind: "user")
    const incomingUser = new Map<string, number>();
    nodes.forEach(
      (n) =>
        n.id !== ROOT_ID && n.type === "subtask" && incomingUser.set(n.id, 0)
    );
    edges.forEach((e) => {
      if (e.data?.kind !== "user") return;
      if (incomingUser.has(e.target)) {
        incomingUser.set(e.target, (incomingUser.get(e.target) || 0) + 1);
      }
    });

    // 3) mainline = nodos sin entrada manual (excluye ramas como "No")
    const mainline = subtasks
      .map((s) => s.n)
      .filter((n) => (incomingUser.get(n.id) || 0) === 0);

    // 4) preparar autos, preservando manuales
    const autoEdges: RFEdge[] = [];
    const userEdges = edges.filter((e) => e.data?.kind === "user");

    if (mainline.length > 0) {
      // root → primero
      autoEdges.push({
        id: uid(),
        source: ROOT_ID,
        target: mainline[0].id,
        sourceHandle: "root",
        data: { optionId: null, kind: "auto" },
        label: "",
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }

    // 5) encadenar i → i+1 con CONT_HANDLE (no usa opciones)
    for (let i = 0; i < mainline.length - 1; i++) {
      const srcId = mainline[i].id;
      const dstId = mainline[i + 1].id;

      // si el handle de continuación ya está utilizado manualmente, no generamos auto
      const contUsedManual = userEdges.some(
        (e) => e.source === srcId && e.sourceHandle === CONT_HANDLE
      );
      if (contUsedManual) continue;

      autoEdges.push({
        id: uid(),
        source: srcId,
        target: dstId,
        sourceHandle: CONT_HANDLE,
        data: { optionId: CONT_HANDLE, kind: "auto" },
        label: "",
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }

    const nextEdges = [...userEdges, ...autoEdges];

    const changedEdges =
      nextEdges.length !== edges.length ||
      nextEdges.some((ne, i) => {
        const e = edges[i];
        return (
          !e ||
          e.source !== ne.source ||
          e.target !== ne.target ||
          e.sourceHandle !== ne.sourceHandle ||
          e.data?.kind !== ne.data?.kind ||
          e.data?.optionId !== ne.data?.optionId
        );
      });

    if (changedEdges) {
      setEdges(nextEdges);
    }
  }, [nodes, edges, setNodes, setEdges, setNodeOrder]);

  const onNodeDragStop = useCallback(() => {
    // El efecto anterior ya reordena y regenera edges al detectar cambios,
    // así que acá no hace falta hacer nada más.
    // Solo forzamos un setNodes trivial para disparar el effect si hiciera falta:
    setNodes((prev) => [...prev]);
  }, [setNodes]);

  /** ----- Serialización exacta a Subtasks[] del back ----- **/
  const toSubtasks = (): Subtasks[] => {
    const byId = new Map(nodes.map((n) => [n.id, n]));

    // raíces (ignoramos el root) = nodos sin incoming "user" (manual)
    const incomingUser = new Map<string, number>();
    nodes.forEach(
      (n) =>
        n.id !== ROOT_ID && n.type === "subtask" && incomingUser.set(n.id, 0)
    );
    edges.forEach((e) => {
      if (e.data?.kind !== "user") return; // solo edges manuales afectan la jerarquía exportada
      if (incomingUser.has(e.target))
        incomingUser.set(e.target, (incomingUser.get(e.target) || 0) + 1);
    });

    const roots = nodes.filter(
      (n) =>
        n.id !== ROOT_ID &&
        n.type === "subtask" &&
        (incomingUser.get(n.id) || 0) === 0
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
          ...(data.type ? { type: data.type } : {}),
        };
      }
      seen.add(id);

      // Para exportar, SOLO tomamos edges "user" (manuales) como depende
      const outs = edges.filter(
        (e) => e.source === id && e.data?.kind === "user" && e.data?.optionId
      );
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
        ...(data.type ? { type: data.type } : {}),
      };
    };

    // si querés ordenarlas, hacelo por Y (visual), no por order:
    const sortedRoots = roots.sort((a, b) => a.position.y - b.position.y);
    return sortedRoots.map((r) => build(r.id, new Set()));
  };

  /** ----- Layout simple en árbol (mainline + ramas a la derecha) ----- **/
  const layoutTree = () => {
    // --- constantes de layout ---
    const xCenter = 600; // columna central (mainline)
    const yStart = 140; // y inicial de la mainline
    const yGap = 160; // separación vertical mainline
    const xGap = 280; // separación horizontal por profundidad de rama
    const branchGap = 120; // separación vertical entre ramas “hermanas” de un mismo nodo

    // --- helpers ---
    const norm = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const optionKind = (
      sourceId: string,
      optionId: string | null
    ): "yes" | "no" | "other" => {
      if (!optionId) return "other";
      const node = nodes.find((n) => n.id === sourceId);
      if (!node || node.type !== "subtask") return "other";
      const data = node.data as UINodeData;
      const opt = data.options.find((o) => o.id === optionId);
      if (!opt?.title) return "other";
      const t = norm(opt.title);
      if (t === "si") return "yes";
      if (t === "no") return "no";
      return "other"; // momentáneamente: tratamos “other” igual que “yes” (arriba)
    };

    // Sólo edges manuales para ramas
    const userEdges = edges.filter((e) => e.data?.kind === "user");

    // incoming manual para detectar mainline (nodos sin entrada manual)
    const incomingUser = new Map<string, number>();
    nodes.forEach(
      (n) =>
        n.id !== ROOT_ID && n.type === "subtask" && incomingUser.set(n.id, 0)
    );
    userEdges.forEach((e) => {
      if (incomingUser.has(e.target)) {
        incomingUser.set(e.target, (incomingUser.get(e.target) || 0) + 1);
      }
    });

    // mainline = subtasks sin entrada manual, ordenados por Y actual
    const subtasksByY = nodes
      .filter((n) => n.type === "subtask")
      .sort((a, b) => a.position.y - b.position.y);

    const mainline = subtasksByY.filter(
      (n) => (incomingUser.get(n.id) || 0) === 0
    );

    // Mapa de posiciones a aplicar
    const pos = new Map<string, { x: number; y: number }>();

    // Root fijo
    pos.set(ROOT_ID, { x: xCenter, y: 20 });

    // Ubicar mainline en columna central
    mainline.forEach((n, idx) => {
      pos.set(n.id, { x: xCenter, y: yStart + idx * yGap });
    });

    // Helper: edges manuales salientes de un nodo dado
    const outUserEdges = (id: string) =>
      userEdges.filter((e) => e.source === id && e.data?.optionId);

    // Layout recursivo de una rama a la derecha.
    // band = -1 (arriba), +1 (abajo).
    const placeBranch = (
      nodeId: string,
      depth: number,
      baseY: number,
      band: -1 | 1,
      visited: Set<string>
    ) => {
      if (visited.has(nodeId)) return; // evitar ciclos
      visited.add(nodeId);

      const x = xCenter + depth * xGap;
      // Si el nodo ya tiene posición asignada, no la pisamos:
      if (!pos.has(nodeId)) {
        pos.set(nodeId, { x, y: baseY });
      }

      // Recorremos hijos manuales y los ubicamos a la derecha, manteniendo el mismo Y de la rama
      const outs = outUserEdges(nodeId);
      outs.forEach((e, idx) => {
        const childId = e.target;
        // Para sub-ramificaciones, mantenemos el mismo baseY (línea de la rama).
        // Si querés “desparramar” más subramas, podés usar: baseY + band * (idx+1) * (branchGap/2)
        placeBranch(childId, depth + 1, baseY, band, new Set(visited));
      });
    };

    // Para cada nodo de la mainline, ubicar sus ramas derechas:
    mainline.forEach((m) => {
      const anchor = pos.get(m.id)!; // ya posicionado
      const outs = outUserEdges(m.id);

      // separo por tipo de opción (sí / no / otras)
      const yesEdges = outs.filter(
        (e) => optionKind(m.id, e.data?.optionId ?? null) === "yes"
      );
      const noEdges = outs.filter(
        (e) => optionKind(m.id, e.data?.optionId ?? null) === "no"
      );
      const otherEdges = outs.filter(
        (e) =>
          !["yes", "no"].includes(optionKind(m.id, e.data?.optionId ?? null))
      );

      // “Sí” y “otras” arriba, “No” abajo
      const groups: Array<{ list: typeof outs; band: -1 | 1 }> = [
        { list: yesEdges, band: -1 },
        { list: otherEdges, band: -1 },
        { list: noEdges, band: +1 },
      ];

      groups.forEach(({ list, band }) => {
        list.forEach((e, idx) => {
          // cada rama hermana se separa en Y
          const branchY = anchor.y + band * (idx + 1) * branchGap;
          const childId = e.target;
          // Coloco el primer nodo de la rama una columna a la derecha
          placeBranch(childId, /*depth*/ 1, branchY, band, new Set());
        });
      });
    });

    // Aplicar posiciones calculadas; mantener lo que no fue movido
    setNodes((prev) =>
      prev.map((n) => {
        const p = pos.get(n.id);
        return p ? { ...n, position: p } : n;
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
          onNodeDragStop={onNodeDragStop}
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

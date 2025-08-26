import { Task, Subtasks } from "@/utils/types";
import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

/**
 * Layout:
 * - Nodo raíz "task" en (0,0).
 * - Las subtasks principales (rama MAIN) salen del task por abajo (target: Top, source: Bottom).
 * - Para cada subtask con options, se crean tantas conexiones por abajo como options tenga.
 * - Cada option puede tener uno o más "depends" (hijos). Se colocan con separación horizontal.
 * - Recursivo para niveles profundos.
 */

interface Props {
  task: Task;
}

export function FlowLienzo({ task }: Props) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const MAIN_BG = "#fb923c";       // naranja (rama principal)
    const SEC_BG = "#60a5fa";        // azul (ramas secundarias)
    const ROOT_BG = "#fef3c7";       // amber-100

    const COL_W = 220;  // ancho "unidad" horizontal (separación entre hermanos)
    const ROW_H = 160;  // alto por nivel

    // ---------- Helpers de IDs ----------
    const idTask = "task";
    const mainId = (i: number) => `main-${i}`;
    const depId = (path: string) => `dep-${path}`; // path ej: "0.opt1.0" (main 0 -> option 1 -> depend 0...)

    // ---------- Nodo raíz ----------
    nodes.push({
      id: idTask,
      data: {
        label: (
          <div style={{ fontWeight: 700 }}>
            🔧 {task.code}
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              Prioridad: {task.priority ?? "-"}
            </div>
          </div>
        ),
      },
      position: { x: 0, y: 0 },
      type: "input",
      style: {
        background: ROOT_BG,
        padding: 10,
        borderRadius: 8,
        fontWeight: 600,
      },
      sourcePosition: Position.Bottom, // el root "emite" por abajo
    });

    // Contenido del nodo (description + type + group)
    const nodeLabel = (st: Subtasks) => (
      <div style={{ color: "white" }}>
        <div style={{ fontWeight: 600 }}>{st.description}</div>
        <div style={{ fontSize: 11, opacity: 0.95 }}>
          tipo: <b>{st.type ?? "-"}</b>
          {st.group ? <span style={{ marginLeft: 6 }}>· {st.group}</span> : null}
        </div>
      </div>
    );

    // ---------- Cálculo de ancho de subárbol ----------
    /**
     * widthUnits(subtask) = número mínimo de "columnas" necesarias para renderizar sus hijos.
     * - Si NO tiene options o no tiene depends → 1 unidad.
     * - Si tiene options con depends → suma de widths de cada depend.
     * - Es recursivo para niveles más profundos.
     */
    const widthUnitsOf = (st: Subtasks): number => {
      if (!st?.options || st.options.length === 0) return 1;
      let total = 0;
      st.options.forEach((opt) => {
        if (!opt?.depends || opt.depends.length === 0) {
          total += 1;
        } else {
          opt.depends.forEach((dep) => {
            total += Math.max(1, widthUnitsOf(dep));
          });
        }
      });
      return Math.max(1, total);
    };

    // ---------- Dibuja un subárbol debajo de un padre ----------
    /**
     * drawSubtree:
     * - Coloca el nodo "current" en (centerX, baseY).
     * - Dibuja sus hijos (por cada option y sus depends) en la fila siguiente,
     *   distribuidos horizontalmente en función del ancho recursivo.
     * - Devuelve el "ancho en unidades" que ocupa este subárbol.
     *
     * @param current    Subtasks actual
     * @param parentNodeId ID del nodo padre (para edges)
     * @param centerX    coordenada X central donde ubicar el "current"
     * @param baseY      coordenada Y de este nivel
     * @param path       path textual único (p.ej. "0" o "0.opt1.2")
     * @param isMain     si es rama principal (color MAIN_BG) o secundaria (SEC_BG)
     * @returns number   ancho en unidades del subárbol
     */
    const drawSubtree = (
      current: Subtasks,
      parentNodeId: string,
      centerX: number,
      baseY: number,
      path: string,
      isMain: boolean
    ): number => {
      const bg = isMain ? MAIN_BG : SEC_BG;
      const thisId = isMain ? parentNodeId : depId(path); // para main usamos mainId(...) ya creado; para secundarios generamos id

      // Si NO es main, creamos el nodo actual (para main ya existe)
      if (!isMain) {
        nodes.push({
          id: thisId,
          data: { label: nodeLabel(current) },
          position: { x: centerX, y: baseY },
          style: {
            background: bg,
            color: "white",
            padding: 10,
            borderRadius: 6,
          },
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
        });

        // Conexión desde el padre (con label si provino de una option)
        // El label del edge lo agregamos cuando llamamos a drawSubtree desde la iteración de options.
      }

      // Si no tiene options/depends → ancho = 1
      const hasOptions = Array.isArray(current.options) && current.options.length > 0;
      if (!hasOptions) return 1;

      // Calcular ancho total sumando todos los depends de todas las options
      const childrenWidths: { width: number; child: Subtasks; optTitle: string }[] = [];
      current.options!.forEach((opt, optIndex) => {
        if (!opt?.depends || opt.depends.length === 0) {
          // rama “vacía”: reservamos 1 unidad para mostrar conexión “muerta” si quisieras
          // (opcional) por ahora, si no hay depends no dibujamos hijo
          return;
        }
        opt.depends.forEach((dep, depIndex) => {
          const w = widthUnitsOf(dep);
          childrenWidths.push({ width: w, child: dep, optTitle: opt.title ?? "" });
        });
      });

      if (childrenWidths.length === 0) return 1;

      const totalUnits = childrenWidths.reduce((acc, it) => acc + Math.max(1, it.width), 0);

      // Distribuir hijos en la fila siguiente (y = baseY + ROW_H)
      let cursorUnits = -totalUnits / 2; // centro a izquierda (en unidades)
      const nextY = baseY + ROW_H;

      childrenWidths.forEach((item, idx) => {
        const w = Math.max(1, item.width);
        const childCenterUnits = cursorUnits + w / 2;
        const childX = Math.round(centerX + childCenterUnits * COL_W);

        const childPath = `${path}.o${idx}`; // path único

        // Dibuja hijo (SIEMPRE como secundario a partir de aquí)
        const childId = depId(childPath);
        // Primero creamos el nodo hijo
        nodes.push({
          id: childId,
          data: { label: nodeLabel(item.child) },
          position: { x: childX, y: nextY },
          style: {
            background: SEC_BG,
            color: "white",
            padding: 10,
            borderRadius: 6,
          },
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
        });

        // Edge desde el "thisId" hacia el hijo, con label del título de la opción
        edges.push({
          id: `e-${thisId}-${childId}`,
          source: thisId,
          target: childId,
          label: item.optTitle || undefined,
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: "rgba(0,0,0,0.6)", color: "#fff" },
        });

        // Recurse para nietos, centrados bajo el hijo actual
        const childTotalW = drawSubtree(item.child, childId, childX, nextY, `${childPath}`, false);

        // Avanza el cursor tantas unidades como ocupa el subárbol del hijo
        cursorUnits += childTotalW;
      });

      return totalUnits;
    };

    // ---------- Rama principal: colocar mains separados con su ancho ----------
    const mains = Array.isArray(task.subtasks) ? task.subtasks : [];
    if (mains.length > 0) {
      // Primero calculamos el ancho total para centrar el bloque de mains
      const mainWidths = mains.map((m) => Math.max(1, widthUnitsOf(m)));
      const totalMainUnits = mainWidths.reduce((a, b) => a + b, 0);

      // Centro global
      const startCenterX = 0;
      let cursorUnits = -totalMainUnits / 2;

      mains.forEach((st, i) => {
        const w = mainWidths[i];
        const xCenter = Math.round(startCenterX + (cursorUnits + w / 2) * COL_W);
        const y = ROW_H; // fila 1 para mains

        const id = mainId(i);

        // Nodo main
        nodes.push({
          id,
          data: { label: nodeLabel(st) },
          position: { x: xCenter, y },
          style: {
            background: MAIN_BG,
            color: "white",
            padding: 10,
            borderRadius: 6,
          },
          targetPosition: Position.Top,     // recibe del padre por arriba
          sourcePosition: Position.Bottom,  // emite hacia hijos por abajo
        });

        // Conexión desde TASK → MAIN
        edges.push({
          id: `e-${idTask}-${id}`,
          source: idTask,
          target: id,
        });

        // Dibuja sus hijos (depende de options)
        drawSubtree(st, id, xCenter, y, `${i}`, true);

        cursorUnits += w;
      });
    }

    return { nodes, edges };
  }, [task]);

  return (
    <div style={{ height: 560 }} className="border rounded shadow bg-white">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

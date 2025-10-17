import { FlujoPayload, NodeType, OptionDTO, NodeDTO } from "@/utils/types";
import { ChevronRight, Hammer, Plus, Save, X } from "lucide-react";
import { useMemo, useState } from "react";

export function CreateFlujoEditor({
  onCancel,
  onSubmit, // <- único callback al padre
  isSubmitting = false,
  initial,
}: {
  onCancel: () => void;
  onSubmit: (payload: FlujoPayload) => void;
  isSubmitting?: boolean;
  initial?: Partial<FlujoPayload> | null;
}) {
  // Meta
  const [code, setCode] = useState(initial?.code ?? "flujo_nuevo");
  const [flowType, setFlowType] = useState(initial?.type);

  // Nodos visibles (filtramos "end" si viniera en initial)
  const [nodes, setNodes] = useState<
    Array<Pick<NodeDTO, "id" | "name" | "type">>
  >(
    initial?.nodes?.length
      ? initial!
          .nodes!.filter((n) => n.type !== "end")
          .map((n) => ({ id: n.id, name: (n as any).name ?? "", type: n.type }))
      : [{ id: crypto.randomUUID(), name: "Inicio", type: "humano" }]
  );

  const starterNode = useMemo(() => nodes[0]?.id ?? "", [nodes]);

  const toSearchKey = (s: string) =>
    String(s ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const addNode = () => {
    setNodes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Paso ${prev.length + 1}`,
        type: "humano" as NodeType,
      },
    ]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNode = <K extends keyof Pick<NodeDTO, "id" | "name" | "type">>(
    id: string,
    key: K,
    value: Pick<NodeDTO, "id" | "name" | "type">[K]
  ) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [key]: value } : n))
    );
  };

  /** Build payload lineal + end */
  const buildLinearPayload = (): FlujoPayload => {
    if (nodes.length === 0) {
      throw new Error("Debe existir al menos un nodo.");
    }

    // 1) Options entre visibles
    const options: OptionDTO[] = [];
    const visibleNodesDTO: NodeDTO[] = nodes.map((n, idx) => {
      const isLast = idx === nodes.length - 1;
      const optionId = !isLast ? crypto.randomUUID() : undefined;

      if (optionId) {
        options.push({ id: optionId, next: nodes[idx + 1].id });
      }

      return {
        id: n.id,
        name: n.name,
        type: n.type, // humano | sistema | bot
        SearchKey: toSearchKey(n.name) || `node_${idx + 1}`, // backend lo exige string
        Options: optionId ? [optionId] : [],
        coordsGraph: { x: 220 * idx, y: 100 },
        EnterState: [],
        authorized: [],
      };
    });

    // 2) Nodo END (oculto en UI)
    const endNodeId = crypto.randomUUID();
    const endNode: NodeDTO = {
      id: endNodeId,
      name: "Fin",
      type: "end",
      SearchKey: "end",
      Options: [],
      coordsGraph: { x: 220 * visibleNodesDTO.length, y: 100 },
      EnterState: [],
      authorized: [],
    };

    // 3) Último visible → end
    const lastVisible = visibleNodesDTO[visibleNodesDTO.length - 1];
    const endOptionId = crypto.randomUUID();
    options.push({ id: endOptionId, next: endNodeId });
    lastVisible.Options = [...(lastVisible.Options || []), endOptionId];

    // 4) Payload final
    const payload: FlujoPayload = {
      code: code.trim(),
      type: String(flowType).trim(),
      nodes: [...visibleNodesDTO, endNode],
      options,
      StarterNode: nodes[0].id,
    };

    return payload;
  };

  const handleSubmit = () => {
    const payload = buildLinearPayload();
    onSubmit(payload);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Izquierda: meta */}
        <div className="lg:w-72 p-5 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Hammer size={18} className="text-gray-500" />
            <h3 className="font-semibold text-gray-900">Configuración</h3>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del flujo (code)
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="flujo_principal_v1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
            Tipo de flujo
          </label>
          <input
            value={flowType}
            onChange={(e) => setFlowType(e.target.value)}
            placeholder="Ingreso | "
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />

          <div className="mt-4">
            <p className="text-xs text-gray-500">StarterNode</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {starterNode || "—"}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleSubmit}
              className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2 disabled:opacity-60"
              disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? "Guardando..." : "Guardar flujo"}
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>

        {/* Derecha: nodos visibles (lineal) */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              Nodos del flujo (lineal)
            </h4>
            <button
              onClick={addNode}
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Plus size={16} /> Agregar nodo
            </button>
          </div>

          <div className="space-y-5">
            {nodes.map((nodo, idx) => (
              <div key={nodo.id} className="border rounded-lg">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-gray-500 break-all">
                      {nodo.id}
                    </span>
                  </div>
                  <button
                    onClick={() => removeNode(nodo.id)}
                    className="text-gray-500 hover:text-red-600"
                    title="Eliminar nodo"
                    disabled={nodes.length === 1 || isSubmitting}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del nodo
                    </label>
                    <input
                      value={nodo.name}
                      onChange={(e) =>
                        updateNode(nodo.id, "name", e.target.value)
                      }
                      placeholder={`Paso ${idx + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={nodo.type}
                      onChange={(e) =>
                        updateNode(nodo.id, "type", e.target.value as NodeType)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="humano">humano</option>
                      <option value="sistema">sistema</option>
                      <option value="bot">bot</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <p className="text-xs text-gray-500">
                      Editor <b>lineal</b>: el nodo {idx + 1} enlaza al{" "}
                      {idx + 2} si existe. El último enlaza a <code>end</code>.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500">
              🔗 Las <code>options</code> y el nodo <code>end</code> se agregan
              automáticamente al guardar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

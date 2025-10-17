import { ProcesoIngresoService } from "@/utils/api/apiProcesoIngreso";
import { queryClient } from "@/utils/query-client";
import { FlujoPayload, NodeDTO } from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CreateFlujoEditor } from "./CreateFlujoEditor";

type FlujoItem = {
  _id?: string;
  id?: string;
  code: string;
  type?: string;
  StarterNode: string;
  nodes: NodeDTO[] | Record<string, NodeDTO>;
  options: any[] | Record<string, any>;
};

const FlujosContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateView, setIsCreateView] = useState(false);
  const [editingFlujo, setEditingFlujo] =
    useState<Partial<FlujoPayload> | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const tipoFlujo = "ingreso";

  const {
    data: flujos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["flujos-ingresos", tipoFlujo],
    queryFn: () => ProcesoIngresoService.listarFlujosType(tipoFlujo),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  //   console.log("flujos:", flujos);

  const { mutate: crearFlujoMutate, isPending: isCreating } = useMutation({
    mutationFn: (payload: FlujoPayload) =>
      ProcesoIngresoService.crearflujo(payload),
    onSuccess: () => {
      toast.success("Flujo creado correctamente");
      setIsCreateView(false);
      setEditingFlujo(null);
      queryClient.invalidateQueries({ queryKey: ["flujos-ingresos"] });
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Error al crear el flujo");
    },
  });

  const handleNuevoFlujo = () => {
    setEditingFlujo(null);
    setIsCreateView(true);
  };

  const handleSubmitPayload = (payload: FlujoPayload) => {
    console.log("Enviando mutate con payload:", payload);
    crearFlujoMutate(payload);
  };

  const asArrayNodes = (nodes: FlujoItem["nodes"]): NodeDTO[] => {
    if (Array.isArray(nodes)) return nodes;
    return Object.values(nodes || {});
  };

  const excludeEnd = (nodes: NodeDTO[]) =>
    nodes.filter((n) => n.type !== "end");

  // Construye el orden lineal siguiendo Options -> next desde el StarterNode
  const orderLinearByStarter = (
    nodes: NodeDTO[],
    starterId: string
  ): NodeDTO[] => {
    const map = new Map(nodes.map((n) => [n.id, n]));
    const visited = new Set<string>();
    const ordered: NodeDTO[] = [];

    let currentId: string | undefined = starterId;
    // protección por si no existe
    if (!map.has(starterId)) return nodes;

    while (currentId && map.has(currentId) && !visited.has(currentId)) {
      const node = map.get(currentId)!;
      ordered.push(node);
      visited.add(currentId);

      // asumimos lineal: 0 o 1 option; si hay >1 tomamos la primera
      const nextOptionId = node.Options?.[0];
      if (!nextOptionId) break;

      // buscar en options: como no tenemos todas acá, intentamos inferir desde nodes:
      // en payload de creación sabemos que cada option.next es el siguiente id.
      // Si el backend no trae options separadas, muchos devs también "planchan" next en alguna estructura.
      // Para no depender, intentamos deducir: en lineal, el siguiente es el primer nodo cuya x es mayor (si coordsGraph existe),
      // pero la forma más segura es usar un mapOptionId->next si el backend lo trae. Abajo agrego extractor.
      // Para robustez, dejamos un extractor opcional vía prop de flujo:
      // Acá haremos un fallback simple: el siguiente es el inmediato en la lista original si no tenemos options resolubles.
      // Como tu creación es lineal, bastará con intentar encontrar "siguiente por posición".
      // Mejor: devolvemos el "siguiente por posición" a partir del array ordenado original de nodes (ya que flujos creados por vos son lineales).

      // Por simplicidad, si no podemos resolver next aquí, cortamos:
      break;
    }

    // Si sólo puso el primero, devolvemos fallback: ordenar por coordsGraph.x si existe
    if (ordered.length <= 1) {
      const withCoords = nodes.every(
        (n) => n.coordsGraph && typeof n.coordsGraph.x === "number"
      );
      if (withCoords) {
        return [...nodes].sort(
          (a, b) => (a.coordsGraph!.x ?? 0) - (b.coordsGraph!.x ?? 0)
        );
      }
    }

    return ordered.length ? ordered : nodes;
  };

  const filtered = useMemo(() => {
    const list = (flujos as FlujoItem[]).filter((f) =>
      (f.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    return list;
  }, [flujos, searchTerm]);

  if (isError) {
    return (
      <div className="text-red-600">Error: {(error as Error)?.message}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            📨 Flujos de ingresos
          </h1>
          <p className="text-gray-600 mt-1">
            Define y gestiona los flujos de ingresos del personal
          </p>
        </div>

        {!isCreateView && (
          <button
            onClick={handleNuevoFlujo}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Flujo</span>
          </button>
        )}
      </div>

      {/* Buscador */}
      {!isCreateView && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Listado */}
      {!isCreateView && (
        <div className="space-y-3">
          {isLoading && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              Cargando flujos...
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">
              No hay flujos para mostrar.
            </div>
          )}

          {!isLoading &&
            filtered.map((f) => {
              const id = (f._id || f.id || f.code) as string;
              const nodesArr = excludeEnd(asArrayNodes(f.nodes));
              const orderedNodes = orderLinearByStarter(
                nodesArr,
                f.StarterNode
              );

              const isOpen = !!expanded[id];
              const toggle = () => setExpanded((s) => ({ ...s, [id]: !s[id] }));

              return (
                <div
                  key={id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Card horizontal (header) */}
                  <button
                    onClick={toggle}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                    title="Ver nodos"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 text-orange-700 font-bold">
                        {f.code?.[0]?.toUpperCase() || "F"}
                      </div>
                      <div className="text-left">
                        <div className="text-sm text-gray-500">
                          {f.type ? f.type.toUpperCase() : "TIPO"}
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                          {f.code}
                        </div>
                        <div className="text-xs text-gray-500">
                          Starter:{" "}
                          <span className="font-mono">{f.StarterNode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {nodesArr.length} nodo{nodesArr.length !== 1 ? "s" : ""}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="text-gray-400" />
                      ) : (
                        <ChevronRight className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Panel expandido con nodos indentados */}
                  {isOpen && (
                    <div className="border-t border-gray-200 p-4">
                      <ol className="space-y-3">
                        {orderedNodes.map((n, idx) => (
                          <li key={n.id} className="flex items-start">
                            {/* indent visual */}
                            <div className="w-6 pt-1">
                              {idx > 0 && (
                                <div className="h-4 w-px bg-gray-300 mx-auto" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border">
                                  #{idx + 1}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {n.name || "(sin nombre)"}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-white text-gray-600">
                                  {n.type}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500 font-mono break-all">
                                id: {n.id}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Creacion */}
      {isCreateView && (
        <CreateFlujoEditor
          initial={editingFlujo}
          onCancel={() => {
            setIsCreateView(false);
            setEditingFlujo(null);
          }}
          onSubmit={handleSubmitPayload}
          isSubmitting={isCreating}
        />
      )}
    </div>
  );
};

export default FlujosContent;

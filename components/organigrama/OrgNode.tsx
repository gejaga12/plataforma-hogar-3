import { JerarquiaNodo } from "@/utils/api/apiJerarquia";
import { cn } from "@/utils/cn";
import { UserPlus, UserRoundX, X } from "lucide-react";
import { areaColors } from "../ui/AreaColors";

interface OrgNodeProps {
  node: JerarquiaNodo;
  onNodeClick: (node: JerarquiaNodo) => void;
  onOpenCrearModal: (parentId: string) => void;
  onSolicitarEliminarNodo: (id: string) => void;
  onSolicitarEliminarAsociacion: (id: string, userid: number) => void;
  level?: number;
}

const OrgNode = ({
  node,
  level = 0,
  onNodeClick,
  onOpenCrearModal,
  onSolicitarEliminarNodo,
  onSolicitarEliminarAsociacion,
}: OrgNodeProps) => {
  const initial = node.fullName?.charAt(0)?.toUpperCase() || "?";
  const puesto = node.cargo || "Sin puesto";

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className="relative group">
        <div
          onClick={() => onNodeClick(node)}
          className={cn(
            "cursor-pointer rounded-lg shadow-sm p-3 w-48 transition-all mb-4",
            "bg-white dark:bg-gray-800",
            "animate-in fade-in zoom-in duration-500",
            node.user
              ? "border border-gray-200 dark:border-gray-700 hover:shadow-md hover:ring-2 hover:ring-orange-500"
              : "border-2 border-dashed border-orange-400 hover:border-orange-500"
          )}
        >
          {/* Botón X (esquina superior derecha) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSolicitarEliminarNodo(node.id);
            }}
            className="absolute top-1 right-1 text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:bg-red-200 hover:rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Eliminar este nodo"
          >
            <X size={16} />
          </button>

          {/* Contenido del nodo */}
          <div className="flex items-center space-x-3">
            {/* Avatar o inicial */}
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {node.fullName}
              </p>
              <p
                className="text-xs text-gray-600 dark:text-gray-400 truncate"
                title={puesto}
              >
                {puesto}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                areaColors[
                  node.area.toUpperCase() as keyof typeof areaColors
                ] || "bg-gray-100 text-gray-800"
              )}
            >
              {node.area}
            </span>
          </div>
        </div>

        {/* Botones flotantes debajo del nodo */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity animate-in slide-in-from-top-2 duration-800">
          {/* Botón Agregar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCrearModal(node.id);
            }}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow-md"
            title="Agregar subordinado"
          >
            <UserPlus size={16} />
          </button>

          {/* Botón Eliminar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (typeof node.userid === "number") {
                onSolicitarEliminarAsociacion(node.id, node.userid);
              }
            }}
            disabled={typeof node.userid !== "number"}
            className={cn(
              "rounded-full p-1 shadow-md transition-opacity",
              typeof node.userid !== "number"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            )}
            title={
              typeof node.userid === "number"
                ? "Liberar nodo"
                : "No hay usuario asociado"
            }
          >
            <UserRoundX size={16} />
          </button>
        </div>
      </div>

      {/* Subordinados */}
      {node.subordinados && node.subordinados.length > 0 && (
        <div className="relative">
          {/* Línea vertical superior */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-900 dark:bg-gray-600 -top-4" />

          {/* Línea horizontal si hay más de uno */}
          {node.subordinados.length > 1 && (
            <div className="absolute top-2 left-0 right-0 h-px bg-gray-900 dark:bg-gray-600" />
          )}

          <div className="flex space-x-8 pt-6">
            {node.subordinados.map((child) => (
              <div key={child.id} className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-900 dark:bg-gray-600 -top-4" />
                <OrgNode
                  node={child}
                  onNodeClick={onNodeClick}
                  onOpenCrearModal={onOpenCrearModal}
                  onSolicitarEliminarNodo={onSolicitarEliminarNodo}
                  onSolicitarEliminarAsociacion={onSolicitarEliminarAsociacion}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgNode;

import { JerarquiaNodo } from "@/api/apiJerarquia";
import { areaColors } from "@/app/organigrama/page";
import { cn } from "@/utils/cn";
import { UserPlus } from "lucide-react";

interface OrgNodeProps {
  node: JerarquiaNodo;
  onNodeClick: (node: JerarquiaNodo) => void;
  onOpenCrearModal: (parentId: string) => void;
  level?: number;
}

const OrgNode = ({
  node,
  onNodeClick,
  level = 0,
  onOpenCrearModal,
}: OrgNodeProps) => {
  const initial = node.fullName?.charAt(0)?.toUpperCase() || "?";
  const puesto = node.puesto?.join(" / ") || node.cargo || "Sin puesto";

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className="relative group">
        <div
          onClick={() => onNodeClick(node)}
          className={cn(
            "cursor-pointer rounded-lg shadow-sm border p-3 w-48 hover:shadow-md transition-all mb-4",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-orange-500"
          )}
        >
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

        {/* Botón para agregar subordinado */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCrearModal(node.id); // <- llama al padre
          }}
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          title="Agregar subordinado"
        >
          <UserPlus size={16} />
        </button>
      </div>

      {/* Subordinados */}
      {node.subordinados && node.subordinados.length > 0 && (
        <div className="relative">
          {/* Línea vertical superior */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-300 dark:bg-gray-600 -top-4" />

          {/* Línea horizontal si hay más de uno */}
          {node.subordinados.length > 1 && (
            <div className="absolute top-2 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600" />
          )}

          <div className="flex space-x-8 pt-6">
            {node.subordinados.map((child) => (
              <div key={child.id} className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-300 dark:bg-gray-600 -top-6" />
                <OrgNode
                  node={child}
                  onNodeClick={onNodeClick}
                  onOpenCrearModal={onOpenCrearModal}
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

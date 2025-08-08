import { JerarquiaNodo } from "@/api/apiJerarquia";
import { areaColors } from "@/app/organigrama/page";
import { cn } from "@/utils/cn";
import { Building, Calendar, Mail, Phone, User, X } from "lucide-react";

interface NodeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: JerarquiaNodo;
}

const NodeDetailModal = ({
  isOpen,
  onClose,
  employee,
}: NodeDetailModalProps) => {
  if (!isOpen || !employee) return null;

  const initials = employee.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Detalles del Nodo
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-white">{initials}</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {employee.fullName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {employee.cargo}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {employee.email && (
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {employee.email}
                </span>
              </div>
            )}

            {employee.phone && (
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {employee.phone}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Building size={16} className="text-gray-400" />
              <span
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  areaColors[
                    employee.area.toUpperCase() as keyof typeof areaColors
                  ] || "bg-gray-100 text-gray-800"
                )}
              >
                {employee.area}
              </span>
            </div>

            {employee.relacionLaboral && (
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {employee.relacionLaboral}
                </span>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => console.log("clicked")}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-orange-500 hover:text-white dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Ver Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailModal;

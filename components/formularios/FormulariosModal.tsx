import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Trash2, X } from "lucide-react";


interface FormulariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  formulario?: Formulario; // renombrado (antes era "task")
  mode: "create" | "edit" | "view";

  // ➜ nuevas props para integrar el POST/PUT
  onSubmit: (payload: CreateTaskPayload) => void;
  isSubmitting: boolean;

  // ➜ listas que usás en los selects
   defaultPtId?: string;
  defaultPriority?: CreateTaskPayload["priority"];
}

const FormulariosModal = ({
  isOpen,
  onClose,
  formulario,
  mode,
  onSubmit,
  isSubmitting,
  defaultPtId,
  defaultPriority,
}: FormulariosModalProps) => {
  const [formData, setFormData] = useState<CreateTaskPayload>({
    name: "",
    titulo: "",
    descripcion: "",
    express: false,
    compraMateriales: false,
    modulos: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const addModulo = () => {
    setFormData((prev) => ({
      ...prev,
      modulos: [
        ...prev.modulos,
        {
          pagina: 1,
          nombre: "",
          orden: prev.modulos.length + 1,
          moduloId: "",
          equipo: "",
        },
      ],
    }));
  };

  const removeModulo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modulos: prev.modulos.filter((_, i) => i !== index),
    }));
  };

  const updateModulo = (
    index: number,
    field: keyof Omit<ModuloFormulario, "id" | "moduloNombre" | "moduloTitulo">,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      modulos: prev.modulos.map((modulo, i) =>
        i === index ? { ...modulo, [field]: value } : modulo
      ),
    }));
  };

  if (!isOpen) return null;

  const isReadOnly = mode === "view";
  //   const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create" && "Crear Nuevo Formulario"}
              {mode === "edit" && "Editar Formulario"}
              {mode === "view" && "Detalles del Formulario"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="nombre_formulario"
                required
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, titulo: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Título del Formulario"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Descripción del formulario"
              disabled={isReadOnly}
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.express}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    express: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                disabled={isReadOnly}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Express
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.compraMateriales}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    compraMateriales: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                disabled={isReadOnly}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Compra de materiales
              </span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Módulos
              </label>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addModulo}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  + Añadir módulo
                </button>
              )}
            </div>

            <div className="space-y-4">
              {formData.modulos.map((modulo, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Página *
                      </label>
                      <input
                        type="number"
                        value={modulo.pagina}
                        onChange={(e) =>
                          updateModulo(
                            index,
                            "pagina",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="1"
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={modulo.nombre}
                        onChange={(e) =>
                          updateModulo(index, "nombre", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Nombre del módulo"
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orden *
                      </label>
                      <input
                        type="number"
                        value={modulo.orden}
                        onChange={(e) =>
                          updateModulo(
                            index,
                            "orden",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="1"
                        required
                        disabled={isReadOnly}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Módulo *
                      </label>
                      <select
                        value={modulo.moduloId}
                        onChange={(e) =>
                          updateModulo(index, "moduloId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                        disabled={isReadOnly}
                      >
                        <option value="">Seleccionar módulo</option>
                        {mockModulosDisponibles.map((moduloDisp) => (
                          <option key={moduloDisp.id} value={moduloDisp.id}>
                            {moduloDisp.titulo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipo
                      </label>
                      <select
                        value={modulo.equipo}
                        onChange={(e) =>
                          updateModulo(index, "equipo", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        disabled={isReadOnly}
                      >
                        <option value="">Seleccionar equipo</option>
                        {equiposDisponibles.map((equipo) => (
                          <option key={equipo} value={equipo}>
                            {equipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeModulo(index)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {formData.modulos.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No hay módulos definidos. Haz clic en{" "}
                  <span className="italic">Añadir módulo</span> para agregar.
                </p>
              )}
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">
                      {mode === "create" ? "Creando..." : "Guardando..."}
                    </span>
                  </>
                ) : mode === "create" ? (
                  "Crear Formulario"
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FormulariosModal;

import React from "react";
import { Puesto, Sucursal, UserAdapted, Zona } from "@/utils/types";
import { LoadingSpinner } from "../ui/loading-spinner";

interface FormDatosLaboralesProps {
  formDataLabor: FormDataLabor;
  setFormDataLabor: React.Dispatch<React.SetStateAction<FormDataLabor>>;
  isReadOnly: boolean;
  mode: "create" | "edit" | "view";
  user: UserAdapted | undefined;
  sucursales: Sucursal[];
  zonas: Zona[];
  isLoading: boolean;
  onAssignZona: (zonaId: string, userId: number) => void | Promise<void>;
  onAssignSucursal: (sucId: string, userId: number) => Promise<void> | void;
}

export type EstadoContractual = "Periodo de Prueba" | "Contratado" | undefined;

export interface FormDataLabor {
  tipoDeContrato: string;
  relacionLaboral?: EstadoContractual;
  fechaIngreso: string;
  fechaAlta: string;
  cuil?: number;
  categoryArca: string;
  antiguedad: string;
  horasTrabajo: string;
  sueldo?: number;
  puestos: Puesto[];
  area: string;
  jerarquiaId?: string;
  zona?: { id: string; name: string };
  sucursalHogar?: { id: string; name: string };
  isActive?: boolean;
  notificaciones?: { mail: boolean; push: boolean };
  photoURL?: string;
  certificacionesTitulo?: string;
}

const FormDatosLaborales: React.FC<FormDatosLaboralesProps> = ({
  setFormDataLabor,
  onAssignZona,
  onAssignSucursal,
  formDataLabor,
  isReadOnly,
  user,
  sucursales,
  zonas,
  isLoading,
}) => {
  const userId = user?.id ?? 0;

  return (
    <div className="px-2 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Datos laborales
      </h3>
      <div className="grid grid-cols-2 gap-6 px-1">
        {/* Zona */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Zona{" "}
            <span className="text-xs text-gray-500">
              (se guarda al seleccionar)
            </span>
          </label>
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : isReadOnly ? (
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
              {formDataLabor.zona?.name || "Sin asignar"}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={formDataLabor.zona?.id ?? ""}
                onChange={async (e) => {
                  const id = e.target.value;
                  const zonaSeleccionada = zonas.find((z) => z.id === id);
                  setFormDataLabor((prev) => ({
                    ...prev,
                    zona: zonaSeleccionada
                      ? { id: zonaSeleccionada.id, name: zonaSeleccionada.name }
                      : undefined,
                  }));
                  if (id && userId) {
                    await onAssignZona(id, userId);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-800"
                disabled={isReadOnly}
              >
                <option value="">Seleccionar zona</option>
                {zonas.map((zona) => (
                  <option key={zona.id} value={zona.id}>
                    {zona.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sucursal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Sucursal Hogar{" "}
            <span className="text-xs text-gray-500">
              (se guarda al seleccionar)
            </span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={formDataLabor.sucursalHogar?.id ?? ""}
              onChange={async (e) => {
                const id = e.target.value;
                const found = (sucursales || []).find((s) => s.id === id);
                const name = found?.name ?? "";

                // estado previo para rollback si falla
                const prev = formDataLabor.sucursalHogar;

                // optimistic UI
                setFormDataLabor((prevState) => ({
                  ...prevState,
                  sucursalHogar: id ? { id, name } : undefined,
                }));

                try {
                  if (id && userId) {
                    await onAssignSucursal(id, userId);
                  }
                } catch (err) {
                  // rollback si hubo error
                  setFormDataLabor((prevState) => ({
                    ...prevState,
                    sucursalHogar: prev,
                  }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-800"
              disabled={isReadOnly || isLoading}
            >
              <option value="">Seleccionar sucursal</option>
              {sucursales?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CUIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            CUIL *
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{11}"
            placeholder="cuil (11 dígitos)"
            value={formDataLabor.cuil ? String(formDataLabor.cuil) : ""}
            onChange={(e) => {
              const value = e.target.value;

              // permite vacío o hasta 11 dígitos
              if (value === "" || value.length <= 11) {
                setFormDataLabor((prev) => ({
                  ...prev,
                  cuil: value === "" ? undefined : Number(value),
                }));
              }
            }}
            onKeyDown={(e) => {
              // evita teclas no numéricas comunes
              const invalid = ["e", "E", "+", "-", ".", ","];
              if (invalid.includes(e.key)) e.preventDefault();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
            required={!isReadOnly}
          />
          <p className="text-xs text-gray-500 mt-1">11 dígitos sin guiones.</p>
        </div>

        {/* Puesto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Puesto *
          </label>
          <input
            type="text"
            value={formDataLabor.puestos?.[0]?.name ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => {
                const first = prev.puestos?.[0];
                const updatedFirst: Puesto = {
                  id: first?.id ?? "", // si ya hay id, se conserva
                  name: e.target.value,
                };
                const updated =
                  Array.isArray(prev.puestos) && prev.puestos.length > 0
                    ? [updatedFirst, ...prev.puestos.slice(1)]
                    : [updatedFirst];
                return { ...prev, puestos: updated };
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
          />
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Área - Cargo
          </label>

          {(() => {
            const area = (user?.jerarquia?.area ?? "").trim();
            const cargo = (user?.jerarquia?.cargo ?? "").trim();

            const label = area
              ? `${area}${cargo ? ` - ${cargo}` : ""}`
              : "Asignar un área desde organigrama";

            return (
              <div className="mt-1 bg-gray-100 border border-gray-300 px-3 py-2 rounded-md dark:bg-gray-600 dark:border-gray-800">
                {label}
              </div>
            );
          })()}
        </div>

        {/* Fecha de Ingreso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Fecha de Ingreso *
          </label>
          <input
            type="date"
            value={formDataLabor.fechaIngreso ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                fechaIngreso: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
            required={!isReadOnly}
          />
        </div>

        {/* Fecha de Alta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Fecha de Alta
          </label>
          <input
            type="date"
            value={formDataLabor.fechaAlta ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                fechaAlta: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
          />
        </div>

        {/* Tipo de Contrato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Tipo de Contrato *
          </label>
          <select
            value={formDataLabor.tipoDeContrato}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                tipoDeContrato: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
            required={!isReadOnly}
          >
            <option value="">Seleccionar tipo de contrato</option>
            <option value="Relación de Dependencia">
              Relación de Dependencia
            </option>
            <option value="Freelance">Freelance</option>
            <option value="Contratista">Contratista</option>
          </select>
        </div>

        {/* Estado Contractual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Estado Contractual *
          </label>
          <select
            value={(formDataLabor.relacionLaboral as EstadoContractual) ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                relacionLaboral: e.target.value as EstadoContractual,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
            required={!isReadOnly}
          >
            <option value="">Seleccionar estado</option>
            <option value="Periodo de Prueba">Periodo de Prueba</option>
            <option value="Contratado">Contratado</option>
          </select>
        </div>

        {/* Category ARCA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Categoría ARCA
          </label>
          <input
            type="text"
            placeholder="Categoría A"
            value={formDataLabor.categoryArca ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                categoryArca: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
          />
        </div>

        {/* Antigüedad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Antigüedad
          </label>
          <input
            type="text"
            placeholder="2 años"
            value={formDataLabor.antiguedad ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                antiguedad: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
          />
        </div>

        {/* Horas de Trabajo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Horas de Trabajo
          </label>
          <select
            value={formDataLabor.horasTrabajo ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                horasTrabajo: e.target.value,
              }))
            }
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Seleccionar...</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
          </select>
        </div>

        {/* Sueldo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Sueldo
          </label>
          <input
            type="number"
            min={0}
            placeholder="120000"
            value={formDataLabor.sueldo ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                sueldo:
                  e.target.value === "" ? undefined : Number(e.target.value),
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default FormDatosLaborales;

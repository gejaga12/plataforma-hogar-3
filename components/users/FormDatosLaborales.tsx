import React from "react";
import { LoadingSpinner } from "../ui/loading-spinner";

interface FormDatosLaboralesProps {
  formDataLabor: FormDataLabor;
  setFormDataLabor: React.Dispatch<React.SetStateAction<FormDataLabor>>;
  isReadOnly: boolean;
  mode: "create" | "edit" | "view";
  areas: any[]; // el tipo real que uses
  isLoadingAreas: boolean;
}

export type EstadoContractual = "Periodo de Prueba" | "Contratado";

export interface FormDataLabor {
  cuil?: string; 
  fechaIngreso: string; 
  fechaAlta?: string; 
  categoryArca?: string; 
  antiguedad?: string;
  tipoDeContrato: string; 
  horasTrabajo?: string;
  sueldo?: string; 
  relacionLaboral: EstadoContractual; 
  certificacionesTitulo?: string; 
  area?: string;
  puestos?: string[];
}

const FormDatosLaborales: React.FC<FormDatosLaboralesProps> = ({
  formDataLabor,
  setFormDataLabor,
  isReadOnly,
  mode,
  areas,
  isLoadingAreas,
}) => {
  const isCreate = mode === "create";

  return (
    <div className="px-2 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-400 mb-4">
        Datos laborales
      </h3>

      <div className="grid grid-cols-2 gap-6 px-1">
        {/* CUIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            CUIL *
          </label>
          <input
            type="text"
            maxLength={11}
            placeholder="cuil (11 dígitos)"
            value={formDataLabor.cuil ?? ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              setFormDataLabor((prev) => ({ ...prev, cuil: digits }));
            }}
            onKeyDown={(e) => {
              // evita teclas no numéricas comunes
              const invalid = ["e", "E", "+", "-", ".", ","];
              if (invalid.includes(e.key)) e.preventDefault();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            required={isCreate}
            disabled={isReadOnly}
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
            value={formDataLabor.puestos ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                puesto: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
          />
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Área *
          </label>
          {isLoadingAreas ? (
            <LoadingSpinner size="sm" />
          ) : isReadOnly ? (
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
              {areas || "Sin asignar"}
            </div>
          ) : (
            <select
              value={formDataLabor.area ?? ""}
              onChange={(e) =>
                setFormDataLabor((prev) => ({
                  ...prev,
                  area: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
              required={isCreate}
              disabled={isReadOnly || (areas?.length ?? 0) === 0}
            >
              <option value="">
                {(areas?.length ?? 0) === 0
                  ? "No hay areas disponibles"
                  : "Seleccionar area"}
              </option>
              {areas?.map((area) => (
                <option value={area} key={area}>
                  {area}
                </option>
              ))}
            </select>
          )}
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
            required={isCreate}
            disabled={isReadOnly}
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
            required={isCreate}
            disabled={isReadOnly}
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
            required={isCreate}
            disabled={isReadOnly}
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
          <input
            type="number"
            min={0}
            step="1"
            placeholder="40"
            value={formDataLabor.horasTrabajo ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                horasTrabajo: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
          />
        </div>

        {/* Sueldo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Sueldo
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="120000"
            value={formDataLabor.sueldo ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({ ...prev, sueldo: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-800"
            disabled={isReadOnly}
          />
        </div>

        {/* Certificaciones / Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
            Certificaciones/Título
          </label>
          <input
            type="text"
            value={formDataLabor.certificacionesTitulo ?? ""}
            onChange={(e) =>
              setFormDataLabor((prev) => ({
                ...prev,
                certificacionesTitulo: e.target.value,
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

import { FormDataLabor } from "@/components/users/FormDatosLaborales";
import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import axios from "axios";

/**
 * Normaliza un valor de fecha del form a ISO string.
 * Nunca devuelve null. Devuelve string (ISO) o undefined si es inválido/ausente.
 */
function formatDateInput(value?: string | Date | null): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return undefined; // evita "Invalid Date"
  return date.toISOString(); // formato estándar ISO
}

/**
 * DTO para crear/actualizar Labor (request al backend).
 * Recomendación: enviar strings ISO (no objetos Date) y omitir campos vacíos (undefined).
 */
export interface CrearLaborDTO {
  userId: number;
  cuil?: number;               // 11 dígitos (CUIL argentino)
  fechaIngreso?: string;       // ISO (opcional si no está seteada en el form)
  fechaAlta?: string;          // ISO (opcional)
  categoryArca?: string;
  antiguedad?: string;
  tipoDeContrato?: string;
  horasTrabajo?: string;       // ej: "40"
  sueldo?: number;
  relacionLaboral?: string;
  area?: string;
  jerarquiaId?: string;        // ID de la jerarquía asociada
}

export interface CrearPuestoDTO {
  name: string;
  laborid: string;
}

/**
 * Mapea el form tipado a un DTO limpio para el backend.
 * - No envía fechas inválidas ni campos vacíos (manda undefined).
 * - Convierte sueldo a number si corresponde.
 */
export function buildCrearLaborPayload(
  form: FormDataLabor,
  userId: number
): CrearLaborDTO {
  return {
    userId,
    cuil: form.cuil,
    fechaIngreso: formatDateInput(form.fechaIngreso),
    fechaAlta: formatDateInput(form.fechaAlta),
    categoryArca: form.categoryArca?.trim() || undefined,
    antiguedad: form.antiguedad?.trim() || undefined,
    tipoDeContrato: form.tipoDeContrato || undefined,
    horasTrabajo: form.horasTrabajo?.trim() || undefined,
    sueldo: form.sueldo !== undefined && form.sueldo !== null && `${form.sueldo}`.trim() !== ""
      ? Number(form.sueldo)
      : undefined,
    relacionLaboral: form.relacionLaboral || undefined,
    // si necesitás area/jerarquiaId y vienen del form, agregalos acá
    // area: form.area || undefined,
    // jerarquiaId: form.jerarquiaId || undefined,
  };
}

export class LaborService {
  static async crearLabor(data: CrearLaborDTO): Promise<any> {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${BASE_URL}/labor`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Error al crear labor";
      throw new Error(message);
    }
  }

  static async actualizarLabor(
    id: string,
    data: Partial<CrearLaborDTO>
  ): Promise<any> {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${BASE_URL}/labor/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Error al actualizar labor";
      throw new Error(message);
    }
  }

  static async crearPuesto(data: CrearPuestoDTO): Promise<any> {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${BASE_URL}/labor/puesto`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Error al crear puesto";
      throw new Error(message);
    }
  }

  static async actualizarPuesto(id: string, data: any): Promise<any> {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${BASE_URL}/puesto/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al actualizar el puesto";
      throw new Error(message);
    }
  }
}

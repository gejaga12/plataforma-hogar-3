import { FormDataLabor } from "@/components/users/FormDatosLaborales";
import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { formatDateInput } from "@/utils/formatDate";
import axios from "axios";

export interface CrearLaborDTO {
  userId?: number;
  cuil?: number; // 11 dígitos (CUIL argentino)
  fechaIngreso: string | Date; // se normaliza a ISO
  fechaAlta?: string | Date; // opcional según tu UI
  categoryArca?: string;
  antiguedad?: string;
  tipoDeContrato?: string;
  horasTrabajo?: string; // la doc la muestra como string ("40")
  sueldo?: number;
  relacionLaboral?: string;
  area?: string;
  jerarquiaId?: string; // ID de la jerarquía asociada
}

export interface CrearPuestoDTO {
  puesto: string; // ej: "Supervisor de Planta"
  laborid: string; // uuid de la labor asociada
}

//Helper para mapear formdatalabor a crearlaborDTO
export function buildCrearLaborPayload(
  form: FormDataLabor,
  userId: number
): CrearLaborDTO {
  return {
    userId,
    cuil: form.cuil,
    fechaIngreso: formatDateInput(form.fechaIngreso),
    fechaAlta: form.fechaAlta ? formatDateInput(form.fechaAlta) : undefined,
    categoryArca: form.categoryArca?.trim() || undefined,
    antiguedad: form.antiguedad?.trim() || undefined,
    tipoDeContrato: form.tipoDeContrato,
    horasTrabajo: form.horasTrabajo?.trim() || undefined,
    sueldo: form.sueldo ? Number(form.sueldo) : undefined,
    relacionLaboral: form.relacionLaboral,
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
      const message =
        error?.response?.data?.message || "Error al actualizar labor";
      throw new Error(message);
    }
  }

  //crear puesto
  static async crearPuesto(data: CrearPuestoDTO): Promise<any> {
    try {
      const token = getAuthToken();

      const response = await axios.post(`${BASE_URL}/labor/puesto`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("enviando puesto:", data);

      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Error al crear puesto";
      throw new Error(message);
    }
  }
}

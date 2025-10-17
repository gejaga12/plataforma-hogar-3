import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import axios from "axios";

export interface CrearLaborDTO {
  userId?: number;
  cuil?: number; // 11 dígitos (CUIL argentino)
  fechaIngreso: string | null; // se normaliza a ISO
  fechaAlta?: string | null; // opcional según tu UI
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
  laborId: string;
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

      const response = await axios.post(`${BASE_URL}/puesto`, data, {
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

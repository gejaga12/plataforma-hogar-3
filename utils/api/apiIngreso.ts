import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import axios from "axios";
import { CrearHoraExtra } from "../types";

type Ingreso = {
  lan?: number;
  lng?: number;
  typeAction: string;
  reason: string;
  modo: string;
};

type FiltrosIngreso = {
  limit?: number;
  offset?: number;
  suc?: string;
  modo?: string;
};

export class ingresoService {
  static async createIngreso(ingreso: Ingreso): Promise<any> {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/ingreso-egreso`, ingreso, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.log("Error:", error.message);
      throw error;
    }
  }

  static async fetchIngresos(filtros: FiltrosIngreso = {}): Promise<any> {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/ingreso-egreso`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filtros,
      });

      return response.data;
    } catch (error: any) {
      console.log("Error:", error.message);
      throw error;
    }
  }

  static async fetchIngresoById(id: string): Promise<any> {
    const token = getAuthToken();

    const response = await axios.get(`${BASE_URL}/ingreso-egreso/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  //horas extras
  static async createHorasExtras(data: CrearHoraExtra): Promise<any> {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/horas-extras`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Error al crear hora extra:", error);
      if (error.response) {
        console.error("📥 Respuesta del servidor:", error.response.data);
        throw new Error(error.response.data?.message || "Error en la petición");
      }

      throw new Error(error.message || "Error desconocido");
    }
  }

  static async fetchHorasExtras(params?: {
    limit?: number;
    offset?: number;
    status?: "pendiente" | "no aprobado" | "aprobado";
    verificacion?: "no verificado" | "verificado";
    start?: string;
    end?: string;
  }) {
    const token = getAuthToken();
    try {
      const response = await axios.get(`${BASE_URL}/horas-extras`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: params?.limit ?? 10,
          offset: params?.offset ?? 0,
          status: params?.status,
          verificacion: params?.verificacion,
          start: params?.start,
          end: params?.end,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Error al listar horas extras:",
        error?.message || error
      );
      throw error;
    }
  }

  static async fetchHoraExtraById(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/horas-extras/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.warn("Error al obtener la hora extra", error?.message || error);
      throw error;
    }
  }

  static async aprobarHoraExtra(id: string, approved: boolean) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/horas-extras/a/${id}`, { approved }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      console.log("Error:", msg);
      throw new Error(msg);
    }
  }
}

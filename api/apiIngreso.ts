import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import axios from "axios";

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
}

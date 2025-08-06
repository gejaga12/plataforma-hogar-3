import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { SucursalHogar } from "@/utils/types";

import axios from "axios";

export class SucursalHogarService {

  static async crearSucursalHogar(data: SucursalHogar) {
    try {
      const token = getAuthToken();

      const response = await axios.post(`${BASE_URL}/sucursal-hogar`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al crear la sucursal hogar";
      throw new Error(message);
    }
  }

  static async getAllSucursalesHogar(): Promise<any> {
    try {
      const token = getAuthToken();

      const response = await axios.get(`${BASE_URL}/sucursal-hogar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al obtener sucursales hogar";
      throw new Error(message);
    }
  }

  static async getOneSucursalHogar(id: string) {
    try {
      const token = getAuthToken();

      const response = await axios.get(`${BASE_URL}/sucursal-hogar/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al obtener la sucursal hogar";
      throw new Error(message);
    }
  }

  static async deleteSucursalHogar(id: string) {
    try {
      const token = getAuthToken();

      const response = await axios.delete(`${BASE_URL}/sucursal-hogar/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al eliminar la sucursal";
      throw new Error(message);
    }
  }
}

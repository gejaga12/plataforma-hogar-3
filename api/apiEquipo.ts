import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { Equipo } from "@/utils/types";
import axios from "axios";

export class EquipoService {
  static async crearEquipo(data: Equipo) {
    //cambiar any
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/equipo`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Error al crear el equipo";
      throw new Error(msg);
    }
  }

  static async listarEquipos() {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/equipo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al listar los equipos";
      throw new Error(msg);
    }
  }

  static async mostrarEquipoId(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/equipo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }

  static async eliminarEquipo(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.delete(`${BASE_URL}/equipo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }
}

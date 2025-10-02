import axios from "axios";
import { getAuthToken } from "../authToken";
import { BASE_URL } from "../baseURL";
import { AgendaItem, AgendaPriority, AgendaState, AgendaType } from "../types";

export interface payloadCreateAgenda {
  name: string;
  until: string;
  type?: AgendaType;
  userId: number;
  priority?: AgendaPriority;
  description?: string;
}


export class AgendaService {
  static async crearAgenda(data: payloadCreateAgenda) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/agenda`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data;
      console.error("Error:", msg);
      throw new Error(msg);
    }
  }

  static async listarAllAgendas() {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/agenda`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data;
      console.error("Error:", msg);
      throw new Error(msg);
    }
  }

  static async mostrarAgendaId(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/agenda/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data;
      console.error("Error:", msg);
      throw new Error(msg);
    }
  }

  static async actualizarAgenda(id: string, data: Partial<AgendaItem>) {
    const token = getAuthToken();

    try {
      const response = await axios.patch(`${BASE_URL}/agenda/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data;
      console.error("Error:", msg);
      throw new Error(msg);
    }
  }

  static async eliminarAgenda(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.delete(`${BASE_URL}/agenda/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data;
      console.error("Error:", msg);
      throw new Error(msg);
    }
  }

  static async cambiarEstadoAgenda(id: string, state: AgendaState) {
    const token = getAuthToken();

    try {
      const response = await axios.patch(
        `${BASE_URL}/agenda/${id}/${state}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data;
      console.error("Error:", msg);
      throw new Error(msg);
    }
  }
}

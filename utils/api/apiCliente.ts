import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { Cliente } from "@/utils/types";
import axios from "axios";

export class ClientService {
  static async crearCliente(data: Cliente) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/cliente`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async listarClientes(limit: number = 10, offset: number = 0) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/cliente`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit,
          offset,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async listarClientePorId(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/cliente/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error.message || "Error desconocido";
      console.log("❌ Error al lmostrar un cliente:", msg);
      throw new Error(msg);
    }
  }

  static async deleteCliente(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.delete(`${BASE_URL}/cliente/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error.message || "Error desconocido";
      console.log("❌ Error al eliminar un cliente:", msg);
      throw new Error(msg);
    }
  }

  static async editarCliente(id: string, data: Cliente) {
    const token = getAuthToken();

    try {
      const response = await axios.patch(`${BASE_URL}/cliente/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error.message || "Error desconocido";
      console.log("❌ Error al editar un cliente:", msg);
      throw new Error(msg); // <-- esto lanza el mensaje correcto
    }
  }

  static async listarClientesCompletos(limit: number = 10, offset: number = 0) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/cliente/eq/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit,
          offset,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      console.log("❌ Error al listar los clientes:", msg);
      throw new Error(msg);
    }
  }
}

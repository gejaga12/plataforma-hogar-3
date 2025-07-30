import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import axios from "axios";

export interface crearJerarquiaData {
  name: string;
  parent?: string; //opcional para padre
  area: string;
}

export interface CrearJerarquiaConUsuario extends crearJerarquiaData {
  usuarioId?: string;
}

export interface JerarquiaNodo {
  user: boolean;
  id: string;
  cargo: string;
  userid?: string;
  fullName: string;
  email?: string;
  phone?: string;
  area: string;
  relacionLaboral?: string;
  puesto?: string[];
  subordinados?: JerarquiaNodo[]; // Recursivo
}

export interface JerarquiaCompletaResponse {
  areas: string[];
  tree: JerarquiaNodo[];
}

export class JerarquiaService {
  
  static async crearJerarquia(data: crearJerarquiaData): Promise<any> {
    try {
      const token = getAuthToken();

      const response = await axios.post(`${BASE_URL}/jerarquia`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || "Error al crear jerarquía";
      throw new Error(mensaje);
    }
  }

  //ARBOL COMPLETO DE JERARQUIA
  static async getJerarquiaCompleta(): Promise<JerarquiaCompletaResponse> {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/jerarquia`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data as JerarquiaCompletaResponse;
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "Error al obtener el arbol de jerarquia";
      throw new Error(mensaje);
    }
  }

  static async asociarUsuarioANodo(
    orgid: string,
    userid: string
  ): Promise<any> {
    try {
      const token = getAuthToken();;

      const response = await axios.post(
        `${BASE_URL}/jerarquia/${orgid}/${userid}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || "Error al asociar usuario a nodo";
      throw new Error(mensaje);
    }
  }

  //NODOS DISPONIBLES
  static async getNodosDisponibles(): Promise<any[]> {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/jerarquia/available/nodes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || "Error al obtener nodos disponibles";
      throw new Error(mensaje);
    }
  }

  static async removerUsuarioDeNodo(
    orgid: string,
    userid: number
  ): Promise<{ id: string; name: string }> {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${BASE_URL}/jerarquia/${orgid}/${userid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || "Error al remover usuario del nodo";
      throw new Error(mensaje);
    }
  }

  static async removerNodoDeJerarquia(id: string): Promise<void> {
    try {
      const token = getAuthToken();

      await axios.delete(`${BASE_URL}/jerarquia/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || "Error al eliminar nodo de jerarquía";
      throw new Error(mensaje);
    }
  }

  static async actualizarNodoJerarquia(
    id: string,
    data: crearJerarquiaData
  ): Promise<void> {
    try {
      const token = getAuthToken();

      await axios.put(`${BASE_URL}/jerarquia/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        "Error al actualizar el nodo de jerarquía";
      throw new Error(mensaje);
    }
  }
}

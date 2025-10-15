import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import axios from "axios";

interface CrearOTPayload {
  commentary: string;
  task: string; // ID en formato string
  userId?: number;
}

interface ListarOTsParams {
  limit?: number;
  offset?: number;
}

type EstadoOT =
  | "pendiente"
  | "en_camino"
  | "me_recibio"
  | "no_me_recibio"
  | "finalizado"
  | "postergado"
  | "sin_asignar";

export class OTService {
  static async crearOT(data: CrearOTPayload) {
    const token = getAuthToken();
    try {
      const response = await axios.post(`${BASE_URL}/ot`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message;
      console.log("Error:", msg);
      throw new Error(msg);
    }
  }

  static async listarOTs(params: ListarOTsParams = {}) {
    const { limit = 10, offset = 0 } = params;
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/ot`, {
        params: { limit, offset },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error("Error al obtener las OTs.");
    }
  }

  static async asignarOT(id: number, userId: number) {
    const token = getAuthToken();
    try {
      const response = await axios.post(
        `${BASE_URL}/ot/assign/${id}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("OT o usuario no encontrado.");
      }
      throw new Error("Error al asignar la OT.");
    }
  }

  static async obtenerOTDetalleMDA(id: number) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/ot/mda/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("OT no encontrada.");
      }
      throw new Error("Error al obtener el detalle de la OT.");
    }
  }

  static async eliminarOT(id: number) {
    const token = getAuthToken();

    try {
      const response = await axios.delete(`${BASE_URL}/ot/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("OT no encontrada.");
      }
      throw new Error("Error al obtener el detalle de la OT.");
    }
  }

  static async cambiarEstadoOT(id: number, nuevoEstado: EstadoOT) {
    const token = getAuthToken();

    try {
      const response = await axios.patch(
        `${BASE_URL}/ot/state/${id}/${nuevoEstado}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("OT no encontrada.");
      }
      throw new Error("Error al cambiar el estado de la OT.");
    }
  }

  //IMAGENES
  static async traerImagesById(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/ot-images/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      return URL.createObjectURL(response.data);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Error al traer la imagen";
      console.log("Error:", msg);
      throw new Error(msg);
    }
  }
}

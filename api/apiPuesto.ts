import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import axios from "axios";

interface CrearPuestoPayload {
  name: string;
  laborId: string;
}
interface PuestoResponse {
  id: string;
  nombre: string;
}

interface EditarPuestoPayload extends CrearPuestoPayload {}

export class PuestoService {
  static async crearPuesto(
    payload: CrearPuestoPayload
  ): Promise<PuestoResponse> {
    const token = getAuthToken();
    if (!token) throw new Error("Token no disponible");

    try {
      const response = await axios.post<PuestoResponse>(
        `${BASE_URL}/puesto`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error al crear puesto:",
        error?.response?.data || error.message
      );
      const message = error.response?.data?.message || "Error al crear puesto";
      throw new Error(message);
    }
  }

  static async editarPuesto(
    id: string,
    payload: EditarPuestoPayload
  ): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error("Token no disponible");

    try {
      await axios.put(`${BASE_URL}/puesto/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      console.error(
        "Error al editar puesto:",
        error?.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Error al editar puesto"
      );
    }
  }

  static async eliminarPuesto(id: string): Promise<void> {
    const token = getAuthToken();
    try {
      await axios.delete(`${BASE_URL}/puesto/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.log(
        "Error al eliminar el puesto:",
        error?.response?.data?.message || error.message
      );

      throw new Error(error?.response?.data?.message);
    }
  }
}

import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import axios from "axios";
import toast from "react-hot-toast";

export type PhoneForm = { tel: string; phoneType: PhoneType };

export type TelPayload = {
  tel: string;
  phoneType: PhoneType;
  userId: number;
};

export enum PhoneType {
  PRIMARY = "principal",
  SEC = "secundario",
  EM = "emergencia",
}

export class TelService {
  static async crearTelefono(data: TelPayload) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/tel`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      toast.error("Ocurrio un error al crear el telefono.");
      console.log("Error:", error);
      throw error;
    }
  }

  static async eliminarTelefono(id: string) {
    const token = getAuthToken();

    const response = await axios.delete(`${BASE_URL}/tel/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  static async editarTelefono(id: number, data: Partial<TelPayload>) {
    const token = getAuthToken();
    try {
      const response = await axios.put(
        `${BASE_URL}/tel/${id}`, // URL
        data, // body con los campos a actualizar
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Error al editar teléfono:",
        error.response?.data || error.message
      );
      throw new Error(error);
    }
  }
}

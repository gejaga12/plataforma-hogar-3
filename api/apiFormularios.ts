import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { Task } from "@/utils/types";
import axios from "axios";



export class TaskServices {
  static async crearTask(data: Task) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/task`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al crear la tarea";
      throw new Error(message);
    }
  }

  static async getTasks(limit = 10, offset = 0) {
    try {
      const token = getAuthToken();

      const response = await axios.get(`${BASE_URL}/task`, {
        params: { limit, offset },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al obtener las tareas";
      throw new Error(message);
    }
  }
}

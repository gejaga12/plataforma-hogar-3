import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { PlanTasks, Task } from "@/utils/types";
import axios from "axios";

type PlanTaskUpdateDto = {
  name?: string;
  description?: string;
};

type TaskUpdateDto = Partial<Task> & Record<string, any>;

export class TaskServices {
  //PLAN TASK
  static async crearPlanTasks(data: PlanTasks) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/plan-task`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al crear el plan de tareas";
      throw new Error(message);
    }
  }

  static async fetchPlanTask(limit = 10, offset = 0) {
    const token = getAuthToken();

    const response = await axios.get(`${BASE_URL}/plan-task`, {
      params: { limit, offset },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  static async getPlanTaskbyId(id: string) {
    const token = getAuthToken();

    const response = await axios.get(`${BASE_URL}/plan-task/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  static async patchPlanTask(id: string, data: PlanTaskUpdateDto) {
    const token = getAuthToken();

    try {
      const response = await axios.patch(`${BASE_URL}/plan-task/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Error al actualizar el plan de tareas";
      throw new Error(message);
    }
  }

  static async deletePlanTask(id: string) {
    const token = getAuthToken();

    const response = await axios.delete(`${BASE_URL}/plan-task/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  //TASK
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

  static async getTaskbyId(id: string) {
    try {
      const token = getAuthToken();

      const response = await axios.get(`${BASE_URL}/task/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Error al obtener la tarea";
      throw new Error(message);
    }
  }

  static async duplicateTask(id: string) {
    const token = getAuthToken();

    const response = await axios.post(`${BASE_URL}/task/duplicate/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  static async patchTask(id: string, data: TaskUpdateDto = {}) {
    const token = getAuthToken();

    try {
      const response = await axios.patch(`${BASE_URL}/task/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al actualizar la tarea";
      throw new Error(message);
    }
  }
}

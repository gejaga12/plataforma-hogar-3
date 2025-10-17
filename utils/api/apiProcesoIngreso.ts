import axios from "axios";
import { BASE_URL } from "../baseURL";
import { getAuthToken } from "../authToken";
import { FlujoPayload } from "../types";

interface ListarFlujosParams {
  limit?: number;
  offset?: number;
}

interface FlujoGetResponse {
  _id: string;
  code: string;
  StartedNode: string;
  nodes: Record<string, unknown>;
  options: Record<string, unknown>;
}

type UpdateFlujoPayload = Partial<FlujoPayload>;

interface ProcessPayload {
  usuario: string;
  fechaInicio: string;
  prioridad: string;
}

export class ProcesoIngresoService {
  //FLUJO
  static async crearflujo(data: FlujoPayload, signal?: AbortSignal) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/flujo`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      return response.data;
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error desconocido";
      throw new Error(`No se pudo crear el flujo: ${backendMsg}`);
    }
  }

  static async listarFlujos(
    { limit = 10, offset = 0 }: ListarFlujosParams = {},
    signal?: AbortSignal
  ): Promise<FlujoGetResponse[]> {
    const token = getAuthToken();
    try {
      const resp = await axios.get<FlujoGetResponse[]>(`${BASE_URL}/flujo`, {
        params: { limit, offset },
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      return resp.data;
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error desconocido";
      throw new Error(`No se pudo obtener el listado de flujos: ${backendMsg}`);
    }
  }

  static async mostrarFlujoId(id: string): Promise<FlujoGetResponse> {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/flujo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async actualizarFlujo(
    id: string,
    data: UpdateFlujoPayload,
    signal?: AbortSignal
  ) {
    const token = getAuthToken();
    if (!id) throw new Error("Falta el id del flujo para actualizar.");
    try {
      const resp = await axios.patch(`${BASE_URL}/flujo/${id}`, data, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return resp.data;
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error desconocido";
      throw new Error(`No se pudo actualizar el flujo (${id}): ${backendMsg}`);
    }
  }

  static async eliminarFlujo(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.delete(`${BASE_URL}/flujo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      console.warn("Error:", msg);
      throw new Error(msg);
    }
  }

  //PROCESS
  static async crearProceso(flowId: string, data: ProcessPayload) {
    const token = getAuthToken();
    try {
      const response = await axios.post(`${BASE_URL}/process/${flowId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async obtenerProceso(
    flowId: string,
    signal?: AbortSignal
  ): Promise<any> {
    if (!flowId) throw new Error("Falta el flowId del proceso.");

    try {
      const resp = await axios.get(`${BASE_URL}/process/${flowId}`, {
        signal,
        headers: { Accept: "application/json" },
      });
      return resp.data; // sin tipar
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error desconocido";
      throw new Error(
        `No se pudo obtener el proceso (${flowId}): ${backendMsg}`
      );
    }
  }

  static async avanzarProceso(
    processId: string,
    optionIndex: number,
    body: Record<string, any> = {},
    signal?: AbortSignal
  ): Promise<any> {
    if (!processId) throw new Error("Falta el processId.");

    try {
      const token = getAuthToken();
      const resp = await axios.post(
        `${BASE_URL}/process/${processId}/${optionIndex}`,
        body,
        {
          signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return resp.data;
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || "Error desconocido";
      throw new Error(backendMsg);
    }
  }
}

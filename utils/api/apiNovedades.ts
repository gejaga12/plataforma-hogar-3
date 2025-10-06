import axios from "axios";
import { getAuthToken } from "../authToken";
import { Novedad } from "../types";
import { BASE_URL } from "../baseURL";

export type Segregacion = {
  users?: number[];
  zonas?: string[];
  areas?: string[];
};

type CrearNovedadPayload = {
  name: string;
  desc?: string;
  segregacion?: Segregacion;
  icono?: string;
};

export class NovedadesService {
  static async crearNovedad(
    payload: CrearNovedadPayload,
    file?: File,
    fileFieldName: "file" | "image" = "file",
  ): Promise<Novedad> {
    const token = getAuthToken();
    const fd = new FormData();

    fd.append("name", payload.name);

    if (payload.desc && payload.desc.trim().length > 0) {
      fd.append("desc", payload.desc.trim());
    }

    if (payload.icono) {
      fd.append("icono", payload.icono);
    }

    // 👇 el back quiere un único objeto 'segregacion'
    if (payload.segregacion) {
      fd.append("segregacion", JSON.stringify(payload.segregacion));
    }

    if (file) {
      // 👇 usa 'image' por defecto (ajustable con fileFieldName)
      fd.append(fileFieldName, file);
    }

    try {
      const response = await axios.post<Novedad>(`${BASE_URL}/novedades`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      const raw = error?.response?.data?.message ?? error?.message ?? "Error";
      const msg = Array.isArray(raw) ? raw.join(" | ") : String(raw);
      throw new Error(msg);
    }
  }

  static async obtenerNovedades(
    limit: number,
    offset: number,
    isAdmin: boolean,
  ): Promise<Novedad[]> {
    const token = getAuthToken();
    try {
      const response = await axios.get(`${BASE_URL}/novedades`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { limit, offset, isAdmin },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async fetchImagesNovedades(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/novedades/image/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const contentType = response.headers?.["content-type"] ?? "";
      return { blob: response.data as Blob, contentType };
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async fetchNovedadById(id: string): Promise<Novedad> {
    const token = getAuthToken();

    try {
      const response = await axios.get<Novedad>(`${BASE_URL}/novedades/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async editNovedad(
    payload: Partial<Novedad>,
    id: string
  ): Promise<Novedad> {
    const token = getAuthToken();

    try {
      const response = await axios.patch<Novedad>(
        `${BASE_URL}/novedades/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async deleteNovedad(id: string): Promise<void> {
    const token = getAuthToken();

    try {
      const response = await axios.delete<void>(`${BASE_URL}/novedades/${id}`, {
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

  static async interactionLike(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.post(
        `${BASE_URL}/interaction/like/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async interactionHeart(id: string) {
    const token = getAuthToken();
    try {
      const response = await axios.post(
        `${BASE_URL}/interaction/heart/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static async usuariosNovedaddes() {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/utils-users/novedades`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}

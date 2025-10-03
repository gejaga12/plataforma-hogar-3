import axios from "axios";
import { getAuthToken } from "../authToken";
import { Novedad } from "../types";
import { BASE_URL } from "../baseURL";

export class NovedadesService {
  static async crearNovedad(
    payload: {
      name: string;
      desc: string;
      icono?: string;
      users?: number[];
      zonas?: string[];
      areas?: string[];
    },
    file?: File
  ): Promise<Novedad> {
    const token = getAuthToken();
    const fd = new FormData();

    fd.append("name", payload.name);
    fd.append("desc", payload.desc);
    if (payload.icono) fd.append("icono", payload.icono);

    // Arrays del DTO como JSON string
    if (payload.users && payload.users.length) {
      fd.append("users", JSON.stringify(payload.users));
    }
    if (payload.zonas && payload.zonas.length) {
      fd.append("zonas", JSON.stringify(payload.zonas));
    }
    if (payload.areas && payload.areas.length) {
      fd.append("areas", JSON.stringify(payload.areas));
    }

    if (file) {
      fd.append("file", file);
    }

    try {
      const response = await axios.post<Novedad>(`${BASE_URL}/novedades`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      throw new Error(msg);
    }
  }

  static async obtenerNovedades(
    limit: number = 10,
    offset: number = 0
  ): Promise<Novedad[]> {
    const token = getAuthToken();
    try {
      const response = await axios.get(`${BASE_URL}/novedades`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { limit, offset },
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

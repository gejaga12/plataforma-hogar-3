import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { Equipo, UbicacionTec } from "@/utils/types";
import axios from "axios";

type EquipoAdminRequest = Pick<Equipo, "name" | "Kv"> & {
  KeyValue: {
    key: string;
    value: string;
  }[];
};

export interface QRAssign {
  qrCode: string;
  eqId: string;
}

export class EquipoService {
  static async crearEquipo(data: Equipo) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/equipo`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Error al crear el equipo";
      throw new Error(msg);
    }
  }

  static async listarEquipos() {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/equipo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al listar los equipos";
      throw new Error(msg);
    }
  }

  static async mostrarEquipoId(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/equipo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }

  static async eliminarEquipo(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.delete(`${BASE_URL}/equipo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }

  //------------- EQUIPO ADMIN -----
  static async crearEquipoAdmin(data: EquipoAdminRequest) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/equipo-admin`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }

  static async listarEquiposAdmin() {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/equipo-admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }

  //---------------- QR -----------
  static async generarQR() {
    const token = getAuthToken();
    try {
      const response = await axios.get(`${BASE_URL}/qr/gen`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  }

  static async asignarQR(data: QRAssign) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/qr/assign`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }

  static async listarQRs() {
    try {
      const response = await axios.get(`${BASE_URL}/qr/list`);

      return response.data;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  //--------------- UBICACION TECNICA -----------
  static async crearUbicTec(data: UbicacionTec) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/ubicacion-tecnica`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }

  static async listarUbicTec() {
    try {
      const response = await axios.get(`${BASE_URL}/ubicacion-tecnica`);

      return response.data;
    } catch (error: any) {
      const msg = error?.data?.response?.message || error.message;
      throw new Error(msg);
    }
  }
}

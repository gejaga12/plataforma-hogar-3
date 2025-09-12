"use client";

import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { Sucursal } from "@/utils/types";

import axios from "axios";

export class SucursalesService {
  //SUCURSALES HOGAR
  static async crearSucursalHogar(data: Sucursal) {
    try {
      const token = getAuthToken();

      const response = await axios.post(`${BASE_URL}/sucursal-hogar`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al crear la sucursal hogar";
      throw new Error(message);
    }
  }

  static async getAllSucursalesHogar(): Promise<Sucursal[]> {
    try {
      const token = getAuthToken();

      const response = await axios.get(`${BASE_URL}/sucursal-hogar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al obtener sucursales hogar";
      throw new Error(message);
    }
  }

  static async getOneSucursalHogar(id: string) {
    try {
      const token = getAuthToken();

      const response = await axios.get(`${BASE_URL}/sucursal-hogar/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al obtener la sucursal hogar";
      throw new Error(message);
    }
  }

  static async deleteSucursalHogar(id: string) {
    try {
      const token = getAuthToken();

      const response = await axios.delete(`${BASE_URL}/sucursal-hogar/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al eliminar la sucursal";
      throw new Error(message);
    }
  }

  //SUCURSALES CLIENTES
  static async crearSucursalCliente(data: Sucursal) {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/sucursal`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al crear la sucursal";
      console.log("Error:", msg);
      throw new Error(msg);
    }
  }

  static async listarSucursales(limit: number = 10, offset: number = 0) {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/sucursal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit,
          offset,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response;
      console.log("Error:", msg);
      throw new Error(msg);
    }
  }

  static async sucursalesMapa() {
    //Para mostrar las sucursales en el mapa
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/sucursal/map`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Error al listar las sucursales en el mapa";
      throw new Error(msg);
    }
  }

  static async editarSucursal(id: string, data: Sucursal) {
    const token = getAuthToken();

    try {
      const response = await axios.patch(`${BASE_URL}/sucursal/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al editar la sucursal";
      console.log("Error:", msg);
      throw new Error(msg);
    }
  }

  static async eliminarSucursal(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.delete(`${BASE_URL}/sucursal/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al eliminar la sucursal";
      console.log("Error:", msg);
      throw new Error(msg);
    }
  }

  static async activeSucursal(id: string) {
    const token = getAuthToken();

    try {
      const response = await axios.patch(`${BASE_URL}/sucursal/toggle/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response;
      throw new Error(msg);
    }
  }
}

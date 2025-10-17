import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { Pais, Provincia, Zona } from "@/utils/types";

import axios from "axios";

//zonas
export interface CreateRegionDto {
  name: string;
  paisId: string;
  provincias?: string[];
}

interface RegionResponse {
  id: string;
  nombre: string;
  paisId: string;
}

export class ZonaService {
  static async createRegion(data: CreateRegionDto): Promise<RegionResponse> {
    const token = getAuthToken();

    const response = await axios.post(`${BASE_URL}/region`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  static async asignarZona(zonaId: string, userId: number): Promise<void> {
    const token = getAuthToken();

    try {
      const response = await axios.put(
        `${BASE_URL}/region/add/${zonaId}/user/${userId}`,
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
      console.log("Error:", msg)
      throw new Error(msg);
    }
  }

  static async getZonas(): Promise<Zona[]> {
    const token = getAuthToken();

    const response = await axios.get(`${BASE_URL}/region`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const respZonas = response.data;

    return respZonas;
  }

  static async getById(id: string): Promise<Zona> {
    const token = getAuthToken();

    const response = await axios.get(`${BASE_URL}/region/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  //GET del objeto anidado completo
  static async allInfoZona(): Promise<{
    zonas: Zona[];
    paises: Pais[];
    provincias: Provincia[];
  }> {
    const token = getAuthToken();

    const response = await axios.get(`${BASE_URL}/region/all/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { pais, region, provincias } = response.data;

    const zonas = region.map((reg: any) => {
      const paisAsociado = pais.find((p: any) => p.id === reg.paisId);
      const provinciasAsociadas = provincias.filter(
        (prov: any) => prov.regionId === reg.id
      );
      return {
        ...reg,
        pais: paisAsociado ?? { id: reg.paisId, name: "Sin Pais" },
        provincias: provinciasAsociadas,
      };
    });

    return {
      zonas,
      paises: pais,
      provincias: provincias,
    };
  }

  //POST para activar o desactivar
  static async toggleZona(id: string): Promise<void> {
    const token = getAuthToken();

    await axios.post(`${BASE_URL}/region/toggle/${id}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static async deleteZona(id: string): Promise<void> {
    const token = getAuthToken();

    await axios.delete(`${BASE_URL}/region/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  //POST para pais
  static async crearPais(data: { name: string }): Promise<Pais> {
    const token = getAuthToken();

    const response = await axios.post(`${BASE_URL}/pais`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  static async deletePais(id: string): Promise<void> {
    const token = getAuthToken();

    const response = await axios.delete(`${BASE_URL}/pais/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  //POST para provincia
  static async crearProvincia(data: {
    name: string;
    paisId: string;
    regionId?: string;
  }): Promise<Provincia> {
    const token = getAuthToken();

    const response = await axios.post(`${BASE_URL}/provincia`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  static async deleteProvincia(id: string): Promise<void> {
    const token = getAuthToken();

    const response = await axios.delete(`${BASE_URL}/provincia/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  //PATCH para agregar provincias a una zona creada
  static async addProvince(
    regionId: string,
    provinceIds: string[]
  ): Promise<void> {
    const token = getAuthToken();

    await axios.patch(
      `${BASE_URL}/region/add/province/${regionId}`,
      { provinces: provinceIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}

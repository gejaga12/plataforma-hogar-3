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

  static async getZonas(): Promise<Zona[]> {
    const token = getAuthToken();

    const response = await axios.get(`${BASE_URL}/region`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const respZonas = response.data;

    // console.log(respZonas);

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

  static async addProvince(
    regionId: string,
    provinceIds: string[]
  ): Promise<void> {
    const token = getAuthToken();

    await axios.patch(
      `/api/region/add/province/${regionId}`,
      { provinces: provinceIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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

  //POST para provincia
  static async crearProvincia(data: { name: string }): Promise<Provincia> {
    const token = getAuthToken();

    const response = await axios.post(`${BASE_URL}/provincia`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
}

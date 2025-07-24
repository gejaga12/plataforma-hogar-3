import { getAuthToken } from "@/utils/authToken";
import { BASE_URL } from "@/utils/baseURL";
import { Pais, Zona } from "@/utils/types";

import axios from "axios";

interface RawResponseAllZona {
  pais: Pais[];
  region: {
    id: string;
    name: string;
    coords: { lan: number; lng: number }[];
    paisId: string;
    active: boolean;
  }[];
  provincias: {
    id: string;
    name: string;
    coords: { lan: number; lng: number }[];
    regionId: string;
  }[];
}

//zonas
interface CreateRegionDto {
  name: string;
  paisId: string;
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

  static async createZona(data: { name: string }): Promise<Zona> {
    const token = getAuthToken();

    const response = await axios.post(`${BASE_URL}/region`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  //GET del objeto anidado completo
  static async allInfoZona(): Promise<{ zonas: Zona[]; paises: Pais[] }> {
    const token = getAuthToken();

    const response = await axios.get<RawResponseAllZona>(
      `${BASE_URL}/region/all/data`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { pais, region, provincias } = response.data;

    // console.log(response.data);

    const zonas: Zona[] = region.map((reg) => {
      const paisData = pais.find((p) => p.id === reg.paisId) ?? {
        id: "",
        name: "",
      };

      const provinciasDeZona = provincias
        .filter((prov) => prov.regionId === reg.id)
        .map((prov) => ({
          id: prov.id,
          name: prov.name,
        }));

      return {
        id: reg.id,
        name: reg.name,
        Coords: reg.coords.map((c) => `${c.lan},${c.lng}`),
        pais: paisData,
        provincia: provinciasDeZona,
        active: reg.active ?? false,
      };
    });

    return { zonas, paises: pais };
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
}

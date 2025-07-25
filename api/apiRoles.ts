// lib/api/apiRoles.ts

import { BASE_URL } from "@/utils/baseURL";
import { getAuthToken } from "@/utils/authToken";
import axios from "axios";

export interface RolData {
  name: string;
  permissions: string[];
}

export interface RolResponse {
  id: string;
  name: string;
  users: {
    id: string,
    fullName: string
  }[];
  permissions: string[];
}

export interface Permiso {
  key: string;
  label: string;
}

export class ApiRoles {
  //crear rol
  static async crearRol(data: RolData): Promise<RolResponse> {
    const token = getAuthToken();
    try {
      const response = await axios.post<RolResponse>(
        `${BASE_URL}/roles`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const mensaje = error.response?.data?.message || "Fallo al crear rol";
      throw new Error(mensaje);
    }
  }

  // Obtener todos los roles
  static async listarRoles(): Promise<RolResponse[]> {
    const token = getAuthToken();
    try {
      const response = await axios.get<RolResponse[]>(`${BASE_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("roles:", response.data);

      return response.data;
    } catch (error: any) {
      const mensaje = error.response?.data?.message || "Fallo al obtener roles";
      throw new Error(mensaje);
    }
  }

  static async listaRolesCreacion(): Promise<Record<string, string>> {
    const token = getAuthToken();
    try {
      const response = await axios.get(`${BASE_URL}/roles/create/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rolesCreacion = response.data;
      // console.log("rolesCreacion:", rolesCreacion);

      return rolesCreacion as Record<string, string>;
    } catch (err: any) {
      const message = err.response?.data?.message || "Fallo al traer los roles";
      throw new Error(message);
    }
  }

  // Obtener permisos disponibles
  static async obtenerPermisosDisponibles(): Promise<Permiso[]> {
    const token = getAuthToken();
    try {
      const response = await axios.get(`${BASE_URL}/roles/get/permisos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rawPermisos: Record<string, string[]> = response.data;

      const permisos: Permiso[] = [];

      for (const modulo in rawPermisos) {
        rawPermisos[modulo].forEach((accion) => {
          const key = `${modulo}:${accion}`;
          permisos.push({
            key,
            label: mapearLabelPermiso(key),
          });
        });
      }

      return permisos;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Fallo al obtener permisos";
      throw new Error(msg);
    }
  }

  // Actualizar un rol existente
  static async actualizarRol(id: string, data: RolData): Promise<RolResponse> {
    const token = getAuthToken();
    try {
      const response = await axios.patch<RolResponse>(
        `${BASE_URL}/roles/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // corregí el espacio faltante
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const mensaje =
        status === 404
          ? "Rol no encontrado"
          : error.response?.data?.message || "Fallo al actualizar rol";

      throw new Error(mensaje);
    }
  }

  // Eliminar un rol existente
  static async eliminarRol(id: string): Promise<void> {
    const token = getAuthToken();
    try {
      const response = await axios.delete(`${BASE_URL}/roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const mensaje =
        status === 404
          ? "Rol no encontrado"
          : error.response?.data?.message || "Fallo al eliminar rol";

      throw new Error(mensaje);
    }
  }
}

// Función auxiliar para dar formato legible al permiso
function mapearLabelPermiso(key: string): string {
  const diccionario: Record<string, string> = {
    all: "Todos los permisos",
    "usuario:crear": "Crear usuario",
    "usuario:editar": "Editar usuario",
    "usuario:eliminar": "Eliminar usuario",
    "usuario:listar": "Listar usuarios",
    "rol:crear": "Crear rol",
    "rol:editar": "Editar rol",
    "rol:listar": "Listar roles",
    "organigrama:crear": "Crear organigrama",
    "organigrama:update": "Editar organigrama",
    "organigrama:listar": "Listar organigramas",
    "organigrama:eliminar": "Eliminar organigrama",
  };

  return diccionario[key] || key;
}

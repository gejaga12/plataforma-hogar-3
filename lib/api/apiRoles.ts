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
  users: string[];
  permissions: string[];
}

export interface Permiso {
  key: string;
  label: string;
}

const token = getAuthToken();

export class ApiRoles {
  //crear rol
  static async crearRol(data: RolData): Promise<RolResponse> {
    try {
      const response = await fetch(`${BASE_URL}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el rol");
      }

      const createdRole: RolResponse = await response.json();
      return createdRole;
    } catch (error: any) {
      throw new Error(error.message || "Fallo al crear rol");
    }
  }

  // Obtener todos los roles
  static async listarRoles(): Promise<RolResponse[]> {
    try {
      const response = await fetch(`${BASE_URL}/roles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al obtener los roles");
      }

      const roles: RolResponse[] = await response.json();

      console.log("roles:", roles);

      return roles;
    } catch (error: any) {
      throw new Error(error.message || "Fallo al obtener roles");
    }
  }

  static async listaRolesCreacion(): Promise<Record<string, string>> {
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
    try {
      const response = await fetch(`${BASE_URL}/roles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const mensaje =
          response.status === 404
            ? "Rol no encontrado"
            : errorData.message || "Error al actualizar el rol";
        throw new Error(mensaje);
      }
      const updatedRole: RolResponse = await response.json();
      return updatedRole;
    } catch (error: any) {
      throw new Error(error.message || "Fallo al actualizar rol");
    }
  }

  // Eliminar un rol existente
  static async eliminarRol(id: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/roles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const mensaje =
          response.status === 404
            ? "Rol no encontrado"
            : errorData.message || "Error al eliminar el rol";
        throw new Error(mensaje);
      }

      // No devuelve contenido en body si es 200 OK
    } catch (error: any) {
      throw new Error(error.message || "Fallo al eliminar rol");
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

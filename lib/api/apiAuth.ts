import axios from "axios";
import { BASE_URL } from "@/utils/baseURL";

import { getAuthToken } from "@/utils/authToken";
import { UserAdapted, UserFromApi } from "@/utils/types";
import { formatDateInput } from "@/components/users/UserModal";

// Agregá este tipo en tu archivo de tipos
export type UserLoginData = Pick<
  UserFromApi,
  "id" | "email" | "fullName" | "roles"
>;

const adaptUser = (user: UserFromApi): UserAdapted => ({
  id: user.id,
  email: user.email ?? "",
  fullName: user.fullName ?? "",
  roles: user.roles ?? [],
  zona: user.zona?.name ?? "",
  area: user.jerarquia?.area ?? "",
  puesto: user.labor?.puestos?.[0] ?? "",
  fechaIngreso: user.labor?.fechaIngreso
    ? formatDateInput(user.labor.fechaIngreso)
    : "",
  fechaNacimiento: formatDateInput(user.fechaNacimiento),
  direccion: user.address ?? "",
  telefono: Array.isArray(user.phoneNumber) ? user.phoneNumber.join(", ") : "",
  relacionLaboral: user.labor?.relacionLaboral ?? "Periodo de Prueba",
  tipoContrato: user.labor?.tipoDeContrato ?? "Relación de Dependencia",
  certificacionesTitulo: "",
  sucursalHogar: user.sucursalHogar?.name ?? "",
  activo: user.isActive ?? true,
  notificaciones: {
    mail: false,
    push: false,
  },
});

export class AuthService {
  private static currentUser: UserLoginData | null = null;
  private static listeners: ((user: UserLoginData | null) => void)[] = [];

  static async signInWithEmail(
    fullName: string,
    password: string
  ): Promise<UserLoginData> {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        fullName,
        password,
      });

      const { user, token } = response.data;

      const userData: UserLoginData = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles || [],
      };

      this.currentUser = userData;

      // Guardar token y usuario
      localStorage.setItem("auth-user", JSON.stringify(userData));
      localStorage.setItem("auth-token", token);
      // Notificar listeners
      this.listeners.forEach((listener) => listener(userData));

      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || "Credenciales inválidas";
      throw new Error(message);
    }
  }

  static async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem("auth-user");
    localStorage.removeItem("auth-token");

    // Notify listeners
    this.listeners.forEach((listener) => listener(null));
  }

  static async registerUser(data: {
    email: string;
    password: string;
    fullName: string;
    roles: string[]; // IDs de los roles
    phoneNumber: string;
    address: string;
    puesto: string;
    relacionLaboral: string;
    zona: string;
    sucursalHogar: string;
    tipoDeContrato: string;
    fechaIngreso: Date;
    fechaNacimiento: Date;
  }): Promise<UserFromApi> {
    const token = getAuthToken();

    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = response.data;

      console.log(resData);

      const newUser: UserFromApi = {
        id: resData.id,
        email: resData.email ?? "",
        fullName: resData.fullName ?? "",
        roles: resData.roles ?? [], // array de objetos { id, name }
        photoURL: resData.photoURL || "",
        phoneNumber: resData.phoneNumber || [],
        address: resData.address || "",
        jerarquia: resData.jerarquia ?? null,
        sucursalHogar: resData.sucursalHogar ?? null,
        zona: resData.zona ?? null,
        createdAt: resData.createdAt ?? new Date().toISOString(),
        deletedAt: resData.deletedAt ?? null,
        fechaNacimiento: resData.fechaNacimiento ?? new Date(),
        isActive: resData.isActive ?? true,
        labor: resData.labor ?? null, // 👈 CORRECTO
      };

      return newUser;
    } catch (error: any) {
      const message = error.response?.data?.message || "Fallo el registro";
      throw new Error(message);
    }
  }

  static async DeleteUSerModal(id: string): Promise<void> {
    const token = getAuthToken();

    try {
      await axios.delete(`${BASE_URL}/auth/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al eliminar el usuario";
      throw new Error(message);
    }
  }

  static async getUsers(limit = 10, offset = 0): Promise<UserAdapted[]> {
    const token = getAuthToken();

    try {
      const response = await axios.get(`${BASE_URL}/auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit, offset },
      });

      const rawUsers: UserFromApi[] = response.data;

      return rawUsers.map(adaptUser);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al obtener usuarios";
      throw new Error(message);
    }
  }

  static getCurrentUser(): UserLoginData | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth-user");
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
          return this.currentUser;
        } catch (error) {
          localStorage.removeItem("auth-user");
        }
      }
    }

    return null;
  }

  static onAuthStateChanged(
    callback: (user: UserLoginData | null) => void
  ): () => void {
    // Add listener
    this.listeners.push(callback);

    // Immediately call with current user
    const currentUser = this.getCurrentUser();
    callback(currentUser);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  static getDefaultPermissions(role: string): string[] {
    const permissions: Record<any, string[]> = {
      TÉCNICO: [
        "orders:view",
        "orders:update",
        "orders:complete",
        "news:view",
        "profile:edit",
      ],
      SUPERVISOR: [
        "orders:view",
        "orders:create",
        "orders:update",
        "orders:assign",
        "orders:complete",
        "news:view",
        "news:create",
        "reports:view",
        "team:view",
        "profile:edit",
      ],
      ADMIN: [
        "orders:*",
        "news:*",
        "users:*",
        "reports:*",
        "settings:*",
        "analytics:view",
      ],
    };

    return permissions[role] || permissions["TÉCNICO"];
  }
}

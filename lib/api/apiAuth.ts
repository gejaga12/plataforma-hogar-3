import { BASE_URL } from "@/utils/baseURL";
import { SystemUser, User, UserRole } from "../../utils/types";
import { getAuthToken } from "@/utils/authToken";

// Mock users for demonstration
const mockUsers = [
  {
    uid: "1",
    email: "admin@hogarapp.com",
    displayName: "Administrador",
    photoURL: "",
    role: "ADMIN" as UserRole,
    permissions: [
      "orders:*",
      "news:*",
      "users:*",
      "reports:*",
      "settings:*",
      "analytics:view",
    ],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: "2",
    email: "supervisor@hogarapp.com",
    displayName: "Supervisor",
    photoURL: "",
    role: "SUPERVISOR" as UserRole,
    permissions: [
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
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: "3",
    email: "tecnico@hogarapp.com",
    displayName: "Técnico",
    photoURL: "",
    role: "TÉCNICO" as UserRole,
    permissions: [
      "orders:view",
      "orders:update",
      "orders:complete",
      "news:view",
      "profile:edit",
    ],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
];

export class AuthService {
  private static currentUser: User | null = null;
  private static listeners: ((user: User | null) => void)[] = [];

  static async signInWithEmail(
    fullName: string,
    password: string
  ): Promise<User> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Credenciales inválidas");
      }

      const { user, token } = await response.json();

      // Adaptar el user al tipo User de tu app
      const userData: User = {
        uid: user.id,
        email: user.email,
        displayName: user.fullName,
        photoURL: "", // si no hay en el backend
        role: user.roles[0]?.name.toUpperCase(), // ajustalo si el backend devuelve otra cosa
        permissions: user.permissions || [],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      this.currentUser = userData;

      // Guardar token y usuario
      localStorage.setItem("auth-user", JSON.stringify(userData));
      localStorage.setItem("auth-token", token);

      // Notificar listeners
      this.listeners.forEach((listener) => listener(userData));

      return userData;
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión");
    }
  }

  static async signInWithGoogle(): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo, return the admin user
    const userData = {
      ...mockUsers[0],
      lastLoginAt: new Date().toISOString(),
      displayName: "Usuario Google",
      photoURL:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    };

    this.currentUser = userData;

    // Store in localStorage for persistence
    localStorage.setItem("auth-user", JSON.stringify(userData));

    // Notify listeners
    this.listeners.forEach((listener) => listener(userData));

    return userData;
  }

  static async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem("auth-user");

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
  }): Promise<User> {
    const token = getAuthToken();

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // sólo admins pueden registrar
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("error:", errorData);
        throw new Error(errorData.message || "Error al registrar usuario");
      }

      const resData = await response.json();

      const newUser: User = {
        uid: resData.id,
        email: resData.email,
        displayName: resData.fullName,
        photoURL: "", // si no hay en backend
        role: resData.roles[0]?.name.toUpperCase(),
        permissions: resData.permissions || [],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      return newUser;
    } catch (error: any) {
      throw new Error(error.message || "Fallo el registro");
    }
  }

  static async getUsers(limit = 10, offset = 0): Promise<SystemUser[]> {
    const token = getAuthToken();

    const response = await fetch(
      `${BASE_URL}/auth?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Error al obtener usuarios");
    }

    const data = await response.json();
    console.log("📥 Usuarios del backend:", data);

    const adapted: SystemUser[] = data.map((user: any) => ({
      id: user.id,
      nombreCompleto: user.fullName,
      zona: user.zona,
      sucursalHogar: user.sucursalHogar,
      area: user.area,
      puesto: user.puesto,
      fechaIngreso: user.fechaIngreso,
      mail: user.email,
      direccion: user.address,
      telefono: user.phoneNumber,
      certificacionesTitulo: "",
      notificaciones: { mail: false, push: false },
      roles: user.roles.map((r: any) => r.name.toLowerCase()),
      periodoPruebaContratado: "",
      tipoContrato: user.tipoContrato,
      documentos: [],
      activo: true,
      createdAt: user.createdAt,
      updatedAt: "",
    }));

    return adapted;
  }

  static getCurrentUser(): User | null {
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

  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
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

  static getDefaultPermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
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

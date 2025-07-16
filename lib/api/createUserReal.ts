import { CreateUserData } from "@/utils/types";
import { AuthService } from "./apiAuth";


export const createUserReal = async (userData: CreateUserData): Promise<any> => {
  const mappedPayload = {
    fullName: userData.nombreCompleto,
    email: userData.mail,
    password: "Temporal123!", // O pedís contraseña al crear
    phoneNumber: userData.telefono || "",
    address: userData.direccion || "",
    puesto: userData.puesto,
    relacionLaboral: userData.periodoPruebaContratado,
    zona: userData.zona.toLowerCase(),
    sucursalHogar: userData.sucursalHogar || "",
    tipoDeContrato: userData.tipoContrato,
    roles: userData.roles.map(role => mapRoleToBackendId(role))
  };

   console.log("📤 Enviando usuario al backend:", mappedPayload);

  return await AuthService.registerUser(mappedPayload);
};

// Este helper traduce el nombre del rol a su ID
function mapRoleToBackendId(role: string): string {
  const roleMap: Record<string, string> = {
    admin: "791d17ad-9d12-48b5-8073-e41c0afc5f08",
    coordinador: "id-rol-coordinador",
    supervisor: "id-rol-supervisor",
    tecnico: "id-rol-tecnico"
  };

  return roleMap[role] || "";
}

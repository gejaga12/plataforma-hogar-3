import { formatDateInput } from "./formatDate";
import { CreateUserData, UserAdapted, UserFromApi } from "./types";

export const mapUserToCreateUserData = (user: UserAdapted): CreateUserData => ({
  nombreCompleto: user.fullName,
  zona: user.zona,
  fechaNacimiento: user.fechaNacimiento,
  mail: user.email,
  direccion: user.direccion,
  telefono: user.telefono,
  roles: user.roles.map((r) => r.id),
  puesto: user.puesto,
  area: user.area,
  sucursalHogar: user.sucursalHogar,
  activo: user.activo,
  notificaciones: user.notificaciones,
});

//para edicion de info laboral
export const mapUserAdaptedToUserFromApi = (user: UserAdapted): UserFromApi => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: [user.telefono], // lo convertimos a array porque así lo espera tu tipo original
    address: user.direccion,
    fechaNacimiento: new Date(user.fechaNacimiento),
    zona: user.zona
      ? {
          id: user.zona,
          name: "", // podés completarlo si lo tenés
          active: true,
          pais: { id: "", name: "" }, // o el país real si lo tenés
          provincia: [],
          Coords: [],
        }
      : null,
    sucursalHogar: user.sucursalHogar
      ? {
          id: user.sucursalHogar,
          name: "",
          lan: 0,
          lng: 0,
          direction: "",
        }
      : null,
    roles: user.roles.map((r) =>
      typeof r === "string" ? { id: r, name: r, permissions: [] } : r
    ),
    puesto: user.puesto,
    area: user.area,
    isActive: user.activo,
    photoURL: user.photoURL,
    labor: user.laborId
      ? {
          id: user.laborId,
          fechaAlta: null,
          puestos: user.puesto ? [user.puesto] : [],
          tipoDeContrato: user.tipoContrato,
          relacionLaboral: user.relacionLaboral as
            | "Contratado"
            | "Periodo de Prueba",
          cuil: null,
          categoryArca: null,
          antiguedad: null,
          horasTrabajo: null,
          sueldo: null,
          fechaIngreso: new Date(user.fechaIngreso),
        }
      : null,
    createdAt: undefined,
    deletedAt: null,
    jerarquia: null,
  };
};

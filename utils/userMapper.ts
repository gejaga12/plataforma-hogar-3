import { CreateUserData, UserAdapted, UserFromApi } from "./types";

export const mapUserToCreateUserData = (user: UserAdapted): CreateUserData => ({
  nombreCompleto: user.fullName,
  zona: user.zona,
  fechaIngreso: user.fechaIngreso,
  fechaNacimiento: user.fechaNacimiento,
  mail: user.email,
  direccion: user.direccion,
  telefono: user.telefono,
  roles: user.roles.map((r) => r.id),
  certificacionesTitulo: user.certificacionesTitulo ?? "",
  puesto: user.puesto,
  area: user.area,
  relacionLaboral:
    user.relacionLaboral === "Contratado" ? "Contratado" : "Periodo de Prueba",
  tipoContrato: user.tipoContrato,
  sucursalHogar: user.sucursalHogar,
  activo: user.activo,
  notificaciones: user.notificaciones,
});

//para edicion de info laboral
export const mapUserAdaptedToUserFromApi = (user: UserAdapted): UserFromApi => {
  console.log("laborId recibido:", user.laborId);
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.telefono
      ? user.telefono.split(",").map((t) => t.trim())
      : [],
    address: user.direccion,
    fechaNacimiento: new Date(user.fechaNacimiento),

    zona: user.zona
      ? {
          id: user.zona,
          name: "",
          Coords:[],  // Ajusta estos valores según corresponda
          pais: pais.name,
          provincia: "",
          active: true,
        }
      : null, // si tenés el tipo real, reemplazá
    sucursalHogar: user.sucursalHogar
      ? {
          id: "", // completar con el id real si está disponible
          name: user.sucursalHogar,
          lan: 0,
          lng: 0,
          direction: "",
        }
      : null,
    roles: user.roles.map((r) => {
      if (typeof r === "string") {
        return { id: r, name: r, permissions: [] };
      }
      return { ...r, permissions: r.permissions ?? [] };
    }),

    area: user.area || "",
    puesto: user.puesto || "",
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

import { CreateUserData, UserAdapted } from "./types";

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

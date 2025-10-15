import { PhoneForm } from "@/utils/api/apiTel";

//USUARIOS
export interface UserAdapted {
  id: number;
  email: string;
  fullName: string;
  roles: Role[];
  zona?: {
    name: string;
    id: string;
  };
  jerarquia?: Jerarquia;
  fechaNacimiento: string;
  createdAt: string;
  fechaIngreso?: string;
  fechaAlta?: string;
  deletedAt: string | null;
  address: string;
  telefono: PhoneForm[];
  relacionLaboral: string;
  photoURL?: string;
  certificacionesTitulo: string;
  sucursalHogar: {
    id: string;
    name: string;
  };
  isActive: boolean;
  notificaciones: {
    mail: boolean;
    push: boolean;
  };
  labor?: Labor;
}

export interface CreateUserData {
  nombreCompleto: string;
  contrasena?: string;
  telefono?: PhoneForm[];
  zona?: {
    id: string;
    name: string;
  };
  fechaNacimiento: string;
  mail: string;
  direccion: string;
  roles: string[]; // solo los IDs
  notificaciones?: {
    mail: boolean;
    push: boolean;
  };
  puesto: string;
  sucursalHogar: string;
  activo: boolean;
  jerarquiaId?: string;
}

//---------------------------------------//

//DATOS LABORALES
export interface Jerarquia {
  id: string;
  name: string;
  area: string;
}

export interface Labor {
  id: string;
  cuil?: number;
  fechaAlta?: string;
  categoryArca?: string;
  antiguedad?: string;
  tipoDeContrato: string;
  horasTrabajo?: string;
  sueldo?: number;
  relacionLaboral: string;
  fechaIngreso: string;
  puestos?: Puesto[];
}

export interface Puesto {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

//----------------------------------------//

//ZONAS
export interface GeoGeneric {
  id: string;
  name: string;
}
export interface Pais extends GeoGeneric {}

export interface Provincia extends GeoGeneric {
  regionId?: string;
  code?: number;
  paisId?: string;
}

export interface Zona extends GeoGeneric {
  Coords?: string[];
  pais?: Pais;
  provincias?: Provincia[];
  active: boolean;
}

//-----------------------------------------//

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  likes: string[];
  comments: Comment[];
  tags: string[];
  isPublished: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentId?: string;
  replies?: Comment[];
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  urgentOrders: number;
  myOrders: number;
  completionRate: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  roles: string[];
  children?: MenuItem[];
  badge?: string;
  isNew?: boolean;
}

//----------------------------------------//

// Tipos para el sistema de ingreso
export type EstadoPaso = "pendiente" | "en_curso" | "bloqueado" | "completo";

export interface PasoIngreso {
  id: string;
  nombre: string;
  area: string;
  estado: EstadoPaso;
  responsable: string;
  fechaEstimada: string;
  fechaReal?: string;
  observaciones?: string;
  adjuntos?: Archivo[];
  dependeDe?: string[];
  posicion: {
    x: number;
    y: number;
  };
}

export interface Archivo {
  id: string;
  nombre: string;
  url: string;
  tipo: string;
  tamaño: number;
  fechaSubida: string;
}

export interface ProcesoIngreso {
  id: string;
  nombreIngresante: string;
  puesto: string;
  areaDestino: string;
  fechaEstimadaIngreso: string;
  estadoGeneral: "iniciado" | "en_progreso" | "completado" | "detenido";
  pasos: PasoIngreso[];
  createdAt: string;
  updatedAt: string;
}

//----------------------------------------//

// INGRESO-EGRESO Y HORAS EXTRAS
export interface MovimientoIngresoEgreso {
  id: string;
  usuario: {
    id: "";
    nombreCompleto: "";
    rol: "";
  };
  tipo: "INGRESO" | "EGRESO";
  fechaHora: string;
  modo: string;
  motivo: string;
  ubicacion?: {
    direccion: string;
    latitud?: number;
    longitud?: number;
  };
  dispositivo?: string;
  ipAddress?: string;
  observaciones?: string;
  registradoPor?: string;
  createdAt: string;
}

export interface CrearHoraExtra {
  lan: number;
  lng: number;
  horaInicio: string;
  horaFinal: string;
  razon: string;
  comentario?: string;
}

export interface HorasExtras extends CrearHoraExtra {
  autorizado: string;
  controlado: string;
  fechaSolicitud: string;
  id: string;
  solicitante: string;
  state: EstadoHoraExtra;
  totalHoras: string;
  verificacion: Verificacion;
}

export enum EstadoHoraExtra {
  PENDIENTE = "pendiente",
  NOAPPROVED = "no aprobado",
  APPROVED = "aprobado",
}

export enum Verificacion {
  NOVERIFICADO = "no verificado",
  VERIFICADO = "verificado",
}

//----------------------------------------//

// Interfaz para novedades
;

export interface Novedad {
  id: string;
  name: string;
  fecha?: string;
  desc: string;
  icono?: string;
  likes?: number;
  views?: number;
  hearts?: number;
  like?: boolean;
  heart?: boolean;
  file?: File | null;
  imagePath?: boolean;
}

// AGENDA
export type AgendaState = "pendiente" | "progreso" | "finalizado";

export type AgendaPriority = "Alta" | "Media" | "Baja";

export type AgendaType =
  | "meeting"
  | "task"
  | "deadline"
  | "training"
  | "reminder";

export interface AgendaUserLite {
  id: number | string;
  email: string;
  fullName: string;
  isActive: boolean;
  fechaNacimiento: boolean | string;
  address: string;
  createdAt: string;
  zona: string;
  sucursal: Record<string, unknown>;
  configuraciones: {
    id: string;
    notificaciones: boolean;
    correos: boolean;
  };
}

export interface AgendaItem {
  id: string;
  name: string;
  until: string;
  priority?: AgendaPriority;
  description?: string;
  location?: string;
  state: AgendaState;
  assignedBy: AgendaUserLite;
  user: AgendaUserLite;
  type?: AgendaType;
}

// Respuesta completa del GET /agenda
export interface ListarAgendasResponse {
  subordinados: AgendaUserLite[];
  owner: AgendaItem[];
  subs: AgendaItem[];
  agendaByArea: AgendaItem[];
}

//----------------------------------------//

//FORMULARIOS
export enum Tipos {
  texto = "text",
  foto = "foto",
  existencia = "si/no",
  select = "select",
  numero = "number",
  fecha = "fecha",
  titulo = "titulo",
}

export interface PlanTasks {
  id?: string;
  name: string;
  description: string;
}

export interface Task {
  id?: string;
  code: string;
  priority: "alta" | "media" | "baja"; // si hay más, agregalos
  Activator?: Activador[];
  subtasks: Subtasks[];
  ptId?: string; // UUID
  duration: {
    horas: number;
    minutos: number;
  };
  paro?: {
    horas: number;
    minutos: number;
  };
}

export interface Subtasks {
  description: string;
  type?: Tipos;
  options?: {
    title: string;
    depends: Subtasks[];
  }[];
  group: string;
  required: boolean;
  FilesRequired: boolean;
  repeat?: number;
}

export interface Activador {
  cadencia: number;
  repition: number;
  lastRepitionDay: string; // formato ISO: "YYYY-MM-DDTHH:mm:ssZ"
  frecuencia: "day" | "week" | "month" | string;
  repiter: number;
  repiterCount: number;
  fijo: boolean;
}

//----------------------------------------//

//OTs
export interface Ots {
  id: number;
  state?: StateOT;
  processRef?: string;
  task?: Task;
  priority?: string;
  commentary?: string;
  result?: boolean;
  metadata?: Record<string, any>;
  pendiente?: string;
  en_camino?: string;
  me_recibio?: string;
  no_me_recibio?: string;
  finalizado?: string;
  postergado?: string;
  postergadoPor?: string;
  sin_asignar?: string;
  Audit?: Audit;
  tecnico?: UserAdapted;
  sucursal?: string;
  cliente?: string;
  facility?: string;
  firma?: string;
  aclaracion?: string;

  imageSolucioname?: string;
}

export enum StateOT {
  PENDING = "pendiente",
  ONTHERUN = "en_camino",
  RECEIVED = "me_recibio",
  WAITINGFORTHEWORMS = "no_me_recibio",
  INTHEEND = "finalizado",
  OUTSIDETHEWALL = "postergado",
  NOASSIGN = "sin_asignar",
}

export interface Audit {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

//----------------------------------------//

//CLIENTES Y SUCURSALES
export interface Cliente {
  id?: string;
  name: string;
  razonSocial?: string;
  cuit?: string;
  codigo?: string;
}

export interface Sucursal {
  coords?: {
    lan?: number;
    lng?: number;
  };
  address?: string;
  id?: string;
  name: string;
  codigo?: string;
  sucHogar?: string | Sucursal;
  cliente?: string | Cliente;
  users?: UserAdapted;
  isInternal?: boolean;
  estado?: "activo" | "inactivo";
  telefono?: string;
  email?: string;
  horario?: string;
  facility?: string;
  ultimaVisita?: string;
  proximaVisita?: string;
  equipos?: Equipo[];
  mantenimientos?: Mantenimiento[];
  isActive?: boolean;
}

export interface Sector {
  id?: string;
  name: string;
  sucursalid: string;
  codigo: string;
}

//----------------------------------------//

//EQUIPOS
export interface Equipo {
  id?: string;
  name: string;
  defId?: string;
  type?: string;
  Kv?: Kv[];
  habilitado: EstadoEquipo;
  fueraDeServicio: boolean;
  qrId?: string | null;
  ptId?: string;
  utId?: string;
}

export type KvValue = string | number | boolean | Date | undefined;

export interface Kv {
  key: string;
  value: KvValue;
}

export enum EstadoEquipo {
  OK = "ok",
  Reparacion = "reparacion",
  No_ok = "no_ok",
}

export interface Mantenimiento {
  id: string;
  fecha: string;
  tipo: "preventivo" | "correctivo" | "instalacion";
  tecnico: string;
  duracion: number; // en minutos
  observaciones?: string;
}

//----------------------------------------//

//Ubicacion tecnica
export interface UbicacionTec {
  name: string;
  SecId: string;
}

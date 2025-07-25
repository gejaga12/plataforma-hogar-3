export interface CreateUserData {
  nombreCompleto: string;
  contrasena?: string;
  zona: string;
  fechaNacimiento: string;
  mail: string;
  direccion: string;
  telefono: string;
  roles: string[]; // solo los IDs
  notificaciones?: {
    mail: boolean;
    push: boolean;
  };
  puesto?: string;
  area: string;
  sucursalHogar: string; // sucursal.name
  activo: boolean;
}

export interface UserFromApi {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  photoURL?: string;
  isActive?: boolean;
  fechaNacimiento: Date;
  address?: string;
  createdAt?: Date;
  deletedAt?: null;
  jerarquia?: Jerarquia | null;
  sucursalHogar?: SucursalHogar | null;
  roles: Role[];
  phoneNumber?: any[];
  zona?: Zona | null;
  labor?: Labor | null;
  puesto?: string;
  area?: string;
}

export interface Jerarquia {
  id: string;
  name: string;
  area: string;
}

export interface Labor {
  id: string;
  cuil: null;
  fechaAlta: null;
  categoryArca: null;
  antiguedad: null;
  tipoDeContrato: string;
  horasTrabajo: null;
  sueldo: null;
  relacionLaboral: "Periodo de Prueba" | "Contratado";
  fechaIngreso: Date;
  puestos?: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface SucursalHogar {
  lan: number;
  lng: number;
  direction: string;
  id: string;
  name: string;
}

//generico y zonas
export interface GeoGeneric {
  id: string;
  name: string;
}

export interface Pais extends GeoGeneric {}

export interface Provincia extends GeoGeneric {}

export interface Zona extends GeoGeneric {
  Coords?: string[];
  pais?: Pais;
  provincia?: Provincia[];
  active: boolean;
}

//para context
export interface UserAdapted {
  id: string;
  email: string;
  fullName: string;
  password: string;
  roles: Role[];
  zona: string;
  area: string;
  puesto: string;
  fechaIngreso: string;
  fechaNacimiento: string;
  createAt: string;
  direccion: string;
  telefono: string;
  relacionLaboral: string;
  tipoContrato: string;
  photoURL: string;
  certificacionesTitulo: string;
  sucursalHogar: string;
  activo: boolean;
  notificaciones: {
    mail: boolean;
    push: boolean;
  };
  laborId?: string;
}

export interface Order {
  id: string;
  title: string;
  description: string;
  status: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA" | "CANCELADA";
  priority: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  assignedTo: string;
  assignedBy: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  forms: FormField[];
  attachments: Attachment[];
  signature?: string;
  notes: string[];
}

export interface FormField {
  id: string;
  type:
    | "text"
    | "number"
    | "email"
    | "tel"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file";
  label: string;
  value: any;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

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

// Interfaz para novedades
export interface Novedad {
  id: string;
  titulo: string;
  fecha: string;
  descripcion: string;
  icono: string;
  reacciones: {
    like: number;
    love: number;
    seen: number;
  };
  rolesDestinatarios: string[]; // ej: ['rrhh', 'admin', 'tecnico']
  pin?: boolean; // para fijar arriba
}

// Tipos para la agenda de trabajo
export type AgendaView = "day" | "week" | "month" | "list";
export type AgendaEventType =
  | "meeting"
  | "task"
  | "deadline"
  | "training"
  | "reminder";

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  type: AgendaEventType;
  location?: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  createdBy: string;
  status: "pending" | "confirmed" | "completed";
  priority: "low" | "medium" | "high";
  relatedOrder?: string;
  recurrence: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | null;
  color: string;
}

// Interfaces para el organigrama
export interface Employee {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  puesto: string;
  area: string;
  supervisor?: string;
  fechaIngreso: string;
  activo: boolean;
  avatar?: string;
  children?: Employee[];
}

export interface VacantPosition {
  id: string;
  puesto: string;
  area: string;
  supervisor?: string;
  isVacant: true;
}

import { PhoneForm } from "@/api/apiTel";

//USUARIOS
export interface UserAdapted {
  id: number;
  email: string;
  fullName: string;
  roles: Role[];
  zona: {
    name: string;
    id: string;
  };
  jerarquia?: Jerarquia;
  fechaNacimiento: string;
  createdAt: string;
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
  fechaIngreso: Date | string;
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

export interface SucursalHogar {
  lan?: number;
  lng?: number;
  address?: string;
  id?: string;
  name: string;
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

//FORMULARIOS
export interface PlanTasks {
  id?: string;
  name: string;
  description: string;
}

export interface Task {
  id?: string;
  code: string;
  priority: "alta" | "media" | "baja"; // si hay más, agregalos
  duration: {
    horas: number;
    minutos: number;
  };
  paro?: {
    horas: number;
    minutos: number;
  };
  Activator: Activador[];
  subtasks: Subtasks[];
  ptId?: string; // UUID
}

export interface Subtasks {
  description: string;
  type?: any; //editar
  options: {
    title: string;
    depends: Subtasks[];
  }[];
  group: string;
  required: boolean;
  FilesRequired: boolean;
};

export interface Activador {
  cadencia: number;
  repition: number;
  lastRepitionDay: string; // formato ISO: "YYYY-MM-DDTHH:mm:ssZ"
  frecuencia: "day" | "week" | "month" | string;
  repiter: number;
  repiterCount: number;
  fijo: boolean;
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, 
  Search, 
  Filter, 
  Building, 
  Home, 
  Layers, 
  X,
  RefreshCw,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MapaSucursales } from '@/components/panoramica/MapaSucursales';
import { SucursalPanel } from '@/components/panoramica/SucursalPanel';
import { FiltrosPanoramica } from '@/components/panoramica/FiltrosPanoramica';
import { cn } from '@/utils/cn';

// Tipos
export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  tipo: 'cliente' | 'hogar';
  estado: 'activo' | 'inactivo';
  coordenadas: {
    lat: number;
    lng: number;
  };
  cliente?: string;
  telefono?: string;
  email?: string;
  horario?: string;
  responsable?: string;
  ultimaVisita?: string;
  proximaVisita?: string;
  equipos?: Equipo[];
  mantenimientos?: Mantenimiento[];
}

export interface Equipo {
  id: string;
  tipo: string;
  marca: string;
  modelo: string;
  estado: 'activo' | 'en_reparacion' | 'dado_de_baja';
  qrCode: string;
  fechaInstalacion: string;
  ultimoMantenimiento?: string;
  proximoMantenimiento?: string;
  ubicacionExacta?: string;
}

export interface Mantenimiento {
  id: string;
  fecha: string;
  tipo: 'preventivo' | 'correctivo' | 'instalacion';
  tecnico: string;
  duracion: number; // en minutos
  observaciones?: string;
}

export interface FiltrosSucursales {
  tipo?: 'cliente' | 'hogar' | '';
  estado?: 'activo' | 'inactivo' | '';
  cliente?: string;
  busqueda?: string;
}

// Mock data
const mockSucursales: Sucursal[] = [
  // Sedes de HogarApp
  {
    id: 'suc-001',
    nombre: 'Sede Central HogarApp',
    direccion: 'Av. Libertador 1234, CABA',
    tipo: 'hogar',
    estado: 'activo',
    coordenadas: {
      lat: -34.5829,
      lng: -58.4268
    },
    telefono: '+54 11 4567-8901',
    email: 'central@hogarapp.com',
    horario: 'Lun-Vie: 9:00-18:00',
    responsable: 'Carlos Martínez',
    equipos: [
      {
        id: 'eq-001',
        tipo: 'Aire Acondicionado',
        marca: 'Samsung',
        modelo: 'AR24TXHQASINXEU',
        estado: 'activo',
        qrCode: 'QR-EQ-001',
        fechaInstalacion: '2022-03-15',
        ultimoMantenimiento: '2024-05-10',
        proximoMantenimiento: '2024-08-10',
        ubicacionExacta: 'Piso 3, Oficina Principal'
      },
      {
        id: 'eq-002',
        tipo: 'Caldera',
        marca: 'Bosch',
        modelo: 'Condens 7000W',
        estado: 'activo',
        qrCode: 'QR-EQ-002',
        fechaInstalacion: '2021-08-20',
        ultimoMantenimiento: '2024-04-15',
        proximoMantenimiento: '2024-10-15',
        ubicacionExacta: 'Planta Baja, Sala de Máquinas'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-001',
        fecha: '2024-05-10',
        tipo: 'preventivo',
        tecnico: 'Juan Pérez',
        duracion: 120,
        observaciones: 'Limpieza de filtros y revisión general'
      },
      {
        id: 'OT-2024-002',
        fecha: '2024-04-15',
        tipo: 'preventivo',
        tecnico: 'María González',
        duracion: 90,
        observaciones: 'Revisión de presión y funcionamiento'
      },
      {
        id: 'OT-2024-003',
        fecha: '2024-03-20',
        tipo: 'correctivo',
        tecnico: 'Juan Pérez',
        duracion: 180,
        observaciones: 'Reparación de fuga en sistema de refrigeración'
      }
    ]
  },
  {
    id: 'suc-002',
    nombre: 'Sucursal Norte HogarApp',
    direccion: 'Av. Cabildo 2500, CABA',
    tipo: 'hogar',
    estado: 'activo',
    coordenadas: {
      lat: -34.5480,
      lng: -58.4618
    },
    telefono: '+54 11 4789-0123',
    email: 'norte@hogarapp.com',
    horario: 'Lun-Vie: 9:00-18:00',
    responsable: 'María González',
    equipos: [
      {
        id: 'eq-003',
        tipo: 'Aire Acondicionado',
        marca: 'LG',
        modelo: 'Inverter 24000 BTU',
        estado: 'activo',
        qrCode: 'QR-EQ-003',
        fechaInstalacion: '2022-05-10',
        ultimoMantenimiento: '2024-04-20',
        proximoMantenimiento: '2024-07-20',
        ubicacionExacta: 'Piso 2, Sala de Reuniones'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-004',
        fecha: '2024-04-20',
        tipo: 'preventivo',
        tecnico: 'Carlos Rodríguez',
        duracion: 90,
        observaciones: 'Limpieza general y revisión de sistema'
      }
    ]
  },
  {
    id: 'suc-006',
    nombre: 'Sucursal Sur HogarApp',
    direccion: 'Av. Hipólito Yrigoyen 8175, Lomas de Zamora',
    tipo: 'hogar',
    estado: 'activo',
    coordenadas: {
      lat: -34.7612,
      lng: -58.4048
    },
    telefono: '+54 11 4292-5678',
    email: 'sur@hogarapp.com',
    horario: 'Lun-Vie: 9:00-18:00',
    responsable: 'Roberto Gómez',
    equipos: [
      {
        id: 'eq-010',
        tipo: 'Aire Acondicionado',
        marca: 'Carrier',
        modelo: 'X-Power Inverter',
        estado: 'activo',
        qrCode: 'QR-EQ-010',
        fechaInstalacion: '2023-02-15',
        ultimoMantenimiento: '2024-05-05',
        proximoMantenimiento: '2024-08-05',
        ubicacionExacta: 'Piso 1, Oficina Principal'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-010',
        fecha: '2024-05-05',
        tipo: 'preventivo',
        tecnico: 'Ana López',
        duracion: 90,
        observaciones: 'Mantenimiento trimestral programado'
      }
    ]
  },
  {
    id: 'suc-007',
    nombre: 'Sucursal Oeste HogarApp',
    direccion: 'Av. Rivadavia 14500, Ramos Mejía',
    tipo: 'hogar',
    estado: 'activo',
    coordenadas: {
      lat: -34.6539,
      lng: -58.5623
    },
    telefono: '+54 11 4654-9012',
    email: 'oeste@hogarapp.com',
    horario: 'Lun-Vie: 9:00-18:00',
    responsable: 'Laura Sánchez',
    equipos: [
      {
        id: 'eq-011',
        tipo: 'Sistema de Ventilación',
        marca: 'Soler & Palau',
        modelo: 'CRHT/4-315',
        estado: 'activo',
        qrCode: 'QR-EQ-011',
        fechaInstalacion: '2023-03-10',
        ultimoMantenimiento: '2024-04-10',
        proximoMantenimiento: '2024-07-10',
        ubicacionExacta: 'Planta Baja, Área Común'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-011',
        fecha: '2024-04-10',
        tipo: 'preventivo',
        tecnico: 'Pedro Martín',
        duracion: 75,
        observaciones: 'Limpieza de filtros y revisión general'
      }
    ]
  },
  {
    id: 'suc-008',
    nombre: 'Oficina Córdoba HogarApp',
    direccion: 'Av. Colón 1234, Córdoba',
    tipo: 'hogar',
    estado: 'activo',
    coordenadas: {
      lat: -31.4135,
      lng: -64.1811
    },
    telefono: '+54 351 423-4567',
    email: 'cordoba@hogarapp.com',
    horario: 'Lun-Vie: 9:00-18:00',
    responsable: 'Javier Rodríguez',
    equipos: [
      {
        id: 'eq-012',
        tipo: 'Aire Acondicionado',
        marca: 'Daikin',
        modelo: 'FTXS35K',
        estado: 'activo',
        qrCode: 'QR-EQ-012',
        fechaInstalacion: '2023-01-20',
        ultimoMantenimiento: '2024-03-15',
        proximoMantenimiento: '2024-06-15',
        ubicacionExacta: 'Piso 2, Oficina Principal'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-012',
        fecha: '2024-03-15',
        tipo: 'preventivo',
        tecnico: 'Martín Gómez',
        duracion: 100,
        observaciones: 'Mantenimiento trimestral programado'
      }
    ]
  },
  {
    id: 'suc-009',
    nombre: 'Oficina Rosario HogarApp',
    direccion: 'Av. Pellegrini 1500, Rosario',
    tipo: 'hogar',
    estado: 'activo',
    coordenadas: {
      lat: -32.9468,
      lng: -60.6393
    },
    telefono: '+54 341 425-6789',
    email: 'rosario@hogarapp.com',
    horario: 'Lun-Vie: 9:00-18:00',
    responsable: 'Valeria Torres',
    equipos: [
      {
        id: 'eq-013',
        tipo: 'Aire Acondicionado',
        marca: 'Hitachi',
        modelo: 'Summit 3300',
        estado: 'activo',
        qrCode: 'QR-EQ-013',
        fechaInstalacion: '2023-02-05',
        ultimoMantenimiento: '2024-04-05',
        proximoMantenimiento: '2024-07-05',
        ubicacionExacta: 'Piso 1, Sala Principal'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-013',
        fecha: '2024-04-05',
        tipo: 'preventivo',
        tecnico: 'Lucía Fernández',
        duracion: 85,
        observaciones: 'Limpieza general y revisión de sistema'
      }
    ]
  },
  
  // Sucursales de clientes existentes
  {
    id: 'suc-003',
    nombre: 'Empresa ABC S.A.',
    direccion: 'Av. Corrientes 1234, CABA',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -34.6037,
      lng: -58.3816
    },
    cliente: 'Empresa ABC S.A.',
    telefono: '+54 11 5678-9012',
    email: 'contacto@empresaabc.com',
    responsable: 'Pedro Martínez',
    ultimaVisita: '2024-05-15',
    proximaVisita: '2024-08-15',
    equipos: [
      {
        id: 'eq-004',
        tipo: 'Aire Acondicionado',
        marca: 'Carrier',
        modelo: 'X-Power Inverter',
        estado: 'activo',
        qrCode: 'QR-EQ-004',
        fechaInstalacion: '2023-01-10',
        ultimoMantenimiento: '2024-05-15',
        proximoMantenimiento: '2024-11-15',
        ubicacionExacta: 'Piso 5, Oficina Gerencia'
      },
      {
        id: 'eq-005',
        tipo: 'Sistema de Ventilación',
        marca: 'Soler & Palau',
        modelo: 'CRHT/4-315',
        estado: 'en_reparacion',
        qrCode: 'QR-EQ-005',
        fechaInstalacion: '2023-01-10',
        ultimoMantenimiento: '2024-05-15',
        proximoMantenimiento: '2024-06-30',
        ubicacionExacta: 'Cocina principal'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-005',
        fecha: '2024-05-15',
        tipo: 'preventivo',
        tecnico: 'Juan Pérez',
        duracion: 150,
        observaciones: 'Mantenimiento general programado'
      },
      {
        id: 'OT-2024-006',
        fecha: '2024-05-15',
        tipo: 'correctivo',
        tecnico: 'Ana López',
        duracion: 210,
        observaciones: 'Reparación de motor en sistema de ventilación'
      }
    ]
  },
  {
    id: 'suc-004',
    nombre: 'Hospital Central',
    direccion: 'Av. 9 de Julio 890, CABA',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -34.6118,
      lng: -58.3960
    },
    cliente: 'Hospital Central',
    telefono: '+54 11 6789-0123',
    email: 'mantenimiento@hospitalcentral.org',
    responsable: 'Laura Sánchez',
    ultimaVisita: '2024-05-20',
    proximaVisita: '2024-06-20',
    equipos: [
      {
        id: 'eq-006',
        tipo: 'Sistema de Climatización',
        marca: 'Daikin',
        modelo: 'VRV IV',
        estado: 'activo',
        qrCode: 'QR-EQ-006',
        fechaInstalacion: '2022-11-05',
        ultimoMantenimiento: '2024-05-20',
        proximoMantenimiento: '2024-06-20',
        ubicacionExacta: 'Área de Quirófanos'
      },
      {
        id: 'eq-007',
        tipo: 'Aire Acondicionado',
        marca: 'Toshiba',
        modelo: 'RAV-SM1104ATP-E',
        estado: 'activo',
        qrCode: 'QR-EQ-007',
        fechaInstalacion: '2022-11-05',
        ultimoMantenimiento: '2024-05-20',
        proximoMantenimiento: '2024-06-20',
        ubicacionExacta: 'Sala de Espera Principal'
      },
      {
        id: 'eq-008',
        tipo: 'Caldera',
        marca: 'Viessmann',
        modelo: 'Vitocrossal 300',
        estado: 'dado_de_baja',
        qrCode: 'QR-EQ-008',
        fechaInstalacion: '2020-06-12',
        ultimoMantenimiento: '2023-12-10',
        proximoMantenimiento: '',
        ubicacionExacta: 'Subsuelo, Sala de Calderas'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-007',
        fecha: '2024-05-20',
        tipo: 'preventivo',
        tecnico: 'Carlos Rodríguez',
        duracion: 240,
        observaciones: 'Mantenimiento trimestral programado'
      },
      {
        id: 'OT-2024-008',
        fecha: '2024-02-15',
        tipo: 'correctivo',
        tecnico: 'Juan Pérez',
        duracion: 180,
        observaciones: 'Reparación de fuga en sistema de refrigeración'
      }
    ]
  },
  {
    id: 'suc-005',
    nombre: 'Centro Comercial Plaza Sur',
    direccion: 'Av. del Trabajo 456, Lanús',
    tipo: 'cliente',
    estado: 'inactivo',
    coordenadas: {
      lat: -34.7022,
      lng: -58.3913
    },
    cliente: 'Centro Comercial Plaza Sur',
    telefono: '+54 11 7890-1234',
    email: 'mantenimiento@plazasur.com',
    responsable: 'Roberto Gómez',
    ultimaVisita: '2023-12-10',
    proximaVisita: '',
    equipos: [
      {
        id: 'eq-009',
        tipo: 'Tablero Eléctrico',
        marca: 'Schneider Electric',
        modelo: 'Prisma Plus P',
        estado: 'dado_de_baja',
        qrCode: 'QR-EQ-009',
        fechaInstalacion: '2019-06-12',
        ultimoMantenimiento: '2023-12-10',
        proximoMantenimiento: '',
        ubicacionExacta: 'Planta Baja, Sala Técnica'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2023-009',
        fecha: '2023-12-10',
        tipo: 'preventivo',
        tecnico: 'Pedro Martín',
        duracion: 120,
        observaciones: 'Último mantenimiento antes de finalización de contrato'
      }
    ]
  },
  
  // Sucursales de Banco Santander Rio
  {
    id: 'suc-010',
    nombre: 'Santander Rio - Casa Central',
    direccion: 'Av. Juan de Garay 151, CABA',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -34.6235,
      lng: -58.3772
    },
    cliente: 'Banco Santander Rio',
    telefono: '+54 11 4341-1000',
    email: 'mantenimiento.central@santander.com.ar',
    responsable: 'Martín Gutiérrez',
    ultimaVisita: '2024-05-25',
    proximaVisita: '2024-06-25',
    equipos: [
      {
        id: 'eq-014',
        tipo: 'Sistema de Climatización Central',
        marca: 'Trane',
        modelo: 'Series R',
        estado: 'activo',
        qrCode: 'QR-EQ-014',
        fechaInstalacion: '2021-05-10',
        ultimoMantenimiento: '2024-05-25',
        proximoMantenimiento: '2024-06-25',
        ubicacionExacta: 'Terraza, Sector Norte'
      },
      {
        id: 'eq-015',
        tipo: 'UPS',
        marca: 'APC',
        modelo: 'Symmetra PX',
        estado: 'activo',
        qrCode: 'QR-EQ-015',
        fechaInstalacion: '2022-01-15',
        ultimoMantenimiento: '2024-05-25',
        proximoMantenimiento: '2024-06-25',
        ubicacionExacta: 'Subsuelo, Sala de Servidores'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-014',
        fecha: '2024-05-25',
        tipo: 'preventivo',
        tecnico: 'Carlos Rodríguez',
        duracion: 300,
        observaciones: 'Mantenimiento mensual programado'
      },
      {
        id: 'OT-2024-015',
        fecha: '2024-04-25',
        tipo: 'preventivo',
        tecnico: 'Juan Pérez',
        duracion: 280,
        observaciones: 'Mantenimiento mensual programado'
      }
    ]
  },
  {
    id: 'suc-011',
    nombre: 'Santander Rio - Microcentro',
    direccion: 'Florida 183, CABA',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -34.6052,
      lng: -58.3752
    },
    cliente: 'Banco Santander Rio',
    telefono: '+54 11 4321-2000',
    email: 'mantenimiento.microcentro@santander.com.ar',
    responsable: 'Carolina Méndez',
    ultimaVisita: '2024-05-18',
    proximaVisita: '2024-06-18',
    equipos: [
      {
        id: 'eq-016',
        tipo: 'Aire Acondicionado',
        marca: 'Mitsubishi Electric',
        modelo: 'PUHY-P250YNW-A',
        estado: 'activo',
        qrCode: 'QR-EQ-016',
        fechaInstalacion: '2022-03-20',
        ultimoMantenimiento: '2024-05-18',
        proximoMantenimiento: '2024-06-18',
        ubicacionExacta: 'Piso 1, Área de Cajas'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-016',
        fecha: '2024-05-18',
        tipo: 'preventivo',
        tecnico: 'Ana López',
        duracion: 150,
        observaciones: 'Mantenimiento mensual programado'
      }
    ]
  },
  {
    id: 'suc-012',
    nombre: 'Santander Rio - Belgrano',
    direccion: 'Av. Cabildo 2042, CABA',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -34.5617,
      lng: -58.4583
    },
    cliente: 'Banco Santander Rio',
    telefono: '+54 11 4789-3000',
    email: 'mantenimiento.belgrano@santander.com.ar',
    responsable: 'Diego Fernández',
    ultimaVisita: '2024-05-22',
    proximaVisita: '2024-06-22',
    equipos: [
      {
        id: 'eq-017',
        tipo: 'Aire Acondicionado',
        marca: 'Daikin',
        modelo: 'FXFQ50AVEB',
        estado: 'activo',
        qrCode: 'QR-EQ-017',
        fechaInstalacion: '2022-04-15',
        ultimoMantenimiento: '2024-05-22',
        proximoMantenimiento: '2024-06-22',
        ubicacionExacta: 'Planta Baja, Área Comercial'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-017',
        fecha: '2024-05-22',
        tipo: 'preventivo',
        tecnico: 'Pedro Martín',
        duracion: 140,
        observaciones: 'Mantenimiento mensual programado'
      }
    ]
  },
  {
    id: 'suc-013',
    nombre: 'Santander Rio - Córdoba Centro',
    direccion: 'Av. Colón 350, Córdoba',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -31.4173,
      lng: -64.1873
    },
    cliente: 'Banco Santander Rio',
    telefono: '+54 351 426-4000',
    email: 'mantenimiento.cordoba@santander.com.ar',
    responsable: 'Luciana Pereyra',
    ultimaVisita: '2024-05-20',
    proximaVisita: '2024-06-20',
    equipos: [
      {
        id: 'eq-018',
        tipo: 'Sistema de Climatización',
        marca: 'Carrier',
        modelo: 'AquaSnap 30RB',
        estado: 'activo',
        qrCode: 'QR-EQ-018',
        fechaInstalacion: '2022-02-10',
        ultimoMantenimiento: '2024-05-20',
        proximoMantenimiento: '2024-06-20',
        ubicacionExacta: 'Terraza, Sector Central'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-018',
        fecha: '2024-05-20',
        tipo: 'preventivo',
        tecnico: 'Martín Gómez',
        duracion: 180,
        observaciones: 'Mantenimiento mensual programado'
      }
    ]
  },
  {
    id: 'suc-014',
    nombre: 'Santander Rio - Rosario',
    direccion: 'Córdoba 1402, Rosario',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -32.9442,
      lng: -60.6505
    },
    cliente: 'Banco Santander Rio',
    telefono: '+54 341 420-5000',
    email: 'mantenimiento.rosario@santander.com.ar',
    responsable: 'Sebastián Molina',
    ultimaVisita: '2024-05-15',
    proximaVisita: '2024-06-15',
    equipos: [
      {
        id: 'eq-019',
        tipo: 'Aire Acondicionado',
        marca: 'York',
        modelo: 'YLAA',
        estado: 'activo',
        qrCode: 'QR-EQ-019',
        fechaInstalacion: '2022-05-05',
        ultimoMantenimiento: '2024-05-15',
        proximoMantenimiento: '2024-06-15',
        ubicacionExacta: 'Piso 1, Área Comercial'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-019',
        fecha: '2024-05-15',
        tipo: 'preventivo',
        tecnico: 'Lucía Fernández',
        duracion: 160,
        observaciones: 'Mantenimiento mensual programado'
      }
    ]
  },
  {
    id: 'suc-015',
    nombre: 'Santander Rio - Mendoza',
    direccion: 'Av. San Martín 1245, Mendoza',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -32.8908,
      lng: -68.8272
    },
    cliente: 'Banco Santander Rio',
    telefono: '+54 261 423-6000',
    email: 'mantenimiento.mendoza@santander.com.ar',
    responsable: 'Gonzalo Pérez',
    ultimaVisita: '2024-05-12',
    proximaVisita: '2024-06-12',
    equipos: [
      {
        id: 'eq-020',
        tipo: 'Sistema de Climatización',
        marca: 'Hitachi',
        modelo: 'Set Free Sigma',
        estado: 'activo',
        qrCode: 'QR-EQ-020',
        fechaInstalacion: '2022-06-15',
        ultimoMantenimiento: '2024-05-12',
        proximoMantenimiento: '2024-06-12',
        ubicacionExacta: 'Terraza, Sector Este'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-020',
        fecha: '2024-05-12',
        tipo: 'preventivo',
        tecnico: 'Ricardo Sosa',
        duracion: 170,
        observaciones: 'Mantenimiento mensual programado'
      }
    ]
  },
  {
    id: 'suc-016',
    nombre: 'Santander Rio - Mar del Plata',
    direccion: 'Av. Luro 2550, Mar del Plata',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -38.0033,
      lng: -57.5528
    },
    cliente: 'Banco Santander Rio',
    telefono: '+54 223 495-7000',
    email: 'mantenimiento.mdp@santander.com.ar',
    responsable: 'Valeria Rojas',
    ultimaVisita: '2024-05-08',
    proximaVisita: '2024-06-08',
    equipos: [
      {
        id: 'eq-021',
        tipo: 'Aire Acondicionado',
        marca: 'Toshiba',
        modelo: 'RAV-SM1104ATP-E',
        estado: 'en_reparacion',
        qrCode: 'QR-EQ-021',
        fechaInstalacion: '2022-07-20',
        ultimoMantenimiento: '2024-05-08',
        proximoMantenimiento: '2024-06-08',
        ubicacionExacta: 'Planta Baja, Área de Cajas'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-021',
        fecha: '2024-05-08',
        tipo: 'correctivo',
        tecnico: 'Martín López',
        duracion: 210,
        observaciones: 'Reparación de compresor con falla'
      }
    ]
  },
  {
    id: 'suc-017',
    nombre: 'Santander Rio - Tucumán',
    direccion: 'San Martín 690, San Miguel de Tucumán',
    tipo: 'cliente',
    estado: 'activo',
    coordenadas: {
      lat: -26.8241,
      lng: -65.2226
    },
    cliente: 'Banco Santander Rio',
    telefono: '+54 381 450-8000',
    email: 'mantenimiento.tucuman@santander.com.ar',
    responsable: 'Fernando Díaz',
    ultimaVisita: '2024-05-05',
    proximaVisita: '2024-06-05',
    equipos: [
      {
        id: 'eq-022',
        tipo: 'Sistema de Climatización',
        marca: 'Daikin',
        modelo: 'VRV IV',
        estado: 'activo',
        qrCode: 'QR-EQ-022',
        fechaInstalacion: '2022-08-10',
        ultimoMantenimiento: '2024-05-05',
        proximoMantenimiento: '2024-06-05',
        ubicacionExacta: 'Terraza, Sector Central'
      }
    ],
    mantenimientos: [
      {
        id: 'OT-2024-022',
        fecha: '2024-05-05',
        tipo: 'preventivo',
        tecnico: 'Javier Morales',
        duracion: 190,
        observaciones: 'Mantenimiento mensual programado'
      }
    ]
  }
];

// Función para obtener datos de sucursales
const fetchSucursales = async (): Promise<Sucursal[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockSucursales;
};

function PanoramicaContent() {
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosSucursales>({
    tipo: '',
    estado: '',
    cliente: '',
    busqueda: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: sucursales, isLoading } = useQuery({
    queryKey: ['sucursales-panoramica'],
    queryFn: fetchSucursales,
  });

  const handleSelectSucursal = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleFiltroChange = (key: keyof FiltrosSucursales, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFiltros = () => {
    setFiltros({
      tipo: '',
      estado: '',
      cliente: '',
      busqueda: ''
    });
  };

  // Filtrar sucursales según los filtros aplicados
  const filteredSucursales = sucursales?.filter(sucursal => {
    const matchesTipo = !filtros.tipo || sucursal.tipo === filtros.tipo;
    const matchesEstado = !filtros.estado || sucursal.estado === filtros.estado;
    const matchesCliente = !filtros.cliente || sucursal.cliente === filtros.cliente;
    const matchesBusqueda = !filtros.busqueda || 
      sucursal.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      sucursal.direccion.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    return matchesTipo && matchesEstado && matchesCliente && matchesBusqueda;
  }) || [];

  // Obtener lista única de clientes para el filtro
  const clientesUnicos = sucursales
    ? Array.from(new Set(sucursales.filter(s => s.cliente).map(s => s.cliente)))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🗺️ Mapa Panorámico de Sucursales</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualiza todas las sucursales y equipos en un mapa interactivo
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <Filter size={16} />
          <span>Filtros</span>
        </button>
      </div>

      {/* Filtros - Responsive */}
      <div className={cn(
        "md:block",
        showFilters ? "block" : "hidden"
      )}>
        <FiltrosPanoramica 
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onResetFiltros={handleResetFiltros}
          clientes={clientesUnicos as string[]}
        />
      </div>

      {/* Mapa y Panel */}
      <div className="relative">
        {/* Mapa */}
        <div className={cn(
          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300",
          isPanelOpen ? "lg:mr-80" : ""
        )}>
          <div className="h-[calc(100vh-240px)] min-h-[500px]">
            {/* {isLoading ? ( */}
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando mapa y sucursales...</p>
                </div>
              </div>
            {/* ) : (
              // <MapaSucursales 
              //   sucursales={filteredSucursales} 
              //   onSelect={handleSelectSucursal}
              //   selectedSucursalId={selectedSucursal?.id}
              // />
            )} */}
          </div>
        </div>

        {/* Panel lateral */}
        <div className={cn(
          "fixed top-[64px] bottom-0 right-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 transition-transform transform-gpu",
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {selectedSucursal && (
            <SucursalPanel 
              sucursal={selectedSucursal} 
              onClose={handleClosePanel} 
            />
          )}
        </div>

        {/* Botón para abrir/cerrar panel en móvil */}
        {isPanelOpen && (
          <button
            onClick={handleClosePanel}
            className="fixed top-1/2 right-80 transform -translate-y-1/2 -translate-x-6 z-50 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 lg:hidden"
          >
            <ChevronRight className="text-gray-600 dark:text-gray-400" size={20} />
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sucursales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredSucursales.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Building className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sucursales Activas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredSucursales.filter(s => s.estado === 'activo').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Building className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sucursales Inactivas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredSucursales.filter(s => s.estado === 'inactivo').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Building className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Equipos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredSucursales.reduce((total, sucursal) => total + (sucursal.equipos?.length || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Layers className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PanoramicaPage() {
  return (
    <ProtectedLayout>
      <PanoramicaContent />
    </ProtectedLayout>
  );
}
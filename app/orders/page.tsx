'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import { OrdersContent } from '@/components/ordenes-de-trabajo/OrdersContent';

export interface OrderTableData {
  id: string;
  estadoGestion: 'Procesando' | 'Completado' | 'Pendiente' | 'Cancelado';
  formulario: string;
  tecnico: string;
  comentario: string | null;
  sucursal: string;
  estado: 'Pendiente' | 'Me recibo' | 'Finalizado' | 'En proceso';
  fecha: string;
  horaInicio: string | null;
  horaFin: string | null;
  cliente: string;
  sucursalCliente: string;
}

// Mock data
export const mockOrders: OrderTableData[] = [
  {
    id: 'ORD-001',
    estadoGestion: 'Procesando',
    formulario: 'BSR-2021-SEMESTRAL',
    tecnico: 'Juan Carlos Pérez',
    comentario: 'Revisión completa del sistema eléctrico',
    sucursal: 'ZONA NOA',
    estado: 'Pendiente',
    fecha: '09/06/2025',
    horaInicio: '08:30',
    horaFin: null,
    cliente: 'Empresa Constructora\nSan Miguel S.A.',
    sucursalCliente: 'Av. Libertador 1234, CABA || Ruta 9 Km 45'
  },
  {
    id: 'ORD-002',
    estadoGestion: 'Completado',
    formulario: 'MNT-2024-TRIMESTRAL',
    tecnico: 'María González López',
    comentario: null,
    sucursal: 'ZONA CENTRO',
    estado: 'Finalizado',
    fecha: '08/06/2025',
    horaInicio: '09:00',
    horaFin: '17:30',
    cliente: 'Supermercados del Norte',
    sucursalCliente: 'Calle San Martín 567 || Acceso Norte'
  },
  {
    id: 'ORD-003',
    estadoGestion: 'Procesando',
    formulario: 'INS-2025-ANUAL',
    tecnico: 'Carlos Rodríguez',
    comentario: 'Instalación de nuevos equipos de climatización',
    sucursal: 'ZONA SUR',
    estado: 'Me recibo',
    fecha: '10/06/2025',
    horaInicio: '14:00',
    horaFin: null,
    cliente: 'Hospital Central\nDr. Ramón Carrillo',
    sucursalCliente: 'Av. 9 de Julio 890, Zona Sur || Ruta Provincial 11'
  },
  {
    id: 'ORD-004',
    estadoGestion: 'Pendiente',
    formulario: 'REP-2025-URGENTE',
    tecnico: 'Ana López Martínez',
    comentario: 'Reparación urgente de sistema de seguridad',
    sucursal: 'ZONA ESTE',
    estado: 'En proceso',
    fecha: '07/06/2025',
    horaInicio: '10:15',
    horaFin: '16:45',
    cliente: 'Banco Nacional',
    sucursalCliente: 'Plaza Central 123 || Autopista del Este Km 12'
  },
  {
    id: 'ORD-005',
    estadoGestion: 'Procesando',
    formulario: 'CHK-2025-MENSUAL',
    tecnico: 'Pedro Martín Silva',
    comentario: null,
    sucursal: 'ZONA OESTE',
    estado: 'Pendiente',
    fecha: '11/06/2025',
    horaInicio: null,
    horaFin: null,
    cliente: 'Centro Comercial\nLas Américas',
    sucursalCliente: 'Av. del Trabajo 456 || Ruta Nacional 7'
  }
];

export default function OrdersPage() {
  return (
    <ProtectedLayout>
      <OrdersContent />
    </ProtectedLayout>
  );
}
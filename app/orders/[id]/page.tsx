// Server Component - maneja generateStaticParams y fetch inicial
import { OrdenDetalleContent } from './orden-detalle-content';

// Generate static params for static export
export async function generateStaticParams() {
  // Return the available order IDs for static generation
  return [
    { id: 'ORD-001' },
    { id: 'ORD-002' },
    { id: 'ORD-003' }
  ];
}

export default function OrdenDetallePage() {
  return <OrdenDetalleContent />;
}
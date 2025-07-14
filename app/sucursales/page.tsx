'use client';

import { 
  Building2, 
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';

function SucursalesContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏢 Sucursales</h1>
          <p className="text-gray-600 mt-1">
            Gestión de sucursales físicas y puntos de atención
          </p>
        </div>
        
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus size={20} />
          <span>Nueva Sucursal</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Módulo en desarrollo</h3>
          <p className="mt-1 text-sm text-gray-500">
            La gestión de sucursales estará disponible próximamente
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SucursalesPage() {
  return (
    <ProtectedLayout>
      <SucursalesContent />
    </ProtectedLayout>
  );
}
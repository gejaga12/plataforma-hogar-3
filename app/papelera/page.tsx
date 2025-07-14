'use client';

import { 
  Trash2, 
  RotateCcw,
  X,
  Search,
  Filter
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';

function PapeleraContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗑️ Papelera</h1>
          <p className="text-gray-600 mt-1">
            Elementos eliminados que pueden ser recuperados
          </p>
        </div>
        
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <X size={20} />
          <span>Vaciar Papelera</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar elementos eliminados..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option value="">Todos los tipos</option>
              <option value="orders">Órdenes</option>
              <option value="users">Usuarios</option>
              <option value="documents">Documentos</option>
              <option value="forms">Formularios</option>
            </select>

            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Papelera vacía</h3>
          <p className="mt-1 text-sm text-gray-500">
            No hay elementos eliminados para mostrar
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PapeleraPage() {
  return (
    <ProtectedLayout>
      <PapeleraContent />
    </ProtectedLayout>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Download, 
  QrCode,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EquipoForm } from '@/components/equipos/equipo-form';
import { EquipoQR } from '@/components/equipos/equipo-qr';
import { cn } from '@/lib/utils';

interface Equipo {
  id: string;
  nombre: string;
  tipo: string;
  cliente: string;
  zona: string;
  ubicacionExacta: string;
  fechaInstalacion: string;
  vidaUtilAnios: number;
  ultimoMantenimiento: string;
  estado: 'Identificado' | 'No identificado';
  camposTecnicos: Record<string, any>;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockEquipos: Equipo[] = [
  {
    id: 'EQ-001',
    nombre: 'Aire Acondicionado Central - Oficina Principal',
    tipo: 'Aire Acondicionado',
    cliente: 'Empresa ABC S.A.',
    zona: 'CABA - Centro',
    ubicacionExacta: 'Piso 3, Oficina Principal, Sector Norte - Techo suspendido sobre escritorios',
    fechaInstalacion: '2022-03-15',
    vidaUtilAnios: 10,
    ultimoMantenimiento: '2024-11-15',
    estado: 'Identificado',
    camposTecnicos: {
      marca: 'Samsung',
      modelo: 'AR24TXHQASINXEU',
      potencia: '24000 BTU',
      refrigerante: 'R32'
    },
    qrCode: 'QR-EQ-001',
    createdAt: '2022-03-15T10:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z'
  },
  {
    id: 'EQ-002',
    nombre: 'Caldera Industrial - Planta Baja',
    tipo: 'Calefacción',
    cliente: 'Industrias XYZ Ltda.',
    zona: 'GBA - Norte',
    ubicacionExacta: 'Planta Baja, Sala de Máquinas, Sector Este - Junto a la pared principal',
    fechaInstalacion: '2021-08-20',
    vidaUtilAnios: 15,
    ultimoMantenimiento: '2024-10-22',
    estado: 'Identificado',
    camposTecnicos: {
      marca: 'Bosch',
      modelo: 'Condens 7000W',
      potencia: '35 kW',
      combustible: 'Gas Natural'
    },
    qrCode: 'QR-EQ-002',
    createdAt: '2021-08-20T09:15:00Z',
    updatedAt: '2024-10-22T11:45:00Z'
  },
  {
    id: 'EQ-003',
    nombre: 'Sistema de Ventilación - Cocina',
    tipo: 'Ventilación',
    cliente: 'Restaurante La Plaza',
    zona: 'CABA - Palermo',
    ubicacionExacta: 'Cocina principal, campana extractora sobre plancha y freidoras',
    fechaInstalacion: '2023-01-10',
    vidaUtilAnios: 8,
    ultimoMantenimiento: '2024-12-01',
    estado: 'No identificado',
    camposTecnicos: {
      marca: 'Soler & Palau',
      modelo: 'CRHT/4-315',
      caudal: '2800 m³/h',
      nivel_ruido: '52 dB'
    },
    qrCode: 'QR-EQ-003',
    createdAt: '2023-01-10T16:20:00Z',
    updatedAt: '2024-12-01T09:30:00Z'
  },
  {
    id: 'EQ-004',
    nombre: 'Bomba de Agua - Tanque Principal',
    tipo: 'Plomería',
    cliente: 'Edificio Residencial Torre Norte',
    zona: 'CABA - Belgrano',
    ubicacionExacta: 'Subsuelo, Sala de Bombas, Tanque de reserva principal',
    fechaInstalacion: '2020-11-05',
    vidaUtilAnios: 12,
    ultimoMantenimiento: '2024-09-18',
    estado: 'Identificado',
    camposTecnicos: {
      marca: 'Grundfos',
      modelo: 'CR 32-4',
      caudal: '32 m³/h',
      altura: '40 m'
    },
    qrCode: 'QR-EQ-004',
    createdAt: '2020-11-05T14:10:00Z',
    updatedAt: '2024-09-18T16:20:00Z'
  },
  {
    id: 'EQ-005',
    nombre: 'Tablero Eléctrico Principal',
    tipo: 'Eléctrico',
    cliente: 'Centro Comercial Plaza Sur',
    zona: 'GBA - Sur',
    ubicacionExacta: 'Planta Baja, Sala Técnica, Tablero General de Distribución',
    fechaInstalacion: '2019-06-12',
    vidaUtilAnios: 20,
    ultimoMantenimiento: '2024-08-30',
    estado: 'Identificado',
    camposTecnicos: {
      marca: 'Schneider Electric',
      modelo: 'Prisma Plus P',
      tension: '380V',
      corriente: '630A'
    },
    qrCode: 'QR-EQ-005',
    createdAt: '2019-06-12T11:30:00Z',
    updatedAt: '2024-08-30T13:15:00Z'
  }
];

const tiposEquipo = [
  'Aire Acondicionado',
  'Calefacción',
  'Ventilación',
  'Refrigeración',
  'Eléctrico',
  'Plomería',
  'Ascensores',
  'Seguridad',
  'Iluminación'
];

const clientes = [
  'Empresa ABC S.A.',
  'Industrias XYZ Ltda.',
  'Restaurante La Plaza',
  'Edificio Residencial Torre Norte',
  'Centro Comercial Plaza Sur',
  'Hospital Central',
  'Universidad Nacional',
  'Hotel Boutique'
];

const zonas = [
  'CABA - Centro',
  'CABA - Palermo',
  'CABA - Belgrano',
  'CABA - Recoleta',
  'GBA - Norte',
  'GBA - Sur',
  'GBA - Oeste',
  'Interior - Córdoba',
  'Interior - Rosario'
];

type SortField = 'nombre' | 'fechaInstalacion' | 'ultimoMantenimiento' | 'vidaUtilAnios';
type SortDirection = 'asc' | 'desc';

function EquiposContent() {
  const [equipos, setEquipos] = useState<Equipo[]>(mockEquipos);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');
  const [zonaFilter, setZonaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('fechaInstalacion');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedEquipos, setSelectedEquipos] = useState<string[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRGeneratorModal, setShowQRGeneratorModal] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<{ id: string; qrCode: string } | null>(null);
  const router = useRouter();

  const filteredEquipos = equipos.filter(equipo => {
    const matchesSearch = equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipo.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !tipoFilter || equipo.tipo === tipoFilter;
    const matchesCliente = !clienteFilter || equipo.cliente === clienteFilter;
    const matchesZona = !zonaFilter || equipo.zona === zonaFilter;
    const matchesEstado = !estadoFilter || equipo.estado === estadoFilter;
    
    return matchesSearch && matchesTipo && matchesCliente && matchesZona && matchesEstado;
  });

  const sortedEquipos = [...filteredEquipos].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'fechaInstalacion' || sortField === 'ultimoMantenimiento') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEquipos(sortedEquipos.map(equipo => equipo.id));
    } else {
      setSelectedEquipos([]);
    }
  };

  const handleSelectEquipo = (equipoId: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipos(prev => [...prev, equipoId]);
    } else {
      setSelectedEquipos(prev => prev.filter(id => id !== equipoId));
    }
  };

  const handleCreateEquipo = async (data: any) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEquipo: Equipo = {
        id: `EQ-${String(equipos.length + 1).padStart(3, '0')}`,
        ...data,
        qrCode: `QR-EQ-${String(equipos.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setEquipos(prev => [...prev, newEquipo]);
      setShowFormModal(false);
    } catch (error) {
      console.error('Error creating equipo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEquipo = async (data: any) => {
    if (!editingEquipo) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEquipos(prev => prev.map(equipo => 
        equipo.id === editingEquipo.id 
          ? { ...equipo, ...data, updatedAt: new Date().toISOString() }
          : equipo
      ));
      
      setShowFormModal(false);
      setEditingEquipo(null);
    } catch (error) {
      console.error('Error updating equipo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = (equipoId: string) => {
    router.push(`/equipos/${equipoId}`);
  };

  const handleEdit = (equipo: Equipo) => {
    setEditingEquipo(equipo);
    setShowFormModal(true);
  };

  const handleShowQR = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setShowQRModal(true);
  };

  const handleDownloadQR = (equipo: Equipo) => {
    // Simular descarga del QR
    console.log(`Descargando QR para equipo: ${equipo.nombre}`);
  };

  const handleGenerateQR = () => {
    // Generar un QR sin datos previos
    const newQRId = `QR-${Date.now()}`;
    const newQR = {
      id: newQRId,
      qrCode: newQRId
    };
    
    setGeneratedQR(newQR);
    setShowQRGeneratorModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getEstadoColor = (estado: string) => {
    return estado === 'Identificado' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'Aire Acondicionado': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Calefacción': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Ventilación': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Refrigeración': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      'Eléctrico': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Plomería': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔧 Gestión de Equipos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra y da seguimiento a todos los equipos instalados
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={handleGenerateQR}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <QrCode size={20} />
            <span>Generar QR</span>
          </button>
          
          <button 
            onClick={() => {
              setEditingEquipo(null);
              setShowFormModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Equipo</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar equipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los tipos</option>
              {tiposEquipo.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente} value={cliente}>{cliente}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={zonaFilter}
              onChange={(e) => setZonaFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas las zonas</option>
              {zonas.map(zona => (
                <option key={zona} value={zona}>{zona}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value="Identificado">Identificado</option>
              <option value="No identificado">No identificado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEquipos.length === sortedEquipos.length && sortedEquipos.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  QR
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="nombre">Nombre</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ubicación exacta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="ultimoMantenimiento">Último mantenimiento</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortButton field="vidaUtilAnios">Vida útil</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedEquipos.map((equipo, index) => (
                <tr 
                  key={equipo.id} 
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    selectedEquipos.includes(equipo.id) && 'bg-orange-50 dark:bg-orange-900/20',
                    index % 2 === 1 && 'bg-gray-25 dark:bg-gray-800/50'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEquipos.includes(equipo.id)}
                      onChange={(e) => handleSelectEquipo(equipo.id, e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetail(equipo.id)}
                      className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Ver detalle del equipo"
                    >
                      <QrCode size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-48 truncate" title={equipo.nombre}>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{equipo.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getTipoColor(equipo.tipo)
                    )}>
                      {equipo.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {equipo.zona}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-48 truncate" title={equipo.ubicacionExacta}>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{equipo.ubicacionExacta}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(equipo.ultimoMantenimiento)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {equipo.vidaUtilAnios} años
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getEstadoColor(equipo.estado)
                    )}>
                      {equipo.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(equipo.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(equipo)}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDownloadQR(equipo)}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                        title="Descargar QR"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedEquipos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <MoreHorizontal className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No hay equipos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || tipoFilter || clienteFilter || zonaFilter || estadoFilter
                ? 'No se encontraron equipos con los filtros aplicados.'
                : 'Comienza agregando un nuevo equipo.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedEquipos.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span className="font-medium">{sortedEquipos.length}</span> equipos
            {selectedEquipos.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedEquipos.length}</span> seleccionados)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Página 1 de 1
          </div>
        </div>
      )}

      {/* Modals */}
      {showFormModal && (
        <EquipoForm
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingEquipo(null);
          }}
          onSubmit={editingEquipo ? handleEditEquipo : handleCreateEquipo}
          equipo={editingEquipo}
          isLoading={isLoading}
          tiposEquipo={tiposEquipo}
          clientes={clientes}
          zonas={zonas}
        />
      )}

      {showQRModal && selectedEquipo && (
        <EquipoQR
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedEquipo(null);
          }}
          equipo={selectedEquipo}
        />
      )}

      {/* Modal para QR generado sin datos */}
      {showQRGeneratorModal && generatedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  QR Generado
                </h2>
                <button
                  onClick={() => setShowQRGeneratorModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 inline-block">
                  <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {generatedQR.qrCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                  Instrucciones:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Imprime este código QR y pégalo en el equipo</li>
                  <li>• Escanea el código con la app móvil para cargar los datos</li>
                  <li>• El equipo quedará vinculado a este código único</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    console.log('Descargando QR:', generatedQR.qrCode);
                    // Aquí implementarías la descarga del QR
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download size={16} />
                  <span>Descargar</span>
                </button>
                
                <button
                  onClick={() => {
                    console.log('Imprimiendo QR:', generatedQR.qrCode);
                    window.print();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <QrCode size={16} />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EquiposPage() {
  return (
    <ProtectedLayout>
      <EquiposContent />
    </ProtectedLayout>
  );
}
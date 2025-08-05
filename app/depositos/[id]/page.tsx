'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, 
  Eye,
  Mail,
  Phone,
  Building2,
  Package,
  User,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  QrCode,
  Camera,
  Tag,
  Clock,
  ArrowRight,
  ArrowLeft,
  ArrowLeftIcon,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart2,
  History,
  Layers
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/utils/cn';
import Link from 'next/link';

// Interfaces
interface Deposito {
  id: string;
  nombre: string;
  ubicacion: string;
  responsable: string;
  capacidad: number;
  capacidadUtilizada: number;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  cantidadItems: number;
  createdAt: string;
  updatedAt: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
}

interface Atributo {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'seleccion' | 'booleano';
  opciones?: string[];
  requerido: boolean;
}

interface Item {
  id: string;
  nombre: string;
  descripcion: string;
  qrCode: string;
  estado: 'disponible' | 'asignado' | 'en_mantenimiento' | 'baja';
  categoria: string;
  ubicacionInterna: string;
  fechaIngreso: string;
  fechaUltimoMovimiento?: string;
  atributos: Record<string, any>;
  imagenes: string[];
  historial: HistorialMovimiento[];
}

interface HistorialMovimiento {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'salida' | 'traslado' | 'mantenimiento' | 'baja';
  usuario: string;
  ubicacionOrigen?: string;
  ubicacionDestino?: string;
  observaciones?: string;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  atributos: string[]; // IDs de atributos
}

// Mock data
const mockDeposito: Deposito = {
  id: 'DEP-001',
  nombre: 'Depósito Central',
  ubicacion: 'Av. Libertador 1234, CABA',
  responsable: 'Juan Pérez',
  capacidad: 1000,
  capacidadUtilizada: 750,
  estado: 'activo',
  cantidadItems: 450,
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2024-05-15T14:30:00Z',
  descripcion: 'Depósito principal para almacenamiento de equipos y repuestos de climatización.',
  telefono: '+54 11 4567-8901',
  email: 'deposito.central@hogarapp.com'
};

const mockAtributos: Atributo[] = [
  {
    id: 'ATR-001',
    nombre: 'Marca',
    tipo: 'texto',
    requerido: true
  },
  {
    id: 'ATR-002',
    nombre: 'Modelo',
    tipo: 'texto',
    requerido: true
  },
  {
    id: 'ATR-003',
    nombre: 'Número de Serie',
    tipo: 'texto',
    requerido: true
  },
  {
    id: 'ATR-004',
    nombre: 'Fecha de Fabricación',
    tipo: 'fecha',
    requerido: false
  },
  {
    id: 'ATR-005',
    nombre: 'Potencia (W)',
    tipo: 'numero',
    requerido: false
  },
  {
    id: 'ATR-006',
    nombre: 'Tipo de Refrigerante',
    tipo: 'seleccion',
    opciones: ['R32', 'R410A', 'R22', 'R290'],
    requerido: false
  },
  {
    id: 'ATR-007',
    nombre: 'En Garantía',
    tipo: 'booleano',
    requerido: true
  }
];

const mockCategorias: Categoria[] = [
  {
    id: 'CAT-001',
    nombre: 'Equipos de Climatización',
    descripcion: 'Aires acondicionados, calefactores y ventiladores',
    color: '#3b82f6', // blue
    atributos: ['ATR-001', 'ATR-002', 'ATR-003', 'ATR-005', 'ATR-006', 'ATR-007']
  },
  {
    id: 'CAT-002',
    nombre: 'Herramientas',
    descripcion: 'Herramientas manuales y eléctricas',
    color: '#f97316', // orange
    atributos: ['ATR-001', 'ATR-002', 'ATR-003', 'ATR-007']
  },
  {
    id: 'CAT-003',
    nombre: 'Repuestos',
    descripcion: 'Repuestos para equipos de climatización',
    color: '#10b981', // green
    atributos: ['ATR-001', 'ATR-002', 'ATR-003', 'ATR-004']
  }
];

const mockItems: Item[] = [
  {
    id: 'ITEM-001',
    nombre: 'Aire Acondicionado Split',
    descripcion: 'Equipo de aire acondicionado split frío/calor',
    qrCode: 'QR-ITEM-001',
    estado: 'disponible',
    categoria: 'CAT-001',
    ubicacionInterna: 'Estantería A-12',
    fechaIngreso: '2024-01-15T10:00:00Z',
    fechaUltimoMovimiento: '2024-05-10T14:30:00Z',
    atributos: {
      'ATR-001': 'Samsung',
      'ATR-002': 'AR24TXHQASINXEU',
      'ATR-003': 'SN12345678',
      'ATR-005': '2400',
      'ATR-006': 'R32',
      'ATR-007': true
    },
    imagenes: [
      'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    ],
    historial: [
      {
        id: 'MOV-001',
        fecha: '2024-01-15T10:00:00Z',
        tipo: 'ingreso',
        usuario: 'Juan Pérez',
        ubicacionDestino: 'Depósito Central',
        observaciones: 'Ingreso inicial al inventario'
      },
      {
        id: 'MOV-002',
        fecha: '2024-03-20T09:15:00Z',
        tipo: 'salida',
        usuario: 'María González',
        ubicacionOrigen: 'Depósito Central',
        ubicacionDestino: 'Cliente ABC',
        observaciones: 'Salida para instalación'
      },
      {
        id: 'MOV-003',
        fecha: '2024-04-05T14:30:00Z',
        tipo: 'ingreso',
        usuario: 'María González',
        ubicacionOrigen: 'Cliente ABC',
        ubicacionDestino: 'Depósito Central',
        observaciones: 'Devolución por cambio de modelo'
      },
      {
        id: 'MOV-004',
        fecha: '2024-05-10T14:30:00Z',
        tipo: 'mantenimiento',
        usuario: 'Carlos Rodríguez',
        ubicacionOrigen: 'Depósito Central',
        ubicacionDestino: 'Taller',
        observaciones: 'Revisión y limpieza'
      }
    ]
  },
  {
    id: 'ITEM-002',
    nombre: 'Calefactor Eléctrico',
    descripcion: 'Calefactor eléctrico portátil',
    qrCode: 'QR-ITEM-002',
    estado: 'disponible',
    categoria: 'CAT-001',
    ubicacionInterna: 'Estantería B-05',
    fechaIngreso: '2024-02-10T11:30:00Z',
    fechaUltimoMovimiento: '2024-02-10T11:30:00Z',
    atributos: {
      'ATR-001': 'Liliana',
      'ATR-002': 'CaloVent CV400',
      'ATR-003': 'LIL98765432',
      'ATR-005': '2000',
      'ATR-007': true
    },
    imagenes: [
      'https://images.pexels.com/photos/6195133/pexels-photo-6195133.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    ],
    historial: [
      {
        id: 'MOV-005',
        fecha: '2024-02-10T11:30:00Z',
        tipo: 'ingreso',
        usuario: 'Juan Pérez',
        ubicacionDestino: 'Depósito Central',
        observaciones: 'Ingreso inicial al inventario'
      }
    ]
  },
  {
    id: 'ITEM-003',
    nombre: 'Taladro Inalámbrico',
    descripcion: 'Taladro inalámbrico recargable 18V',
    qrCode: 'QR-ITEM-003',
    estado: 'asignado',
    categoria: 'CAT-002',
    ubicacionInterna: 'Estantería C-08',
    fechaIngreso: '2024-01-20T09:45:00Z',
    fechaUltimoMovimiento: '2024-04-15T10:20:00Z',
    atributos: {
      'ATR-001': 'DeWalt',
      'ATR-002': 'DCD777C2',
      'ATR-003': 'DW87654321',
      'ATR-007': false
    },
    imagenes: [
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    ],
    historial: [
      {
        id: 'MOV-006',
        fecha: '2024-01-20T09:45:00Z',
        tipo: 'ingreso',
        usuario: 'Juan Pérez',
        ubicacionDestino: 'Depósito Central',
        observaciones: 'Ingreso inicial al inventario'
      },
      {
        id: 'MOV-007',
        fecha: '2024-04-15T10:20:00Z',
        tipo: 'salida',
        usuario: 'Carlos Rodríguez',
        ubicacionOrigen: 'Depósito Central',
        ubicacionDestino: 'Técnico: Pedro Martínez',
        observaciones: 'Asignación a técnico'
      }
    ]
  },
  {
    id: 'ITEM-004',
    nombre: 'Compresor para Aire Acondicionado',
    descripcion: 'Compresor de repuesto para equipos split',
    qrCode: 'QR-ITEM-004',
    estado: 'disponible',
    categoria: 'CAT-003',
    ubicacionInterna: 'Estantería D-15',
    fechaIngreso: '2024-03-05T15:20:00Z',
    fechaUltimoMovimiento: '2024-03-05T15:20:00Z',
    atributos: {
      'ATR-001': 'Daikin',
      'ATR-002': 'JT160G-P8Y1',
      'ATR-003': 'DK12345678',
      'ATR-004': '2023-11-10'
    },
    imagenes: [
      'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    ],
    historial: [
      {
        id: 'MOV-008',
        fecha: '2024-03-05T15:20:00Z',
        tipo: 'ingreso',
        usuario: 'María González',
        ubicacionDestino: 'Depósito Central',
        observaciones: 'Ingreso de repuesto nuevo'
      }
    ]
  },
  {
    id: 'ITEM-005',
    nombre: 'Ventilador de Pie',
    descripcion: 'Ventilador de pie con control remoto',
    qrCode: 'QR-ITEM-005',
    estado: 'en_mantenimiento',
    categoria: 'CAT-001',
    ubicacionInterna: 'Taller',
    fechaIngreso: '2023-12-10T13:15:00Z',
    fechaUltimoMovimiento: '2024-05-12T11:30:00Z',
    atributos: {
      'ATR-001': 'Liliana',
      'ATR-002': 'VSOC20',
      'ATR-003': 'LIL87654321',
      'ATR-005': '60',
      'ATR-007': false
    },
    imagenes: [
      'https://images.pexels.com/photos/6195133/pexels-photo-6195133.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    ],
    historial: [
      {
        id: 'MOV-009',
        fecha: '2023-12-10T13:15:00Z',
        tipo: 'ingreso',
        usuario: 'Juan Pérez',
        ubicacionDestino: 'Depósito Central',
        observaciones: 'Ingreso inicial al inventario'
      },
      {
        id: 'MOV-010',
        fecha: '2024-05-12T11:30:00Z',
        tipo: 'mantenimiento',
        usuario: 'Carlos Rodríguez',
        ubicacionOrigen: 'Depósito Central',
        ubicacionDestino: 'Taller',
        observaciones: 'Reparación de motor'
      }
    ]
  }
];

// API functions
const fetchDeposito = async (id: string): Promise<Deposito> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockDeposito;
};

const fetchItems = async (depositoId: string): Promise<Item[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockItems;
};

const fetchCategorias = async (): Promise<Categoria[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockCategorias;
};

const fetchAtributos = async (): Promise<Atributo[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAtributos;
};

// Main component
function DepositoDetalleContent() {
  const params = useParams();
  const router = useRouter();
  const depositoId = params.id as string;
  const [activeTab, setActiveTab] = useState<'items' | 'atributos' | 'categorias' | 'estadisticas'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);

  const { data: deposito, isLoading: loadingDeposito } = useQuery({
    queryKey: ['deposito', depositoId],
    queryFn: () => fetchDeposito(depositoId),
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ['items', depositoId],
    queryFn: () => fetchItems(depositoId),
  });

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
  });

  const { data: atributos } = useQuery({
    queryKey: ['atributos'],
    queryFn: fetchAtributos,
  });

  const filteredItems = items?.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = categoriaFilter === '' || item.categoria === categoriaFilter;
    const matchesEstado = estadoFilter === '' || item.estado === estadoFilter;
    
    return matchesSearch && matchesCategoria && matchesEstado;
  }) || [];

  const handleViewItem = (item: Item) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  const getCategoriaById = (id: string) => {
    return categorias?.find(cat => cat.id === id);
  };

  const getAtributoById = (id: string) => {
    return atributos?.find(atr => atr.id === id);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'asignado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'en_mantenimiento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'baja':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingDeposito) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando información del depósito...</p>
        </div>
      </div>
    );
  }

  if (!deposito) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Depósito no encontrado</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">El depósito solicitado no existe.</p>
        <button
          onClick={() => router.push('/depositos')}
          className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Volver a Depósitos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/depositos')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {deposito.nombre}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {deposito.id} - {deposito.cantidadItems} items
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Edit size={16} />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Información General</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building2 size={16} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado:</span>
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    deposito.estado === 'activo' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : deposito.estado === 'inactivo'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  )}>
                    {deposito.estado.charAt(0).toUpperCase() + deposito.estado.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{deposito.ubicacion}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Responsable:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{deposito.responsable}</span>
                </div>
                
                {deposito.telefono && (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{deposito.telefono}</span>
                  </div>
                )}
                
                {deposito.email && (
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{deposito.email}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Creado:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(deposito.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actualizado:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(deposito.updatedAt)}</span>
                </div>
              </div>
            </div>
            
            {deposito.descripcion && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción:</h3>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {deposito.descripcion}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Capacidad y Estadísticas</h2>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Capacidad utilizada</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {Math.round((deposito.capacidadUtilizada / deposito.capacidad) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className={cn(
                    "h-2.5 rounded-full",
                    deposito.capacidadUtilizada / deposito.capacidad > 0.9 ? "bg-red-600" : 
                    deposito.capacidadUtilizada / deposito.capacidad > 0.7 ? "bg-yellow-500" : 
                    "bg-green-600"
                  )}
                  style={{ width: `${(deposito.capacidadUtilizada / deposito.capacidad) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {deposito.capacidadUtilizada} de {deposito.capacidad} unidades
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
                <div className="text-xs text-blue-600 dark:text-blue-400">Total Items</div>
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {deposito.cantidadItems}
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
                <div className="text-xs text-green-600 dark:text-green-400">Disponibles</div>
                <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {items?.filter(item => item.estado === 'disponible').length || 0}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg">
                <div className="text-xs text-yellow-600 dark:text-yellow-400">En Mantenimiento</div>
                <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                  {items?.filter(item => item.estado === 'en_mantenimiento').length || 0}
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg">
                <div className="text-xs text-orange-600 dark:text-orange-400">Asignados</div>
                <div className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                  {items?.filter(item => item.estado === 'asignado').length || 0}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                href={`/depositos/${depositoId}/estadisticas`}
                className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center"
              >
                <BarChart2 size={16} className="mr-1" />
                Ver estadísticas detalladas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('items')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === 'items'
                ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <Package size={16} />
              <span>Items</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === 'categorias'
                ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <Layers size={16} />
              <span>Categorías</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('atributos')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === 'atributos'
                ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <Tag size={16} />
              <span>Atributos</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === 'estadisticas'
                ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart2 size={16} />
              <span>Estadísticas</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex items-center space-x-2"
                  >
                    <Filter size={16} />
                    <span>Filtros</span>
                    {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  
                  <Link
                    href={`/depositos/${depositoId}/items/nuevo`}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Nuevo Item</span>
                  </Link>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={categoriaFilter}
                      onChange={(e) => setCategoriaFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias?.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Todos los estados</option>
                      <option value="disponible">Disponible</option>
                      <option value="asignado">Asignado</option>
                      <option value="en_mantenimiento">En mantenimiento</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ubicación interna
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Estantería A-12"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Items List */}
              {loadingItems ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => {
                    const categoria = getCategoriaById(item.categoria);
                    
                    return (
                      <div 
                        key={item.id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewItem(item)}
                      >
                        <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                          {item.imagenes && item.imagenes.length > 0 ? (
                            <img 
                              src={item.imagenes[0]} 
                              alt={item.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              getEstadoColor(item.estado)
                            )}>
                              {item.estado.replace('_', ' ').charAt(0).toUpperCase() + item.estado.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                          {categoria && (
                            <div 
                              className="absolute bottom-0 left-0 right-0 px-3 py-1 text-xs font-medium text-white"
                              style={{ backgroundColor: categoria.color + 'CC' }} // Adding transparency
                            >
                              {categoria.nombre}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {item.nombre}
                            </h3>
                            <QrCode size={16} className="text-gray-500 dark:text-gray-400" />
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {item.descripcion}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <MapPin size={12} className="mr-1" />
                              <span>{item.ubicacionInterna}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              <span>{formatDate(item.fechaIngreso)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay items</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm || categoriaFilter || estadoFilter 
                      ? 'No se encontraron items con los filtros aplicados.'
                      : 'Comienza agregando un nuevo item al depósito.'
                    }
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/depositos/${depositoId}/items/nuevo`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <Plus size={16} className="mr-2" />
                      Nuevo Item
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categorías Tab */}
          {activeTab === 'categorias' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Categorías de Items
                </h2>
                <Link
                  href={`/depositos/${depositoId}/categorias/nueva`}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus size={16} />
                  <span>Nueva Categoría</span>
                </Link>
              </div>

              {categorias && categorias.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorias.map(categoria => (
                    <div 
                      key={categoria.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: categoria.color }}
                        >
                          <Layers className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {categoria.nombre}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {categoria.descripcion}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Atributos asociados:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {categoria.atributos.map(atributoId => {
                            const atributo = getAtributoById(atributoId);
                            return atributo ? (
                              <span 
                                key={atributoId}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full"
                              >
                                {atributo.nombre}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <button className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay categorías</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Comienza creando una nueva categoría para organizar tus items.
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/depositos/${depositoId}/categorias/nueva`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <Plus size={16} className="mr-2" />
                      Nueva Categoría
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Atributos Tab */}
          {activeTab === 'atributos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Atributos de Items
                </h2>
                <Link
                  href={`/depositos/${depositoId}/atributos/nuevo`}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus size={16} />
                  <span>Nuevo Atributo</span>
                </Link>
              </div>

              {atributos && atributos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Requerido
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Opciones
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {atributos.map((atributo, index) => (
                        <tr key={atributo.id} className={index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-700/50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {atributo.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              atributo.tipo === 'texto' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              atributo.tipo === 'numero' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              atributo.tipo === 'fecha' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                              atributo.tipo === 'seleccion' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            )}>
                              {atributo.tipo.charAt(0).toUpperCase() + atributo.tipo.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {atributo.requerido ? (
                              <span className="text-green-600 dark:text-green-400">Sí</span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {atributo.opciones ? (
                              <div className="flex flex-wrap gap-1">
                                {atributo.opciones.map((opcion, i) => (
                                  <span 
                                    key={i}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full"
                                  >
                                    {opcion}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                                <Eye size={16} />
                              </button>
                              <button className="p-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Tag className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay atributos</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Comienza creando un nuevo atributo para caracterizar tus items.
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/depositos/${depositoId}/atributos/nuevo`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <Plus size={16} className="mr-2" />
                      Nuevo Atributo
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estadísticas Tab */}
          {activeTab === 'estadisticas' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Estadísticas del Depósito
              </h2>
              
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <BarChart2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Módulo en desarrollo</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Las estadísticas detalladas estarán disponibles próximamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {showItemDetail && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Package className="mr-2 text-orange-500" size={20} />
                  Detalle del Item
                </h2>
                <button
                  onClick={() => setShowItemDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Imágenes */}
                <div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden h-64 mb-4">
                    {selectedItem.imagenes && selectedItem.imagenes.length > 0 ? (
                      <img 
                        src={selectedItem.imagenes[0]} 
                        alt={selectedItem.nombre}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={64} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {selectedItem.imagenes && selectedItem.imagenes.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {selectedItem.imagenes.map((imagen, index) => (
                        <div 
                          key={index}
                          className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 border-transparent hover:border-orange-500 cursor-pointer"
                        >
                          <img 
                            src={imagen} 
                            alt={`${selectedItem.nombre} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm">
                      <QrCode size={16} />
                      <span>Ver QR</span>
                    </button>
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm">
                      <Download size={16} />
                      <span>Descargar QR</span>
                    </button>
                  </div>
                </div>
                
                {/* Información */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {selectedItem.nombre}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.id}</span>
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getEstadoColor(selectedItem.estado)
                      )}>
                        {selectedItem.estado.replace('_', ' ').charAt(0).toUpperCase() + selectedItem.estado.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedItem.descripcion}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Layers size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {getCategoriaById(selectedItem.categoria)?.nombre || 'Sin categoría'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{selectedItem.ubicacionInterna}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de ingreso:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(selectedItem.fechaIngreso)}</span>
                    </div>
                    
                    {selectedItem.fechaUltimoMovimiento && (
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Último movimiento:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(selectedItem.fechaUltimoMovimiento)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Atributos</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedItem.atributos).map(([key, value]) => {
                        const atributo = getAtributoById(key);
                        if (!atributo) return null;
                        
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{atributo.nombre}:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {atributo.tipo === 'booleano' 
                                ? (value ? 'Sí' : 'No')
                                : String(value)
                              }
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Historial de movimientos */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <History size={18} className="mr-2 text-orange-500" />
                  Historial de Movimientos
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Origen/Destino
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Observaciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedItem.historial.map((movimiento, index) => (
                        <tr key={movimiento.id} className={index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-700/50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {formatDateTime(movimiento.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              movimiento.tipo === 'ingreso' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              movimiento.tipo === 'salida' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              movimiento.tipo === 'traslado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              movimiento.tipo === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            )}>
                              {movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {movimiento.usuario}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {movimiento.tipo === 'ingreso' ? (
                              <div className="flex items-center">
                                <ArrowRight size={14} className="text-green-500 mr-1" />
                                <span>{movimiento.ubicacionDestino}</span>
                              </div>
                            ) : movimiento.tipo === 'salida' ? (
                              <div className="flex items-center">
                                <ArrowLeftIcon size={14} className="text-red-500 mr-1" />
                                <span>{movimiento.ubicacionDestino}</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span>{movimiento.ubicacionOrigen}</span>
                                <ArrowRight size={14} className="mx-1 text-blue-500" />
                                <span>{movimiento.ubicacionDestino}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {movimiento.observaciones || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowItemDetail(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                <Link
                  href={`/depositos/${depositoId}/items/${selectedItem.id}/editar`}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Editar Item
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DepositoDetallePage() {
  return (
    <ProtectedLayout>
      <DepositoDetalleContent />
    </ProtectedLayout>
  );
}
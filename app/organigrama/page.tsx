'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  RotateCcw, 
  UserPlus,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  Users
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AddEmployeeModal } from '@/components/organigrama/add-employee-modal';
import { cn } from '@/utils/cn';

interface Employee {
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

interface VacantPosition {
  id: string;
  puesto: string;
  area: string;
  supervisor?: string;
  isVacant: true;
}

// Configuración de áreas con colores
const areaColors = {
  'GERENCIA': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  'RRHH': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'IT': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'ADMINISTRACION': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'TÉCNICA': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'GESTIÓN DE ACTIVOS': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'GESTIÓN DE TALENTO': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
  'HIGIENE Y SEGURIDAD': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  'GESTIÓN DE CALIDAD': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
  'VENTAS': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400'
};

// Mock data con estructura jerárquica
const mockEmployees: Employee[] = [
  // CEO
  {
    id: '1',
    nombre: 'Juan Jose Rambaudi',
    email: 'ceo@hogarapp.com',
    telefono: '+54 11 1234-5678',
    puesto: 'CEO',
    area: 'GERENCIA',
    fechaIngreso: '2020-01-15',
    activo: true,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    children: [
      // Directores
      {
        id: '2',
        nombre: 'María Fernanda López',
        email: 'maria.lopez@hogarapp.com',
        telefono: '+54 11 2345-6789',
        puesto: 'Directora de Operaciones',
        area: 'GERENCIA',
        supervisor: '1',
        fechaIngreso: '2020-03-01',
        activo: true,
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        children: [
          // RRHH
          {
            id: '4',
            nombre: 'Ana Patricia Rodríguez',
            email: 'ana.rodriguez@hogarapp.com',
            telefono: '+54 11 4567-8901',
            puesto: 'Gerente de RRHH',
            area: 'RRHH',
            supervisor: '2',
            fechaIngreso: '2020-04-10',
            activo: true,
            children: [
              {
                id: '5',
                nombre: 'Luis Fernando Morales',
                email: 'luis.morales@hogarapp.com',
                telefono: '+54 11 5678-9012',
                puesto: 'Especialista en Selección',
                area: 'RRHH',
                supervisor: '4',
                fechaIngreso: '2021-01-20',
                activo: true
              },
              {
                id: '6',
                nombre: 'Carmen Elena Vásquez',
                email: 'carmen.vasquez@hogarapp.com',
                telefono: '+54 11 6789-0123',
                puesto: 'Analista de Nómina',
                area: 'RRHH',
                supervisor: '4',
                fechaIngreso: '2021-03-15',
                activo: true
              },
              {
                id: '19',
                nombre: 'Alejandro David Ortiz',
                email: 'alejandro.ortiz@hogarapp.com',
                telefono: '+54 11 9012-3478',
                puesto: 'Coordinador de Capacitación',
                area: 'GESTIÓN DE TALENTO',
                supervisor: '4',
                fechaIngreso: '2021-05-01',
                activo: true,
                children: [
                  {
                    id: '20',
                    nombre: 'Natalia Carolina Herrera',
                    email: 'natalia.herrera@hogarapp.com',
                    telefono: '+54 11 0123-4589',
                    puesto: 'Especialista en Desarrollo',
                    area: 'GESTIÓN DE TALENTO',
                    supervisor: '19',
                    fechaIngreso: '2021-08-10',
                    activo: true
                  },
                  {
                    id: '21',
                    nombre: 'Sebastián Nicolás Aguilar',
                    email: 'sebastian.aguilar@hogarapp.com',
                    telefono: '+54 11 1234-5690',
                    puesto: 'Analista de Desempeño',
                    area: 'GESTIÓN DE TALENTO',
                    supervisor: '19',
                    fechaIngreso: '2021-09-05',
                    activo: true
                  }
                ]
              },
              {
                id: '39',
                nombre: 'Rodrigo Sebastián Torres',
                email: 'rodrigo.torres@hogarapp.com',
                telefono: '+54 11 9012-3478',
                puesto: 'Especialista en Bienestar',
                area: 'RRHH',
                supervisor: '4',
                fechaIngreso: '2022-10-01',
                activo: true,
                children: [
                  {
                    id: '40',
                    nombre: 'Camila Valentina Ruiz',
                    email: 'camila.ruiz@hogarapp.com',
                    telefono: '+54 11 0123-4589',
                    puesto: 'Asistente de RRHH',
                    area: 'RRHH',
                    supervisor: '39',
                    fechaIngreso: '2022-11-15',
                    activo: true
                  }
                ]
              }
            ]
          },
          // ADMINISTRACION
          {
            id: '10',
            nombre: 'Patricia Isabel Jiménez',
            email: 'patricia.jimenez@hogarapp.com',
            telefono: '+54 11 0123-4567',
            puesto: 'Gerente Administrativo',
            area: 'ADMINISTRACION',
            supervisor: '2',
            fechaIngreso: '2020-06-15',
            activo: true,
            children: [
              {
                id: '11',
                nombre: 'Miguel Ángel Torres',
                email: 'miguel.torres@hogarapp.com',
                telefono: '+54 11 1234-5670',
                puesto: 'Contador Senior',
                area: 'ADMINISTRACION',
                supervisor: '10',
                fechaIngreso: '2021-01-10',
                activo: true,
                children: [
                  {
                    id: '33',
                    nombre: 'Jorge Luis Paredes',
                    email: 'jorge.paredes@hogarapp.com',
                    telefono: '+54 11 3456-7812',
                    puesto: 'Asistente Administrativo',
                    area: 'ADMINISTRACION',
                    supervisor: '11',
                    fechaIngreso: '2022-04-01',
                    activo: true
                  }
                ]
              },
              {
                id: '12',
                nombre: 'Gabriela Cristina Ruiz',
                email: 'gabriela.ruiz@hogarapp.com',
                telefono: '+54 11 2345-6701',
                puesto: 'Asistente Contable',
                area: 'ADMINISTRACION',
                supervisor: '10',
                fechaIngreso: '2021-05-20',
                activo: true
              },
              {
                id: '34',
                nombre: 'Mariana Soledad Gómez',
                email: 'mariana.gomez@hogarapp.com',
                telefono: '+54 11 4567-8923',
                puesto: 'Recepcionista',
                area: 'ADMINISTRACION',
                supervisor: '10',
                fechaIngreso: '2022-05-10',
                activo: true
              },
              {
                id: '16',
                nombre: 'Mónica Alejandra Soto',
                email: 'monica.soto@hogarapp.com',
                telefono: '+54 11 6789-0145',
                puesto: 'Coordinadora de Activos',
                area: 'GESTIÓN DE ACTIVOS',
                supervisor: '10',
                fechaIngreso: '2021-04-10',
                activo: true,
                children: [
                  {
                    id: '17',
                    nombre: 'Ricardo Andrés Molina',
                    email: 'ricardo.molina@hogarapp.com',
                    telefono: '+54 11 7890-1256',
                    puesto: 'Analista de Inventarios',
                    area: 'GESTIÓN DE ACTIVOS',
                    supervisor: '16',
                    fechaIngreso: '2021-06-01',
                    activo: true
                  },
                  {
                    id: '18',
                    nombre: 'Valeria Stephanie Cruz',
                    email: 'valeria.cruz@hogarapp.com',
                    telefono: '+54 11 8901-2367',
                    puesto: 'Especialista en Compras',
                    area: 'GESTIÓN DE ACTIVOS',
                    supervisor: '16',
                    fechaIngreso: '2021-07-15',
                    activo: true
                  }
                ]
              }
            ]
          },
          // VENTAS
          {
            id: '28',
            nombre: 'Carolina Esperanza Díaz',
            email: 'carolina.diaz@hogarapp.com',
            telefono: '+54 11 8901-2367',
            puesto: 'Gerente de Ventas',
            area: 'VENTAS',
            supervisor: '2',
            fechaIngreso: '2020-08-01',
            activo: true,
            children: [
              {
                id: '29',
                nombre: 'Hernán Rodrigo Castillo',
                email: 'hernan.castillo@hogarapp.com',
                telefono: '+54 11 9012-3478',
                puesto: 'Ejecutivo de Ventas Senior',
                area: 'VENTAS',
                supervisor: '28',
                fechaIngreso: '2021-01-15',
                activo: true,
                children: [
                  {
                    id: '38',
                    nombre: 'Isabella María Herrera',
                    email: 'isabella.herrera@hogarapp.com',
                    telefono: '+54 11 8901-2367',
                    puesto: 'Asistente de Ventas',
                    area: 'VENTAS',
                    supervisor: '29',
                    fechaIngreso: '2022-09-10',
                    activo: true
                  }
                ]
              },
              {
                id: '30',
                nombre: 'Daniela Fernanda Rojas',
                email: 'daniela.rojas@hogarapp.com',
                telefono: '+54 11 0123-4589',
                puesto: 'Ejecutiva de Ventas',
                area: 'VENTAS',
                supervisor: '28',
                fechaIngreso: '2021-03-10',
                activo: true
              },
              {
                id: '37',
                nombre: 'Esteban Nicolás Vargas',
                email: 'esteban.vargas@hogarapp.com',
                telefono: '+54 11 7890-1256',
                puesto: 'Coordinador de Ventas',
                area: 'VENTAS',
                supervisor: '28',
                fechaIngreso: '2022-08-01',
                activo: true
              }
            ]
          }
        ]
      },
      // Director Técnico
      {
        id: '3',
        nombre: 'Roberto Silva García',
        email: 'roberto.silva@hogarapp.com',
        telefono: '+54 11 3456-7890',
        puesto: 'Director Técnico',
        area: 'GERENCIA',
        supervisor: '1',
        fechaIngreso: '2020-02-15',
        activo: true,
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        children: [
          // IT
          {
            id: '7',
            nombre: 'Diego Alejandro Herrera',
            email: 'diego.herrera@hogarapp.com',
            telefono: '+54 11 7890-1234',
            puesto: 'Gerente de IT',
            area: 'IT',
            supervisor: '3',
            fechaIngreso: '2020-05-01',
            activo: true,
            avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
            children: [
              {
                id: '8',
                nombre: 'Sofía Beatriz Mendoza',
                email: 'sofia.mendoza@hogarapp.com',
                telefono: '+54 11 8901-2345',
                puesto: 'Desarrolladora Senior',
                area: 'IT',
                supervisor: '7',
                fechaIngreso: '2021-02-10',
                activo: true,
                children: [
                  {
                    id: '35',
                    nombre: 'Cristian Eduardo López',
                    email: 'cristian.lopez@hogarapp.com',
                    telefono: '+54 11 5678-9034',
                    puesto: 'Desarrollador Junior',
                    area: 'IT',
                    supervisor: '8',
                    fechaIngreso: '2022-06-01',
                    activo: true
                  }
                ]
              },
              {
                id: '9',
                nombre: 'Andrés Felipe Castro',
                email: 'andres.castro@hogarapp.com',
                telefono: '+54 11 9012-3456',
                puesto: 'Administrador de Sistemas',
                area: 'IT',
                supervisor: '7',
                fechaIngreso: '2021-04-05',
                activo: true,
                children: [
                  {
                    id: '36',
                    nombre: 'Paola Andrea Martín',
                    email: 'paola.martin@hogarapp.com',
                    telefono: '+54 11 6789-0145',
                    puesto: 'Analista de Soporte',
                    area: 'IT',
                    supervisor: '9',
                    fechaIngreso: '2022-07-15',
                    activo: true
                  }
                ]
              }
            ]
          },
          // TÉCNICA
          {
            id: '13',
            nombre: 'Fernando José Ramírez',
            email: 'fernando.ramirez@hogarapp.com',
            telefono: '+54 11 3456-7012',
            puesto: 'Supervisor Técnico',
            area: 'TÉCNICA',
            supervisor: '3',
            fechaIngreso: '2020-07-01',
            activo: true,
            children: [
              {
                id: '14',
                nombre: 'Claudia Marcela Vargas',
                email: 'claudia.vargas@hogarapp.com',
                telefono: '+54 11 4567-8023',
                puesto: 'Técnica Senior HVAC',
                area: 'TÉCNICA',
                supervisor: '13',
                fechaIngreso: '2021-02-15',
                activo: true,
                children: [
                  {
                    id: '31',
                    nombre: 'Pablo Andrés Medina',
                    email: 'pablo.medina@hogarapp.com',
                    telefono: '+54 11 1234-5690',
                    puesto: 'Técnico Junior',
                    area: 'TÉCNICA',
                    supervisor: '14',
                    fechaIngreso: '2022-02-01',
                    activo: true
                  }
                ]
              },
              {
                id: '15',
                nombre: 'Javier Eduardo Peña',
                email: 'javier.pena@hogarapp.com',
                telefono: '+54 11 5678-9034',
                puesto: 'Técnico Eléctrico',
                area: 'TÉCNICA',
                supervisor: '13',
                fechaIngreso: '2021-03-01',
                activo: true,
                children: [
                  {
                    id: '32',
                    nombre: 'Verónica Alejandra Silva',
                    email: 'veronica.silva@hogarapp.com',
                    telefono: '+54 11 2345-6701',
                    puesto: 'Técnica de Mantenimiento',
                    area: 'TÉCNICA',
                    supervisor: '15',
                    fechaIngreso: '2022-03-15',
                    activo: true
                  }
                ]
              },
              {
                id: '22',
                nombre: 'Elena Beatriz Moreno',
                email: 'elena.moreno@hogarapp.com',
                telefono: '+54 11 2345-6701',
                puesto: 'Responsable de Seguridad',
                area: 'HIGIENE Y SEGURIDAD',
                supervisor: '13',
                fechaIngreso: '2021-06-15',
                activo: true,
                children: [
                  {
                    id: '23',
                    nombre: 'Gustavo Ernesto Blanco',
                    email: 'gustavo.blanco@hogarapp.com',
                    telefono: '+54 11 3456-7812',
                    puesto: 'Inspector de Seguridad',
                    area: 'HIGIENE Y SEGURIDAD',
                    supervisor: '22',
                    fechaIngreso: '2021-10-01',
                    activo: true
                  },
                  {
                    id: '24',
                    nombre: 'Lorena Paola Vega',
                    email: 'lorena.vega@hogarapp.com',
                    telefono: '+54 11 4567-8923',
                    puesto: 'Técnica en Higiene',
                    area: 'HIGIENE Y SEGURIDAD',
                    supervisor: '22',
                    fechaIngreso: '2021-11-10',
                    activo: true
                  }
                ]
              }
            ]
          },
          // GESTIÓN DE CALIDAD
          {
            id: '25',
            nombre: 'Raúl Esteban Guerrero',
            email: 'raul.guerrero@hogarapp.com',
            telefono: '+54 11 5678-9034',
            puesto: 'Coordinador de Calidad',
            area: 'GESTIÓN DE CALIDAD',
            supervisor: '3',
            fechaIngreso: '2021-07-01',
            activo: true,
            children: [
              {
                id: '26',
                nombre: 'Adriana Soledad Ramos',
                email: 'adriana.ramos@hogarapp.com',
                telefono: '+54 11 6789-0145',
                puesto: 'Analista de Calidad',
                area: 'GESTIÓN DE CALIDAD',
                supervisor: '25',
                fechaIngreso: '2021-12-01',
                activo: true
              },
              {
                id: '27',
                nombre: 'Mauricio Alejandro Peña',
                email: 'mauricio.pena@hogarapp.com',
                telefono: '+54 11 7890-1256',
                puesto: 'Auditor Interno',
                area: 'GESTIÓN DE CALIDAD',
                supervisor: '25',
                fechaIngreso: '2022-01-15',
                activo: true
              }
            ]
          }
        ]
      }
    ]
  }
];

// Posiciones vacantes
const mockVacantPositions: VacantPosition[] = [
  {
    id: 'v1',
    puesto: 'Gerente de Marketing',
    area: 'VENTAS',
    supervisor: '2',
    isVacant: true
  },
  {
    id: 'v2',
    puesto: 'Desarrollador Full Stack',
    area: 'IT',
    supervisor: '7',
    isVacant: true
  },
  {
    id: 'v3',
    puesto: 'Técnico de Campo',
    area: 'TÉCNICA',
    supervisor: '13',
    isVacant: true
  },
  {
    id: 'v4',
    puesto: 'Analista Financiero',
    area: 'ADMINISTRACION',
    supervisor: '10',
    isVacant: true
  },
  {
    id: 'v5',
    puesto: 'Especialista en Comunicaciones',
    area: 'RRHH',
    supervisor: '4',
    isVacant: true
  }
];

const fetchEmployees = async (): Promise<Employee[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockEmployees;
};

const fetchVacantPositions = async (): Promise<VacantPosition[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockVacantPositions;
};

const addEmployee = async (data: Omit<Employee, 'id'>, supervisorId: string): Promise<Employee> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generar un ID único para el nuevo empleado
  const newId = `emp-${Date.now()}`;
  
  // Crear el nuevo empleado
  const newEmployee: Employee = {
    id: newId,
    ...data,
    supervisor: supervisorId
  };
  
  return newEmployee;
};

interface NodeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee;
}

function NodeDetailModal({ isOpen, onClose, employee }: NodeDetailModalProps) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Detalles del Empleado</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.nombre}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-white">
                  {employee.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{employee.nombre}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.puesto}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-gray-100">{employee.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-gray-100">{employee.telefono}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building size={16} className="text-gray-400" />
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                areaColors[employee.area as keyof typeof areaColors]
              )}>
                {employee.area}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Ingreso: {new Date(employee.fechaIngreso).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User size={16} className="text-gray-400" />
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                employee.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              )}>
                {employee.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
              Editar
            </button>
            <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
              Ver Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface JobSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: VacantPosition;
}

function JobSearchModal({ isOpen, onClose, position }: JobSearchModalProps) {
  const [formData, setFormData] = useState({
    titulo: position?.puesto || '',
    descripcion: '',
    requisitos: '',
    experiencia: '',
    educacion: '',
    salarioMin: '',
    salarioMax: '',
    ubicacion: '',
    fechaLimite: '',
    tipoContrato: 'tiempo_completo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando búsqueda laboral:', formData);
    onClose();
  };

  if (!isOpen || !position) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Iniciar Búsqueda Laboral</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título del Puesto *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área
              </label>
              <input
                type="text"
                value={position.area}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción del Puesto *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Describe las responsabilidades y funciones del puesto..."
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Iniciar Búsqueda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Custom organizational chart component
interface OrgNodeProps {
  node: Employee | VacantPosition;
  onNodeClick: (node: Employee | VacantPosition) => void;
  onAddEmployee: (supervisorId: string) => void;
  level?: number;
}

function OrgNode({ node, onNodeClick, onAddEmployee, level = 0 }: OrgNodeProps) {
  const isVacant = 'isVacant' in node;
  const employee = node as Employee;
  const vacant = node as VacantPosition;

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className="relative group">
        <div
          onClick={() => onNodeClick(node)}
          className={cn(
            "cursor-pointer rounded-lg shadow-sm border p-3 w-48 hover:shadow-md transition-all mb-4",
            isVacant 
              ? "bg-white dark:bg-gray-800 border-2 border-dashed border-orange-300 dark:border-orange-600 hover:border-orange-500"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-orange-500"
          )}
        >
          <div className="flex items-center space-x-3">
            {isVacant ? (
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <UserPlus className="text-orange-600 dark:text-orange-400" size={20} />
              </div>
            ) : employee.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.nombre}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {employee.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {isVacant ? vacant.puesto : employee.nombre}
              </p>
              <p className={cn(
                "text-xs truncate",
                isVacant ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"
              )}>
                {isVacant ? 'Vacante' : employee.puesto}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              areaColors[(isVacant ? vacant.area : employee.area) as keyof typeof areaColors]
            )}>
              {isVacant ? vacant.area : employee.area}
            </span>
          </div>
          {isVacant && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Click para iniciar búsqueda
            </div>
          )}
        </div>
        
        {/* Add employee button */}
        {!isVacant && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddEmployee(employee.id);
            }}
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Agregar empleado"
          >
            <UserPlus size={16} />
          </button>
        )}
      </div>

      {/* Children */}
      {!isVacant && employee.children && employee.children.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-300 dark:bg-gray-600 -top-4"></div>
          
          {/* Horizontal line */}
          {employee.children.length > 1 && (
            <div className="absolute top-2 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
          )}
          
          {/* Children nodes */}
          <div className="flex space-x-8 pt-6">
            {employee.children.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Vertical connector to child */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-300 dark:bg-gray-600 -top-6"></div>
                <OrgNode 
                  node={child} 
                  onNodeClick={onNodeClick}
                  onAddEmployee={onAddEmployee}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrganigramaContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedVacantPosition, setSelectedVacantPosition] = useState<VacantPosition | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showJobSearchModal, setShowJobSearchModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  });

  const { data: vacantPositions, isLoading: loadingVacants } = useQuery({
    queryKey: ['vacant-positions'],
    queryFn: fetchVacantPositions,
  });

  const addEmployeeMutation = useMutation({
    mutationFn: ({ data, supervisorId }: { data: Omit<Employee, 'id'>, supervisorId: string }) => 
      addEmployee(data, supervisorId),
    onSuccess: (newEmployee) => {
      // Actualizar el árbol de empleados
      queryClient.setQueryData(['employees'], (oldData: Employee[] | undefined) => {
        if (!oldData) return oldData;
        
        // Función recursiva para agregar el nuevo empleado al supervisor correcto
        const addToSupervisor = (employees: Employee[]): Employee[] => {
          return employees.map(emp => {
            if (emp.id === newEmployee.supervisor) {
              // Agregar el nuevo empleado a los hijos del supervisor
              return {
                ...emp,
                children: [...(emp.children || []), newEmployee]
              };
            } else if (emp.children && emp.children.length > 0) {
              // Buscar recursivamente en los hijos
              return {
                ...emp,
                children: addToSupervisor(emp.children)
              };
            }
            return emp;
          });
        };
        
        return addToSupervisor(oldData);
      });
      
      setShowAddEmployeeModal(false);
    }
  });

  const isLoading = loadingEmployees || loadingVacants || addEmployeeMutation.isPending;

  // Función para agregar vacantes a la estructura jerárquica
  const addVacantsToTree = useCallback((employees: Employee[], vacants: VacantPosition[]): Employee[] => {
    const addVacantsToNode = (node: Employee): Employee => {
      const nodeVacants = vacants.filter(v => v.supervisor === node.id);
      const children = node.children ? node.children.map(addVacantsToNode) : [];
      
      return {
        ...node,
        children: [...children, ...nodeVacants as any]
      };
    };

    return employees.map(addVacantsToNode);
  }, []);

  // Filtrar el árbol basado en los criterios de búsqueda
  const filterTree = useCallback((tree: Employee[], searchTerm: string, selectedArea: string, selectedRole: string): Employee[] => {
    const filterNode = (node: Employee | VacantPosition): boolean => {
      const isVacant = 'isVacant' in node;
      const nodeArea = isVacant ? (node as VacantPosition).area : (node as Employee).area;
      const nodeRole = isVacant ? (node as VacantPosition).puesto : (node as Employee).puesto;
      const nodeName = isVacant ? '' : (node as Employee).nombre;
      
      // Verificar si el nodo cumple con los criterios de filtro
      const matchesSearch = searchTerm === '' || 
                           (nodeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            nodeRole.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesArea = selectedArea === '' || nodeArea === selectedArea;
      const matchesRole = selectedRole === '' || nodeRole.toLowerCase().includes(selectedRole.toLowerCase());
      
      // Si el nodo es una vacante, aplicar los filtros directamente
      if (isVacant) {
        return matchesSearch && matchesArea && matchesRole;
      }
      
      // Si el nodo es un empleado, verificar también sus hijos
      const employee = node as Employee;
      if (employee.children && employee.children.length > 0) {
        // Filtrar los hijos recursivamente
        const filteredChildren = employee.children
          .filter(filterNode)
          .map(child => {
            if ('isVacant' in child) return child;
            return {
              ...child,
              children: child.children ? child.children.filter(filterNode) : []
            };
          });
        
        // Si algún hijo cumple con los criterios, incluir este nodo
        if (filteredChildren.length > 0) {
          employee.children = filteredChildren;
          return true;
        }
      }
      
      // Si no hay hijos o ninguno cumple, aplicar los filtros al nodo actual
      return matchesSearch && matchesArea && matchesRole;
    };
    
    return tree.filter(filterNode).map(node => ({
      ...node,
      children: node.children ? node.children.filter(filterNode) : []
    }));
  }, []);

  const handleNodeClick = (node: Employee | VacantPosition) => {
    if ('isVacant' in node) {
      setSelectedVacantPosition(node);
      setShowJobSearchModal(true);
    } else {
      setSelectedEmployee(node);
      setShowNodeModal(true);
    }
  };

  const handleAddEmployee = (supervisorId: string) => {
    setSelectedSupervisorId(supervisorId);
    setShowAddEmployeeModal(true);
  };

  const handleSubmitNewEmployee = (data: Omit<Employee, 'id'>, supervisorId: string) => {
    addEmployeeMutation.mutate({ data, supervisorId });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedArea('');
    setSelectedRole('');
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Obtener todos los supervisores disponibles para el modal de agregar empleado
  const getAllSupervisors = useCallback((employees: Employee[]): { id: string; nombre: string; puesto: string }[] => {
    let supervisors: { id: string; nombre: string; puesto: string }[] = [];
    
    const extractSupervisors = (employee: Employee) => {
      supervisors.push({
        id: employee.id,
        nombre: employee.nombre,
        puesto: employee.puesto
      });
      
      if (employee.children) {
        employee.children.forEach(child => {
          if (!('isVacant' in child)) {
            extractSupervisors(child);
          }
        });
      }
    };
    
    employees.forEach(extractSupervisors);
    return supervisors;
  }, []);

  const totalEmployees = employees?.reduce((count, emp) => {
    const countInTree = (node: Employee): number => {
      return 1 + (node.children ? node.children.reduce((sum, child) => {
        if ('isVacant' in child) return sum;
        return sum + countInTree(child as Employee);
      }, 0) : 0);
    };
    return count + countInTree(emp);
  }, 0) || 0;

  const totalVacants = vacantPositions?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando organigrama...</p>
        </div>
      </div>
    );
  }

  let orgData = employees && vacantPositions ? addVacantsToTree(employees, vacantPositions) : [];
  
  // Aplicar filtros si hay alguno activo
  if (searchTerm || selectedArea || selectedRole) {
    orgData = filterTree(orgData, searchTerm, selectedArea, selectedRole);
  }

  const availableSupervisors = employees ? getAllSupervisors(employees) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Organigrama Empresarial</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualiza la estructura organizacional de la empresa
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <Users size={16} />
              <span>{totalEmployees} empleados</span>
            </span>
            <span className="flex items-center space-x-1">
              <UserPlus size={16} />
              <span>{totalVacants} vacantes</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <button 
            onClick={() => {
              setSelectedSupervisorId(undefined);
              setShowAddEmployeeModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Crear Puesto</span>
          </button>
        </div>
      </div>

      {/* Filtros compactos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área
            </label>
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas las áreas</option>
              {Object.keys(areaColors).map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Puesto
            </label>
            <input
              type="text"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              placeholder="Filtrar por puesto..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Organigrama */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        {/* Controles de Zoom */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button 
            onClick={handleZoomOut}
            className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Minus size={16} />
          </button>
          <button 
            onClick={handleZoomIn}
            className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Custom Organigrama */}
        <div 
          ref={chartContainerRef}
          className="p-8 min-h-[600px] bg-gray-50 dark:bg-gray-900 overflow-auto"
        >
          <div 
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease'
            }}
          >
            {orgData.length > 0 && (
              <div className="flex justify-center">
                <OrgNode 
                  node={orgData[0]} 
                  onNodeClick={handleNodeClick}
                  onAddEmployee={handleAddEmployee}
                />
              </div>
            )}
          </div>
        </div>

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Leyenda</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Empleado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border-2 border-dashed border-orange-300 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Vacante</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NodeDetailModal
        isOpen={showNodeModal}
        onClose={() => setShowNodeModal(false)}
        employee={selectedEmployee || undefined}
      />

      <JobSearchModal
        isOpen={showJobSearchModal}
        onClose={() => setShowJobSearchModal(false)}
        position={selectedVacantPosition || undefined}
      />

      <AddEmployeeModal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSubmit={handleSubmitNewEmployee}
        isLoading={addEmployeeMutation.isPending}
        availableSupervisors={availableSupervisors}
        selectedSupervisorId={selectedSupervisorId}
      />
    </div>
  );
}

export default function OrganigramaPage() {
  return (
    <ProtectedLayout>
      <OrganigramaContent />
    </ProtectedLayout>
  );
}
'use client';

import { FileText } from 'lucide-react';
import { PhotoField } from './photo-field';
import { TextField } from './text-field';

 interface ModuloFormulario {
  id: string;
  pagina: number;
  nombre: string;
  orden: number;
  campos: CampoFormulario[];
}

export interface CampoFormulario {
  id: string;
  nombre: string;
  titulo: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'fecha_hora' | 'casilla_verificacion' | 'desplegable' | 'foto' | "titulo";
  valor: any;
  requerido: boolean;
  tareaTecnico: string;
  vistaInforme: string;
  fotos?: string[];
}

interface OrderFormSectionProps {
  modulos: ModuloFormulario[];
}

export function OrderFormSection({ modulos }: OrderFormSectionProps) {
  // Agrupar módulos por página
  const modulosPorPagina = modulos.reduce((acc, modulo) => {
    if (!acc[modulo.pagina]) {
      acc[modulo.pagina] = [];
    }
    acc[modulo.pagina].push(modulo);
    return acc;
  }, {} as Record<number, ModuloFormulario[]>);

  // Ordenar páginas y módulos
  const paginasOrdenadas = Object.keys(modulosPorPagina)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="text-orange-500" size={20} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Formulario</h2>
      </div>

      <div className="space-y-8">
        {paginasOrdenadas.map((numeroPagina) => {
          const modulosDePagina = modulosPorPagina[numeroPagina].sort((a, b) => a.orden - b.orden);
          
          return (
            <div key={numeroPagina} className="space-y-6">
              {modulosDePagina.map((modulo) => (
                <div key={modulo.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/50">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Página {modulo.pagina} - {modulo.nombre.toUpperCase()}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modulo.campos.map((campo) => (
                      <div key={campo.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {campo.titulo}
                            {campo.requerido && <span className="text-red-500 ml-1">*</span>}
                          </label>
                        </div>
                        
                        {campo.tareaTecnico && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <strong>Instrucción:</strong> {campo.tareaTecnico}
                          </p>
                        )}

                        {campo.tipo === 'foto' ? (
                          <PhotoField campo={campo} />
                        ) : (
                          <TextField campo={campo} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
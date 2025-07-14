'use client';

import { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';

interface CampoFormulario {
  id: string;
  nombre: string;
  titulo: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'fecha_hora' | 'casilla_verificacion' | 'desplegable' | 'foto';
  valor: any;
  requerido: boolean;
  tareaTecnico: string;
  vistaInforme: string;
}

interface TextFieldProps {
  campo: CampoFormulario;
}

export function TextField({ campo }: TextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [valor, setValor] = useState(campo.valor);
  const [valorTemporal, setValorTemporal] = useState(campo.valor);

  const handleEdit = () => {
    setIsEditing(true);
    setValorTemporal(valor);
  };

  const handleSave = () => {
    setValor(valorTemporal);
    setIsEditing(false);
    // Aquí se haría la llamada a la API para guardar el cambio
    console.log(`Guardando campo ${campo.nombre}:`, valorTemporal);
  };

  const handleCancel = () => {
    setValorTemporal(valor);
    setIsEditing(false);
  };

  const renderInput = () => {
    const baseClasses = "flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";
    
    switch (campo.tipo) {
      case 'numero':
        return (
          <input
            type="number"
            value={valorTemporal || ''}
            onChange={(e) => setValorTemporal(e.target.value)}
            className={baseClasses}
            disabled={!isEditing}
          />
        );
      
      case 'fecha':
        return (
          <input
            type="date"
            value={valorTemporal || ''}
            onChange={(e) => setValorTemporal(e.target.value)}
            className={baseClasses}
            disabled={!isEditing}
          />
        );
      
      case 'fecha_hora':
        return (
          <input
            type="datetime-local"
            value={valorTemporal || ''}
            onChange={(e) => setValorTemporal(e.target.value)}
            className={baseClasses}
            disabled={!isEditing}
          />
        );
      
      case 'casilla_verificacion':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={valorTemporal || false}
              onChange={(e) => setValorTemporal(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 dark:bg-gray-700"
              disabled={!isEditing}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {valorTemporal ? 'Sí' : 'No'}
            </span>
          </div>
        );
      
      case 'desplegable':
        // En un caso real, las opciones vendrían de la configuración del campo
        const opciones = ['Funcionando', 'Con fallas menores', 'Fuera de servicio'];
        return (
          <select
            value={valorTemporal || ''}
            onChange={(e) => setValorTemporal(e.target.value)}
            className={baseClasses}
            disabled={!isEditing}
          >
            <option value="">Seleccionar...</option>
            {opciones.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        );
      
      default: // texto
        return (
          <input
            type="text"
            value={valorTemporal || ''}
            onChange={(e) => setValorTemporal(e.target.value)}
            className={baseClasses}
            disabled={!isEditing}
          />
        );
    }
  };

  const renderReadOnlyValue = () => {
    switch (campo.tipo) {
      case 'casilla_verificacion':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={valor || false}
              readOnly
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {valor ? 'Sí' : 'No'}
            </span>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={valor || 'Sin valor'}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            {renderInput()}
            <button
              onClick={handleSave}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Guardar"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Cancelar"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            {renderReadOnlyValue()}
            <button
              onClick={handleEdit}
              className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              title="Editar"
            >
              <Edit size={16} />
            </button>
          </>
        )}
      </div>
      
      {campo.vistaInforme && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>En reporte:</strong> {campo.vistaInforme}
        </p>
      )}
    </div>
  );
}
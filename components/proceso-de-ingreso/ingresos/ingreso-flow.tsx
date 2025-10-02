'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Position,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PasoIngreso, EstadoPaso, Archivo } from '@/utils/types';
import { NodoPaso } from './nodo-paso';
import { ComentarioModal } from './comentario-modal';
import { ArchivoModal } from './archivo-modal';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface IngresoFlowProps {
  pasos: PasoIngreso[];
  onEstadoCambio: (id: string, nuevoEstado: EstadoPaso) => void;
  onComentario: (id: string, comentario: string) => void;
  onUploadArchivo: (id: string, archivo: File) => void;
}

// Definir los tipos de nodos personalizados
const nodeTypes: NodeTypes = {
  pasoIngreso: NodoPaso
};

export function IngresoFlow({ pasos, onEstadoCambio, onComentario, onUploadArchivo }: IngresoFlowProps) {
  // Estado para los modales
  const [comentarioModal, setComentarioModal] = useState<{
    isOpen: boolean;
    pasoId: string;
  }>({
    isOpen: false,
    pasoId: ''
  });

  const [archivoModal, setArchivoModal] = useState<{
    isOpen: boolean;
    pasoId: string;
  }>({
    isOpen: false,
    pasoId: ''
  });

  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(0.8);

  // Función para organizar automáticamente los nodos en un layout jerárquico
  const organizarNodos = (pasos: PasoIngreso[]): Node[] => {
    // Crear un mapa de nodos por ID para facilitar el acceso
    const nodosMap = new Map<string, PasoIngreso>();
    pasos.forEach(paso => nodosMap.set(paso.id, paso));
    
    // Identificar nodos raíz (sin dependencias)
    const nodosRaiz = pasos.filter(paso => !paso.dependeDe || paso.dependeDe.length === 0);
    
    // Crear un mapa de hijos para cada nodo
    const hijosMap = new Map<string, string[]>();
    pasos.forEach(paso => {
      if (paso.dependeDe && paso.dependeDe.length > 0) {
        paso.dependeDe.forEach(parentId => {
          if (!hijosMap.has(parentId)) {
            hijosMap.set(parentId, []);
          }
          hijosMap.get(parentId)?.push(paso.id);
        });
      }
    });
    
    // Calcular niveles para cada nodo
    const niveles = new Map<string, number>();
    
    const calcularNivel = (pasoId: string, nivelActual: number) => {
      const nivelExistente = niveles.get(pasoId) || 0;
      const nuevoNivel = Math.max(nivelExistente, nivelActual);
      niveles.set(pasoId, nuevoNivel);
      
      const hijos = hijosMap.get(pasoId) || [];
      hijos.forEach(hijoId => {
        calcularNivel(hijoId, nuevoNivel + 1);
      });
    };
    
    // Calcular niveles comenzando desde los nodos raíz
    nodosRaiz.forEach(nodo => calcularNivel(nodo.id, 0));
    
    // Agrupar nodos por nivel
    const nodosPorNivel = new Map<number, string[]>();
    niveles.forEach((nivel, pasoId) => {
      if (!nodosPorNivel.has(nivel)) {
        nodosPorNivel.set(nivel, []);
      }
      nodosPorNivel.get(nivel)?.push(pasoId);
    });
    
    // Calcular posiciones basadas en niveles
    const nodos: Node[] = [];
    const VERTICAL_SPACING = 150;
    const HORIZONTAL_SPACING = 300;
    
    // Ordenar niveles
    const nivelesOrdenados = Array.from(nodosPorNivel.keys()).sort((a, b) => a - b);
    
    nivelesOrdenados.forEach(nivel => {
      const nodosEnNivel = nodosPorNivel.get(nivel) || [];
      const anchoPorNodo = HORIZONTAL_SPACING;
      const anchoTotal = nodosEnNivel.length * anchoPorNodo;
      const inicioX = -(anchoTotal / 2) + (anchoPorNodo / 2);
      
      nodosEnNivel.forEach((pasoId, index) => {
        const paso = nodosMap.get(pasoId);
        if (paso) {
          const x = inicioX + (index * anchoPorNodo);
          const y = nivel * VERTICAL_SPACING;
          
          nodos.push({
            id: paso.id,
            type: 'pasoIngreso',
            position: { x, y },
            data: { 
              ...paso,
              onEstadoCambio,
              onComentarioClick: (id: string) => {
                setComentarioModal({
                  isOpen: true,
                  pasoId: id
                });
              },
              onArchivoClick: (id: string) => {
                setArchivoModal({
                  isOpen: true,
                  pasoId: id
                });
              }
            },
            // Asegurar que los nodos estén por encima de las conexiones en modo oscuro
            style: { zIndex: 10 }
          });
        }
      });
    });
    
    return nodos;
  };

  // Crear edges basados en las dependencias
  const crearEdges = (pasos: PasoIngreso[]): Edge[] => {
    const edges: Edge[] = [];
    pasos.forEach(paso => {
      if (paso.dependeDe && paso.dependeDe.length > 0) {
        paso.dependeDe.forEach(sourceId => {
          edges.push({
            id: `e-${sourceId}-${paso.id}`,
            source: sourceId,
            target: paso.id,
            animated: paso.estado === 'bloqueado',
            style: { stroke: '#ff7e1d', strokeWidth: 2, zIndex: 5 }, // Menor zIndex que los nodos
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#ff7e1d',
            },
          });
        });
      }
    });
    return edges;
  };

  const initialNodes = organizarNodos(pasos);
  const initialEdges = crearEdges(pasos);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#ff7e1d', strokeWidth: 2, zIndex: 5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#ff7e1d',
      },
    }, eds)),
    [setEdges]
  );

  const handleComentarioSubmit = (comentario: string) => {
    if (comentarioModal.pasoId) {
      onComentario(comentarioModal.pasoId, comentario);
      setComentarioModal({ isOpen: false, pasoId: '' });
    }
  };

  const handleArchivoSubmit = (file: File) => {
    if (archivoModal.pasoId) {
      onUploadArchivo(archivoModal.pasoId, file);
      setArchivoModal({ isOpen: false, pasoId: '' });
    }
  };

  // Actualizar el flujo cuando cambian los pasos
  useEffect(() => {
    setNodes(organizarNodos(pasos));
    setEdges(crearEdges(pasos));
  }, [pasos, setNodes, setEdges]);

  // Funciones para controlar el zoom
  const handleZoomIn = () => {
    if (reactFlowInstance) {
      const newZoom = Math.min(zoomLevel + 0.2, 2.5);
      reactFlowInstance.zoomTo(newZoom);
      setZoomLevel(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      const newZoom = Math.max(zoomLevel - 0.2, 0.2);
      reactFlowInstance.zoomTo(newZoom);
      setZoomLevel(newZoom);
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
      setZoomLevel(reactFlowInstance.getZoom());
    }
  };

  return (
    <>
      <div style={{ height: 600 }} className="rounded-lg border border-gray-200 dark:border-gray-700 relative">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2.5}
            attributionPosition="bottom-right"
            onInit={(instance) => setReactFlowInstance(instance)}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            snapToGrid={true}
            snapGrid={[15, 15]}
            // Asegurar que las conexiones estén por debajo de los nodos
            elevateEdgesOnSelect={false}
            selectNodesOnDrag={false}
            zoomOnDoubleClick={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnScroll={true}
            panOnDrag={true}
          >
            <Background color="#aaa" gap={16} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.data?.estado === 'completo') return '#22c55e';
                if (n.data?.estado === 'en_curso') return '#eab308';
                if (n.data?.estado === 'bloqueado') return '#ef4444';
                return '#94a3b8';
              }}
              nodeColor={(n) => {
                if (n.data?.estado === 'completo') return '#dcfce7';
                if (n.data?.estado === 'en_curso') return '#fef9c3';
                if (n.data?.estado === 'bloqueado') return '#fee2e2';
                return '#f1f5f9';
              }}
              maskColor="rgba(240, 240, 240, 0.6)"
            />
            
            {/* Panel de control de zoom personalizado */}
            <Panel position="top-right" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex space-x-2">
              <button 
                onClick={handleZoomIn}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Acercar"
              >
                <ZoomIn size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Alejar"
              >
                <ZoomOut size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={handleFitView}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Ajustar vista"
              >
                <Maximize size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <div className="flex items-center px-2 text-sm text-gray-600 dark:text-gray-400">
                {Math.round(zoomLevel * 100)}%
              </div>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Modales */}
      <ComentarioModal
        isOpen={comentarioModal.isOpen}
        onClose={() => setComentarioModal({ isOpen: false, pasoId: '' })}
        onSubmit={handleComentarioSubmit}
      />

      <ArchivoModal
        isOpen={archivoModal.isOpen}
        onClose={() => setArchivoModal({ isOpen: false, pasoId: '' })}
        onSubmit={handleArchivoSubmit}
      />
    </>
  );
}
import { ClientService } from "@/utils/api/apiCliente";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import CreateClientModal from "./CrearClienteModal";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import { Cliente } from "@/utils/types";
import ModalPortal from "../ui/ModalPortal";

export const ClientesContent = () => {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [deleteOpenModal, setDeleteOpenModal] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => ClientService.listarClientes(100, 0),
  });

  const clientes = data?.clients;

  const crearCliente = useMutation({
    mutationFn: (data: Cliente) => {
      return ClientService.crearCliente(data);
    },
    onSuccess: () => {
      toast.success("Cliente creado con exito.");
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: () => {
      toast.error("Ocurrio un error al crear el cliente.");
    },
  });

  const borrarCliente = useMutation({
    mutationFn: (id: string) => {
      return ClientService.deleteCliente(id);
    },
  });

  const handleEliminarCliente = () => {
    if (!clienteAEliminar) return;

    borrarCliente.mutate(clienteAEliminar, {
      onSuccess: () => {
        toast.success("Cliente eliminado con éxito.");
        queryClient.invalidateQueries({ queryKey: ["clientes"] });
        setDeleteOpenModal(false);
        setClienteAEliminar(null);
      },
      onError: () => {
        toast.error("Ocurrió un error al eliminar el cliente.");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-400">
            👥 Clientes
          </h1>
          <p className="text-gray-600 mt-1">
            Administración de la cartera de clientes
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Codigo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Razon Social
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cuit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Cargando clientes...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-red-500">
                    Ocurrió un error al cargar los clientes.
                  </td>
                </tr>
              ) : clientes?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No hay clientes registrados.
                  </td>
                </tr>
              ) : (
                clientes?.map((cliente: any) => (
                  <tr key={cliente.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {cliente.codigo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {cliente.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {cliente.razonSocial}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {cliente.cuit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <div className="flex gap-2 items-center justify-start">
                        <button
                          onClick={() =>
                            console.log("editar cliente", cliente.id)
                          }
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setClienteAEliminar(cliente.id);
                            setDeleteOpenModal(true);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ModalPortal>
        <CreateClientModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          mutate={crearCliente.mutate}
        />

        <ConfirmDeleteModal
          isOpen={deleteOpenModal}
          onClose={() => {
            setDeleteOpenModal(false);
            setClienteAEliminar(null);
          }}
          onConfirm={handleEliminarCliente}
          isLoading={borrarCliente.isPending}
          title="Eliminar cliente"
          message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      </ModalPortal>
    </div>
  );
};

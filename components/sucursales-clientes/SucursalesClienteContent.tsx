"use client";

import { SucursalesService } from "@/api/apiSucursales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../ui/loading-spinner";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import { ClientService } from "@/api/apiCliente";
import { normalizeText } from "@/utils/normalize";
import { Sucursal } from "@/utils/types";
import { CrearSucursalClienteModal } from "./CrearSucursalClienteModal";
import { useRouter } from "next/navigation";

const SucursalesClienteContent = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  //QUERYS
  const { data: sucursalesCliente, isLoading } = useQuery({
    queryKey: ["sucursales-clientes"],
    queryFn: () => SucursalesService.listarSucursales(),
  });

  const { data: sucHogar } = useQuery({
    queryKey: ["sucursales-hogar"],
    queryFn: () => SucursalesService.getAllSucursalesHogar(),
  });

  const { data } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => ClientService.listarClientes(),
  });
  const clientes = data?.clients;

  // Mutación para eliminar
  const eliminarSucursal = useMutation({
    mutationFn: (id: string) => SucursalesService.eliminarSucursal(id),
    onSuccess: () => {
      toast.success("Sucursal eliminada");
      queryClient.invalidateQueries({ queryKey: ["sucursales-clientes"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar");
    },
  });

  // Mutación para editar (podés invocarla desde un modal más adelante)
  const editarSucursal = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      SucursalesService.editarSucursal(id, data),
    onSuccess: () => {
      toast.success("Sucursal editada");
      queryClient.invalidateQueries({ queryKey: ["sucursales-clientes"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al editar");
    },
  });

  const activarSucursal = useMutation({
    mutationFn: async (id: string) => {
      return await SucursalesService.activeSucursal(id);
    },
    onSuccess: () => {
      toast.success("Sucursal actualizada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["sucursales-clientes"] }),
        queryClient.invalidateQueries({ queryKey: ["sucursales-panoramica"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar sucursal ❌");
      console.error("❌ Error activarSucursal:", error);
    },
  });

  // Mutación para crear (el modal lo harás después)
  const crearSucursalCliente = useMutation({
    mutationFn: (data: any) => {
      return SucursalesService.crearSucursalCliente(data);
    },
    onSuccess: () => {
      toast.success("Sucursal creada");
      queryClient.invalidateQueries({ queryKey: ["sucursales-clientes"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear");
    },
  });

  const handleConfirmEliminar = () => {
    if (sucursalSeleccionada?.id) {
      eliminarSucursal.mutate(sucursalSeleccionada.id);
      setIsDeleteModalOpen(false);
      setSucursalSeleccionada(null);
    }
  };

  const sucursalesFiltradas = sucursalesCliente?.filter((sucursal: any) => {
    const term = normalizeText(searchTerm);

    return (
      normalizeText(sucursal.name || "").includes(term) ||
      normalizeText(sucursal.address || "").includes(term) ||
      normalizeText(sucursal.codigo || "").includes(term) ||
      (typeof sucursal.sucHogar === "object" &&
        normalizeText(sucursal.sucHogar?.name || "").includes(term)) ||
      normalizeText(sucursal.cliente?.name || "").includes(term)
    );
  });

  const handleViewSectores = (sucursal: { id: string; name: string }) => {
    router.push(
      `/sucursales-clientes/${sucursal.id}?name=${encodeURIComponent(
        sucursal.name
      )}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex gap-5 items-center">
            <Building2 size={30} className="text-red-500 hover:text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Sucursales Clientes
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            Gestión de sucursales físicas y puntos de atención
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Sucursal</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mt-4">
        <input
          type="text"
          placeholder="Buscar por nombre, dirección, código o sucursal hogar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        <span className="absolute left-3 top-3 text-gray-400 dark:text-gray-300">
          <Search size={16} />
        </span>
      </div>

      {/* Tabla de sucursales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Codigo
                </th>
                <th className="px-4 py-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre sucursal
                </th>
                <th className="px-4 py-3 text-left text-xs font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sectores
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Suc. Hogar
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activar / Desactivar
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y dark:divide-gray-800 divide-gray-200">
              {sucursalesFiltradas?.map((sucursal: Sucursal) => (
                <tr
                  key={sucursal.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {sucursal.codigo || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-400">
                    {sucursal.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-400">
                    <button
                      onClick={() =>
                        handleViewSectores({
                          id: sucursal.id!,
                          name: sucursal.name!,
                        })
                      }
                      className="text-xs text-white rounded-lg border bg-blue-400 hover:bg-blue-500 px-1 py-2"
                    >
                      Ver Sectores
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-400">
                    {sucursal.address || "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-400">
                    {typeof sucursal?.cliente === "string"
                      ? sucursal.cliente // si viene como UUID, muestro el string o un guion
                      : sucursal?.cliente?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-400">
                    {typeof sucursal?.sucHogar === "string"
                      ? sucursal.sucHogar // si viene como UUID, muestro el string o un guion
                      : sucursal?.sucHogar?.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
                        <input
                          type="checkbox"
                          checked={sucursal.isActive}
                          onChange={() => {
                            activarSucursal.mutate(sucursal.id!);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-red-500 rounded-full peer-checked:bg-green-500 transition-colors dark:bg-red-400 dark:peer-checked:bg-green-400"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-5"></div>
                      </label>
                      <span
                        className={`text-xs ${
                          sucursal.isActive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {sucursal.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-600"
                        onClick={() =>
                          console.log("Abrir modal de edición", sucursal)
                        }
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          setSucursalSeleccionada(sucursal);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {Array.isArray(sucursalesFiltradas) &&
                sucursalesFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No hay sucursales registradas.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      <CrearSucursalClienteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => {
          crearSucursalCliente.mutate(data);
          setIsCreateModalOpen(false);
        }}
        sucursalesHogar={sucHogar ?? []}
        clientes={clientes}
      />

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSucursalSeleccionada(null);
          }}
          onConfirm={handleConfirmEliminar}
          title="Eliminar sucursal"
          message={`¿Estás seguro de que deseas eliminar la sucursal "${sucursalSeleccionada?.name}"?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default SucursalesClienteContent;

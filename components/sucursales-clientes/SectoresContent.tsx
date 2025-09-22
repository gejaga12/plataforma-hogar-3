"use client";

import React, { useState } from "react";
import { Building2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Sector } from "@/utils/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SectorPatch, SucursalesService } from "@/api/apiSucursales";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../ui/loading-spinner";
import SectorModal from "./ModalSector";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

interface SectoresContentProps {
  sucursalid?: string;
}

const SectoresContent: React.FC<SectoresContentProps> = ({ sucursalid }) => {
  const searchParams = useSearchParams();
  const sucursalName = searchParams.get("name");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<string | null>(null);

  const { data: sectores = [], isLoading } = useQuery({
    queryKey: ["sectores", sucursalid],
    queryFn: () => SucursalesService.listarSectores(sucursalid!),
    enabled: !!sucursalid,
  });

  const { mutate: crearSector, isPending } = useMutation({
    mutationFn: (payload: Sector) => {
      console.log("📦 Payload enviado:", payload);
      return SucursalesService.crearSector(payload);
    },
    onSuccess: () => {
      toast.success("Sector creado con éxito.");
      setIsModalOpen(false);

      // 🔹 Invalida y refresca la query de sectores
      queryClient.invalidateQueries({ queryKey: ["sectores", sucursalid] });
    },
    onError: () => {
      toast.error("Error al crear el sector.");
    },
  });

  const { mutate: eliminarSector, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => SucursalesService.eliminarSector(id),
    onSuccess: () => {
      toast.success("Sector eliminado con éxito.");
      queryClient.invalidateQueries({ queryKey: ["sectores", sucursalid] });
      closeDeleteModal();
    },
    onError: () => {
      toast.error("Error al eliminar el sector.");
    },
  });

  const { mutate: editarSector } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SectorPatch }) => {
      console.log("sector editado:", id, data);
      return SucursalesService.editarSector(id, data);
    },
    onSuccess: () => {
      toast.success("Sector actualizado con éxito.");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["sectores", sucursalid] });
    },
    onError: () => {
      toast.error("Error al actualizar el sector.");
    },
  });

  const handleCreate = () => {
    setModalMode("create");
    setSelectedSector(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sector: Sector) => {
    setModalMode("edit");
    setSelectedSector(sector);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setSectorToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSectorToDelete(null);
  };

  const handleSave = (sector: Sector) => {
    if (modalMode === "create") {
      crearSector(sector);
    } else {
      if (!sector.id) {
        toast.error("Falta el ID del sector para editar.");
        return;
      }
      const payload: SectorPatch = {
        name: sector.name,
        codigo: sector.codigo,
        sucursalid: sector.sucursalid,
      };
      editarSector({ id: sector.id, data: payload });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        {/* Izquierda */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/sucursales-clientes")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex gap-3 items-center">
              <Building2
                size={30}
                className="text-red-500 hover:text-red-600"
              />
              <h2 className="text-2xl font-bold text-gray-900">
                Sectores de {sucursalName || sucursalid}
              </h2>
            </div>
            <p className="text-gray-600 mt-1">
              Gestión de sectores dentro de la sucursal
            </p>
          </div>
        </div>

        {/* Derecha */}
        <button
          onClick={handleCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Sector</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg shadow">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="px-4 py-2">Código</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sectores.map((sector: Sector) => (
                <tr key={sector.codigo} className="border-t">
                  <td className="px-4 py-2 font-mono">{sector.codigo}</td>
                  <td className="px-4 py-2">{sector.name}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(sector)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(sector.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {sectores.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-4 text-center text-gray-500 italic"
                  >
                    No hay sectores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SectorModal
          modo={modalMode}
          sector={selectedSector}
          sucursalid={sucursalid!}
          onClose={() => setIsModalOpen(false)}
          onSave={(sector) => {
            if (modalMode === "create") {
              crearSector(sector);
            } else {
              handleSave(sector);
            }
          }}
          isPending={isPending}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (sectorToDelete) {
            eliminarSector(sectorToDelete);
          }
        }}
        isLoading={isDeleting}
        title="Eliminar Sector"
        message="¿Seguro que deseas eliminar este sector? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default SectoresContent;

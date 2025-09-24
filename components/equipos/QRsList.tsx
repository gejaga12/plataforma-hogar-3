"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, MoreHorizontal, QrCodeIcon } from "lucide-react";
import { EquipoService } from "@/utils/api/apiEquipo";
import { cn } from "@/utils/cn";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { useState } from "react";
import { EquipoQR } from "./equipo-qr";
import { EstadoEquipo } from "@/utils/types";

interface QR {
  id: string;
  payload: string;
  relations: number;
}

const QRsList = () => {
  const queryClient = useQueryClient();

  const [selectedQR, setSelectedQR] = useState<QR | null>(null);

  // Traer los QRs vacíos (no asignados a equipos)
  const { data: qrs = [], isLoading } = useQuery<QR[]>({
    queryKey: ["qrs-vacios"],
    queryFn: EquipoService.listarQRs,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4">
          <QrCodeIcon size={20} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            QRs disponibles
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Estos QRs aún no están asignados a ningún equipo.
        </p>
      </div>

      {/* Grid de QRs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {qrs.map((qr) => (
          <div
            key={qr.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => setSelectedQR(qr)}
          >
            <div className="flex justify-center">
              <QRCodeCanvas value={qr.payload} size={120} level="H" />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Relaciones: {qr.relations}
            </p>
          </div>
        ))}

        {qrs.length === 0 && !isLoading && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            No hay QRs disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default QRsList;

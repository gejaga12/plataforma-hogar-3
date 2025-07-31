// hooks/useUpsertLabor.ts

import {
  buildCrearLaborPayload,
  CrearLaborDTO,
  LaborService,
} from "@/api/apiLabor";
import type { FormDataLabor } from "@/components/users/FormDatosLaborales";
import { UserAdapted } from "@/utils/types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type UpdateArgs = { id: string; data: Partial<CrearLaborDTO> };

export function useUpsertLabor(user: UserAdapted) {
  const qc = useQueryClient();

  const crearMutation = useMutation({
    mutationFn: (payload: CrearLaborDTO) => LaborService.crearLabor(payload),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: UpdateArgs) =>
      LaborService.actualizarLabor(id, data),
  });

  const save = async (form: FormDataLabor) => {
    const payload = buildCrearLaborPayload(form, user.id);

    try {
      if (!user.laborId) {
        // CREATE
        const created = await crearMutation.mutateAsync(payload);

        // Actualizá tu store/context y/o cache local
        // 1) si guardás el usuario en React Query:
        qc.setQueryData(["usuario", user.id], (prev: any) =>
          prev
            ? {
                ...prev,
                labor: created, // si tu backend devuelve el objeto labor
                laborId: created?.id, // o almacenar el id plano
                relacionLaboral:
                  created?.relacionLaboral ?? prev.relacionLaboral,
                tipoContrato: created?.tipoDeContrato ?? prev.tipoContrato,
                fechaIngreso: created?.fechaIngreso ?? prev.fechaIngreso,
              }
            : prev
        );

        toast.success("Información laboral creada");
        return created;
      } else {
        // UPDATE
        const { userId, ...rest } = payload; // evitar enviar userId en PUT
        const updated = await actualizarMutation.mutateAsync({
          id: user.laborId,
          data: rest,
        });

        // Sincronizar cache/local state
        qc.setQueryData(["usuario", user.id], (prev: any) =>
          prev
            ? {
                ...prev,
                labor: { ...(prev.labor || {}), ...updated },
              }
            : prev
        );

        toast.success("Información laboral actualizada");
        return updated;
      }
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar información laboral");
      throw err;
    }
  };

  return {
    save,
    isSaving: crearMutation.isPending || actualizarMutation.isPending,
    crearMutation,
    actualizarMutation,
  };
}

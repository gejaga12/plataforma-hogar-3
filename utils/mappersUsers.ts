import { CrearLaborDTO } from "@/api/apiLabor";
import { FormDataLabor } from "@/components/users/FormDatosLaborales";
import { formatDateInput } from "./formatDate";
import { UserAdapted } from "./types";

// editar labor
// recibe el form y el labor previo (opcional) para comparar cambios
export const buildLaborUpdatePayload = (
  form: FormDataLabor,
  prev?: UserAdapted["labor"]
): Partial<CrearLaborDTO> => {
  const out: Partial<CrearLaborDTO> = {};

  // cuil (string -> number)
  const formCuilNum = form.cuil ? Number(form.cuil) : undefined;
  const prevCuilNum =
    prev?.cuil != null ? Number(String(prev.cuil)) : undefined;
  if (formCuilNum !== prevCuilNum) out.cuil = formCuilNum;

  // fechaIngreso
  const fIngreso = form.fechaIngreso ? formatDateInput(form.fechaIngreso) : "";
  if (fIngreso && fIngreso !== (prev?.fechaIngreso ?? "")) {
    out.fechaIngreso = fIngreso;
  }

  // fechaAlta
  const fAlta = form.fechaAlta ? formatDateInput(form.fechaAlta) : "";
  if (fAlta && fAlta !== (prev?.fechaAlta ?? "")) {
    out.fechaAlta = fAlta;
  }

  // tipoContrato -> tipoDeContrato
  if (
    form.tipoDeContrato &&
    form.tipoDeContrato !== (prev?.tipoDeContrato ?? "")
  ) {
    out.tipoDeContrato = form.tipoDeContrato;
  }

  // relacionLaboral
  if (
    form.relacionLaboral &&
    form.relacionLaboral !== (prev?.relacionLaboral ?? "")
  ) {
    out.relacionLaboral = form.relacionLaboral;
  }

  // categoryArca
  if ((form.categoryArca ?? "") !== (prev?.categoryArca ?? "")) {
    out.categoryArca = form.categoryArca?.trim() || undefined;
  }

  // antiguedad
  if ((form.antiguedad ?? "") !== (prev?.antiguedad ?? "")) {
    out.antiguedad = form.antiguedad?.trim() || undefined;
  }

  // horasTrabajo (string)
  if ((form.horasTrabajo ?? "") !== (prev?.horasTrabajo ?? "")) {
    out.horasTrabajo = form.horasTrabajo?.trim() || undefined;
  }

  // sueldo (string -> number)
  const formSueldoNum =
    form.sueldo !== undefined && form.sueldo !== 0
      ? Number(form.sueldo)
      : undefined;
  const prevSueldoNum = prev?.sueldo;
  if (formSueldoNum !== prevSueldoNum) out.sueldo = formSueldoNum;

  // Si no hay cambios, out quedará vacío
  return out;
};
import { format, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

// Detectar zona horaria del usuario con el navegador
export const getUserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Frontend → Backend: convertir fecha local a UTC
export const toUTC = (date: Date, timeZone: string): string => {
  const utcDate = fromZonedTime(date, timeZone);
  return utcDate.toISOString(); // listo para enviar al backend
};

// Backend → Frontend: convertir UTC a zona del usuario
export const fromUTC = (utcString: string, timeZone: string): Date => {
  const utcDate = parseISO(utcString);
  return toZonedTime(utcDate, timeZone);
};

// Mostrar al usuario con formato legible largo (fecha y hora)
export const formatForUser = (
  utcString: string,
  timeZone: string,
  pattern: string = "dd/MM/yy HH:mm"
): string => {
  return formatInTimeZone(utcString, timeZone, pattern);
};

// Mostrar solo fecha corta dd/MM/yy
export const formatDateForUser = (
  utcString: string,
  timeZone: string
): string => {
  if (!utcString) return "";
  return formatInTimeZone(utcString, timeZone, "dd/MM/yy");
};

// Mostrar solo la hora (HH:mm) de un string UTC
export const formatHourForUser = (
  utcString: string,
  timeZone: string
): string => {
  if (!utcString) return "";
  return formatInTimeZone(utcString, timeZone, "HH:mm");
};

// Convertir un string de input <input type="date"> a UTC ISO
export const formatDateInput = (dateString: string): string | null => {
  if (!dateString) return null;

  // Si ya es ISO completo, no agregamos nada
  if (dateString.includes("T")) {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) throw new Error(`Fecha inválida: ${dateString}`);
    return d.toISOString();
  }

  // Si es solo YYYY-MM-DD, agregamos T00:00:00
  const localDate = new Date(`${dateString}T00:00:00`);
  if (isNaN(localDate.getTime())) {
    throw new Error(`Fecha inválida: ${dateString}`);
  }
  return localDate.toISOString();
};

// Convertir un string de input <input type="time"> a UTC ISO
export const formatTimeInput = (
  timeString: string,
  baseDate: string
): string | null => {
  if (!timeString || !baseDate) return null;

  // baseDate esperado en YYYY-MM-DD
  const localDateTime = new Date(`${baseDate}T${timeString}`);
  if (isNaN(localDateTime.getTime())) {
    throw new Error(`Hora inválida: ${timeString} con baseDate ${baseDate}`);
  }

  return localDateTime.toISOString();
};

// Convertir un ISO string a "YYYY-MM-DD" (para inputs <input type="date">)
export const toDateInputValue = (isoString?: string | null): string => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0]; // ✅ devuelve "2024-11-11"
};

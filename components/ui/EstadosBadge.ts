import { StateOT } from "@/utils/types";

export const getEstadoBadgeClass = (state?: StateOT): string => {
  switch (state) {
    case StateOT.PENDING: // pendiente
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case StateOT.ONTHERUN: // en_camino
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case StateOT.RECEIVED: // me_recibio
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case StateOT.WAITINGFORTHEWORMS: // no_me_recibio
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case StateOT.INTHEEND: // finalizado
      return "bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-300";
    case StateOT.OUTSIDETHEWALL: // postergado
      return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    case StateOT.NOASSIGN: // sin_asignar
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export const getEstadoLabel = (state?: StateOT): string => {
  switch (state) {
    case StateOT.PENDING:
      return "Pendiente";
    case StateOT.ONTHERUN:
      return "En camino";
    case StateOT.RECEIVED:
      return "Me recibió";
    case StateOT.WAITINGFORTHEWORMS:
      return "No me recibió";
    case StateOT.INTHEEND:
      return "Finalizado";
    case StateOT.OUTSIDETHEWALL:
      return "Postergado";
    case StateOT.NOASSIGN:
      return "Sin asignar";
    default:
      return "Desconocido";
  }
};

export const getPrioridadClass = (priority?: string): string => {
  switch (priority) {
    case "Baja":
      return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300";
    case "Media":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "Alta":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

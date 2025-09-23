export const formatDateInput = (date: unknown): string => {
  if (!date) return "";

  const d = new Date(date as string | number);
  if (isNaN(d.getTime())) return "";

  return d.toISOString().slice(0, 10);
};

export const formatDateText = (dateString?: string): string => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2); // solo dos dígitos

  return `${day}/${month}/${year}`;
};

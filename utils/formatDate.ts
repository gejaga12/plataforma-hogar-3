export const formatDateInput = (date: unknown): string => {
  if (!date) return "";

  const d = new Date(date as string | number);
  if (isNaN(d.getTime())) return "";

  return d.toISOString().slice(0, 10);
};

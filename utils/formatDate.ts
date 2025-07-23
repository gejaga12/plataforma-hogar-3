export const formatDateInput = (date: unknown): string => {
  if (!date) return ""; // null, undefined, 0, false
  const d = new Date(date as string | number);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("sv-SE");
};

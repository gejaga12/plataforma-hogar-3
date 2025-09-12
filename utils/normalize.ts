export const normalizeText = (text: string) => {
  return text
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .toLowerCase()
    .trim();
};

export const capitalizeFirstLetter = (text: string) => {
  return text
    .toLowerCase()
    .split(" ")
    .map((fl) => fl.charAt(0).toUpperCase() + fl.slice(1))
    .join(" ");
};

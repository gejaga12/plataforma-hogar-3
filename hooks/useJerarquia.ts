import { JerarquiaContext } from "@/context/JerarquiaContext";
import { useContext } from "react";

export const useJerarquia = () => {
  const context = useContext(JerarquiaContext);
  if (!context) {
    throw new Error("useJerarquia debe usarse dentro de un JerarquiaProvider");
  }
  return context;
};

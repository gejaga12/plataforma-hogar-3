import { ZonaService } from "@/lib/api/apiZonas";
import { Pais, Zona } from "@/utils/types";
import { createContext, useContext, useEffect, useState } from "react";

interface GlobalContextType {
  zonas: Zona[];
  paises: Pais[];
  isLoading: boolean;
  refreshZonas: () => void;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchZonas = async () => {
    try {
      setIsLoading(true);
      const { zonas, paises } = await ZonaService.allInfoZona();

      console.log("ZONAS CARGADAS:", zonas);
      setZonas(zonas);

      //sacamos paises del objeto anidado
      console.log("PAISES CARGADOS:", paises);
      setPaises(paises);
    } catch (err: any) {
      console.log("Error al cargar zonas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZonas();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ zonas, paises, isLoading, refreshZonas: fetchZonas }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Hook para usar el contexto
export const useGlobalContext = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx)
    throw new Error("useGlobalContext debe usarse dentro de GlobalProvider");
  return ctx;
};

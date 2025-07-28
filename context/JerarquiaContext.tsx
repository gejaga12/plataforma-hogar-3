import { JerarquiaNodo, JerarquiaService } from "@/api/apiJerarquia";
import { createContext, useEffect, useState } from "react";

interface JerarquiaContextType {
  jerarquia: JerarquiaNodo[] | undefined;
  areas: string[];
  isLoading: boolean;
  refetchJerarquia: () => Promise<void>;
}

export const JerarquiaContext = createContext<JerarquiaContextType | undefined>(
  undefined
);

export const JerarquiaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [jerarquia, setJerarquia] = useState<JerarquiaNodo[] | undefined>(
    undefined
  );
  const [areas, setAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchJerarquia = async () => {
    try {
      setIsLoading(true);
      const data = await JerarquiaService.getJerarquiaCompleta();

      console.log("arbol de jerarquia:", data);

      setJerarquia(data.tree);
      setAreas(data.areas);
    } catch (error) {
      console.error("Error al obtener el árbol de jerarquía:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJerarquia();
  }, []);

  return (
    <JerarquiaContext.Provider
      value={{
        jerarquia,
        areas,
        isLoading,
        refetchJerarquia: fetchJerarquia,
      }}
    >
      {children}
    </JerarquiaContext.Provider>
  );
};

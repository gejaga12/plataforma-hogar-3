// Obtiene el token desde localStorage
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth-token");
  }
  return null;
};

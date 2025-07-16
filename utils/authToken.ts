// Obtiene el token desde localStorage
export const getAuthToken = () => {
  return localStorage.getItem("auth-token");
};

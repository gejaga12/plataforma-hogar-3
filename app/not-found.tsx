import { Home } from "lucide-react";
import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center bg-white px-4 text-center overflow-hidden">
      {/* Ícono Home como fondo decorativo */}
      <Home
        className="absolute z-0 text-orange-500 left-1/3 top-1/2 transform -translate-x-[30%] -translate-y-1/2 opacity-40"
        size={300}
      />
      <div className="max-w-md">
        <h1 className="text-[8rem] font-extrabold text-orange-600 leading-none">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 bg-white/70 p-1 rounded-lg">
          Página no encontrada
        </h2>
        <p className="text-black mb-6">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;

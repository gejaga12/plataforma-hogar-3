import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 text-center">
      <div className="max-w-md">
        {/* <img
          src="/images/404-illustration.svg"
          alt="Not Found Illustration"
          className="w-64 mx-auto mb-6"
        /> */}
        <h1 className="text-[8rem] font-extrabold text-orange-600 leading-none">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          ¡Ups! Página no encontrada
        </h2>
        <p className="text-gray-600 mb-6">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <a
          href="/#"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;

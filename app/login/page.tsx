"use client";

import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Imagen de fondo que cubre toda la pantalla */}
      <Image
        src="/images/fondo-nuevo.jpeg"
        alt="fondo"
        fill
        priority
        className="object-cover z-0"
      />
      {/* Logo en la esquina superior derecha */}
      <div className="absolute top-52 right-52 z-10">
        <Image
          src="/images/hogarLogo.png"
          alt="Logo Hogar"
          width={500}
          height={500}
        />
      </div>

      {/* Contenedor del formulario a la derecha */}
      <div className="relative z-10 flex justify-start items-center h-full w-full px-10">
        <div className="w-full max-w-md p-8 rounded-lg shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

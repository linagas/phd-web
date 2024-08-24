"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Maintenance() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    // Función para manejar el cambio de modo nocturno
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Crear un MediaQueryList para detectar el modo nocturno
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    // Establecer el estado inicial basado en la preferencia del usuario
    setIsDarkMode(darkModeMediaQuery.matches);
    if (darkModeMediaQuery.matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Agregar el listener para cambios en el modo nocturno
    darkModeMediaQuery.addEventListener("change", handleDarkModeChange);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      darkModeMediaQuery.removeEventListener("change", handleDarkModeChange);
    };
  }, []);

  console.log(isDarkMode);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#E9CEE]">
      <div className="animate-pulse">
        <Image
          src={isDarkMode ? "/phd-white@300x.png" : "/phd-black@300x.png"}
          alt="PHD logo"
          width={300}
          height={300}
        />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground text-center sm:text-4xl">
        Sitio web en mantenimiento
      </h1>
      <p className="mt-2 text-lg text-muted-foreground text-center">
        Proximamente disponible, estamos trabajando para mejorar su experiencia.
      </p>
    </div>
  );
}

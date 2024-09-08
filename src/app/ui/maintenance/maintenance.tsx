"use client";
import Image from "next/image";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function Maintenance() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-pulse">
        <Image
          src={
            isDarkMode
              ? "/assets/phd-white@300x.png"
              : "/assets/phd-black@300x.png"
          }
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

"use client";
import Image from "next/image";
import Link from "next/link";
import CustomDot from "@/app/components/custom-dot";
import useScrollToSection from "@/hooks/useScrollToSection";

export default function AboutHero() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section
      id="about-hero-section"
      aria-labelledby="about-hero-heading"
      className="flex w-full flex-col md:flex-row items-center gap-8 py-12 md:py-20 px-4 md:px-16"
    >
      {/* Columna texto */}
      <article
        className="flex-1 flex flex-col items-center md:items-start text-center md:text-left"
        data-aos="fade-right"
        data-aos-duration="700"
      >
        <span className="text-pink-400 font-bold uppercase tracking-widest text-sm mb-4">
          Un equipo con un propósito claro.
        </span>
        <h1
          id="about-hero-heading"
          className="text-blue-1 font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
        >
          Somos PHD
        </h1>
        <p className="text-gray-700 leading-relaxed mb-8 max-w-lg text-lg">
          No somos solo testers. Somos partners estratégicos que se integran a
          tu equipo para garantizar que la calidad no sea un paso final, sino
          parte de cada decisión.
        </p>
        <Link
          href="#section-contact"
          onClick={scrollToContact}
          className="inline-flex w-full md:w-auto text-white items-center justify-center rounded-[4px] bg-blue-1 hover:bg-blue-400 px-8 py-3 text-lg font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Ir a la sección de contacto"
        >
          Contáctanos
        </Link>
      </article>

      {/* Columna imagen */}
      <article
        className="flex-1 justify-center items-center relative hidden md:flex"
        data-aos="fade-left"
        data-aos-duration="700"
        data-aos-delay="100"
      >
        {/* Punto decorativo posicionado en la esquina superior derecha del contenedor */}
        <div className="absolute top-2 right-2 z-10">
          <CustomDot
            baseSize="w-[24px] h-[24px]"
            lgSize="lg:w-[36px] lg:h-[36px]"
            color="bg-pink-400"
          />
        </div>
        {/* Fondo decorativo azul suave detrás de la imagen */}
        <div className="relative w-full">
          <div
            className="absolute inset-0 rounded-3xl bg-blue-1 opacity-5"
            aria-hidden="true"
          />
          <Image
            src="/assets/phd-virtual-team-lineal.png"
            width={700}
            height={480}
            alt="Ilustración del equipo PHD: profesionales especializados en Quality Engineering"
            className="relative rounded-2xl w-full object-contain mix-blend-multiply"
            priority
          />
        </div>
      </article>
    </section>
  );
}

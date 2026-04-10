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
      <article className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        <span className="text-pink-400 font-bold uppercase tracking-widest text-sm mb-4">
          Somos PHD
        </span>
        <h1
          id="about-hero-heading"
          className="text-blue-1 font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
        >
          Un equipo con un propósito claro.
        </h1>
        <p className="text-gray-700 leading-relaxed mb-8 max-w-lg">
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
      <article className="flex-1 justify-center items-start relative hidden md:flex">
        <div className="absolute top-0 right-0">
          <CustomDot
            baseSize="w-[34px] h-[34px]"
            lgSize="lg:w-[56px] lg:h-[56px]"
            color="bg-pink-400"
          />
        </div>
        <Image
          src="/assets/imagen-computador.svg"
          width={440}
          height={440}
          alt="Ilustración de servicios de calidad de software"
          className="rounded-lg w-full max-w-md"
          priority
        />
      </article>
    </section>
  );
}

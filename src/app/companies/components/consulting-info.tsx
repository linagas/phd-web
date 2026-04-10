"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "@/app/components/card";
import useScrollToSection from "@/hooks/useScrollToSection";

const consultingCards = [
  {
    key: "consulting-01",
    title: "EVALUACIÓN DE PROCESOS",
    description:
      "Detectamos fortalezas y oportunidades de mejora en tu proceso de desarrollo.",
    src: "/assets/plan-de-mejora.svg",
    alt: "Evaluación de procesos",
  },
  {
    key: "consulting-02",
    title: "ANÁLISIS DE BRECHAS",
    description:
      "Comparamos tu proceso actual con las mejores prácticas del mercado.",
    src: "/assets/analisis-gap.svg",
    alt: "Análisis de brechas",
  },
  {
    key: "consulting-03",
    title: "PLAN DE MEJORA",
    description:
      "Diseñamos un plan de acción a medida para optimizar la calidad.",
    src: "/assets/plan-de-mejora-2.svg",
    alt: "Plan de mejora",
  },
  {
    key: "consulting-04",
    title: "PLAN DE GESTIÓN DE CAMBIOS",
    description:
      "Guiamos a tu equipo en la adopción efectiva de nuevas prácticas y herramientas.",
    src: "/assets/analisis-gap.svg",
    alt: "Gestión de cambios",
  },
];

export default function ConsultingInfo() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section
      id="consulting-info-section"
      className="flex flex-col md:flex-row justify-between py-14 gap-10"
    >
      <article className="flex-1 flex justify-center items-center hidden md:flex lg:flex">
        <div className="relative">
          <div
            className="absolute inset-0 w-full h-full rounded-2xl -translate-x-4 translate-y-64"
            style={{
              backgroundImage: "url('/assets/trazado-fucsia.svg')",
              backgroundSize: "contain",
              backgroundPosition: "bottom",
              backgroundRepeat: "no-repeat",
              top: "-45%",
            }}
            aria-hidden="true"
            data-aos="fade-up"
          ></div>

          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={"/assets/mujer-ia-2x.png"}
              width={600}
              height={600}
              alt="Consultoría de calidad de software"
              className="w-full h-auto object-cover"
              data-aos="fade-up"
            />
          </div>
        </div>
      </article>

      <article className="flex-1">
        <div className="flex flex-col gap-[25px] justify-center items-center md:items-start w-auto">
          {consultingCards.map((card) => (
            <div key={card.key} data-aos="fade-up" className="w-full">
              <Card
                title={card.title}
                description={card.description}
                className="flex-grow-0 flex-shrink-0 w-full max-md:767 max-h-[200px] card-pink-style"
                rounded="rounded-[23px]"
                iconPosition="left"
                icon={
                  <Image
                    src={card.src}
                    width={100}
                    height={100}
                    alt={card.alt}
                    className="object-cover"
                  />
                }
              />
            </div>
          ))}

          <Link
            className="inline-flex self-end md:self-start w-56 text-white items-center justify-center rounded-[4px] bg-pink-400 px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            href="#section-contact"
            onClick={scrollToContact}
            prefetch={false}
            aria-label="Agendar una llamada en la sección de contacto"
          >
            AGENDA UNA LLAMADA
          </Link>
        </div>
      </article>
    </section>
  );
}

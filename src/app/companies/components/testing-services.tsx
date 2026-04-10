"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "@/app/components/card";
import CustomDot from "@/app/components/custom-dot";
import useScrollToSection from "@/hooks/useScrollToSection";

const testingCards = [
  {
    title: "IA aplicada a pruebas",
    description:
      "Automatización inteligente que detecta errores temprano y amplía la cobertura sin crecer el equipo.",
    asset: "/assets/pruebas-manuales.svg",
  },
  {
    title: "Pruebas automatizadas",
    description:
      "Diseñamos pruebas que reducen tiempos de validación y protegen cada nueva versión.",
    asset: "/assets/pruebas-automatizadas.svg",
  },
  {
    title: "Pruebas de rendimiento",
    description:
      "Evaluamos estabilidad y escalabilidad bajo cargas reales de uso.",
    asset: "/assets/pruebas-performance.svg",
  },
];

export default function TestingServices() {
  const { scrollToSection: scrollToContact } = useScrollToSection(
    "section-contact",
    100
  );

  return (
    <section
      id="testing-services-section"
      className="flex flex-col w-full py-14 space-y-12"
    >
      <article className="relative h-[200px] md:h-[300px] lg:h-[400px] w-full flex items-center justify-center text-center overflow-hidden">
        <Image
          src="/assets/trazado-azul-3.png"
          alt="Fondo curvo azul decorativo"
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-black/40 z-0" aria-hidden="true" />
        <div className="relative z-10 px-4">
          <h2 className="text-white text-3xl md:text-5xl font-bold">
            SERVICIO DE PRUEBAS
          </h2>
        </div>
      </article>

      <div className="flex flex-row items-center gap-6 px-6 md:px-12">
        <div className="flex flex-row gap-6">
          {testingCards.map((card, i) => (
            <div
              id={`card-${i}`}
              key={i}
              className="flex flex-col justify-center gap-4 items-center max-w-[432px]"
              data-aos="fade-up"
              data-aos-delay={`${i * 100}`}
              data-aos-duration="1000"
            >
              <Card
                title={card.title}
                description={card.description}
                className="flex-grow-0 flex-shrink-0 w-full max-md:767 overflow-auto card-blue-style"
                rounded="rounded-[50px]"
                iconPosition="top"
                height="h-[418px]"
                icon={
                  <Image
                    src={card.asset}
                    width={78}
                    height={78}
                    alt={card.title}
                    className="object-cover"
                  />
                }
              />
              <Link
                className="inline-flex self-center w-48 text-white items-center justify-center rounded-[24px] bg-blue-1 px-4 py-2 text-xl font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                href="#section-contact"
                onClick={scrollToContact}
                prefetch={false}
                aria-label="Agendar una llamada en la sección de contacto"
              >
                AGENDA UNA LLAMADA
              </Link>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-start justify-start">
          <CustomDot
            baseSize="w-[82px] h-[82px]"
            lgSize="lg:w-[56px] lg:h-[56px]"
            color="bg-purple-400"
          />
        </div>
      </div>
    </section>
  );
}
